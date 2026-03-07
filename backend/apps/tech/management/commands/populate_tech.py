import csv
import os
import re
import unicodedata

from apps.tech.models import (
    Brand,
    Color,
    DeviceType,
    Part,
    PartType,
    ProductModel,
    ProductVariant,
    QualityTier,
    Series,
)
from django.core.management.base import BaseCommand

# ── pure helpers (no DB) ───────────────────────────────────────────────────────


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


def _norm(s: str) -> str:
    """Lowercase + NFC-normalize for reliable substring matching."""
    return unicodedata.normalize("NFC", s.lower())


# Stock-TSV "Categorie" → (canonical DeviceType name, domain)
_CATEGORY_MAP = {
    "réparation": ("Smartphone", "PHONES"),
    "protection": ("Smartphone", "PHONES"),
    "téléphonie": ("Smartphone", "PHONES"),
    "gsm": ("Smartphone", "PHONES"),
    "mobile": ("Smartphone", "PHONES"),
    "informatique": ("Ordinateur", "COMPUTERS"),
    "ordinateur": ("Ordinateur", "COMPUTERS"),
    "laptop": ("Ordinateur", "COMPUTERS"),
    "tablette": ("Tablette", "COMPUTERS"),
    "tablet": ("Tablette", "COMPUTERS"),
    "accessoire": ("Accessoire", "PHONES"),
    "divers": ("Divers", "PHONES"),
}


def _device_type_for_category(category: str):
    key = _norm(category)
    for fragment, result in _CATEGORY_MAP.items():
        if fragment in key:
            return result
    return (category.strip() or "Divers", "PHONES")


# Buyback / Compatibilité model string → brand
_BRAND_RULES = [
    ("Apple", ["iPhone", "iPad", "MacBook", "iMac", "Apple Watch", "AirPods"]),
    ("Samsung", ["Galaxy", "Samsung"]),
    ("Google", ["Pixel"]),
    ("Acer", ["Acer", "Chromebook"]),
    ("Dell", ["Dell", "DELL", "Latitude", "XPS", "Inspiron", "Precision"]),
    ("Lenovo", ["Lenovo", "ThinkPad", "IdeaPad", "Legion", "Yoga"]),
    ("HP", ["HP ", "Spectre", "Pavilion", "EliteBook", "ProBook", "Omen"]),
    ("Asus", ["Asus", "ASUS", "ZenBook", "VivoBook", "ROG"]),
    ("Huawei", ["Huawei", "Honor"]),
    ("Xiaomi", ["Xiaomi", "Redmi", "POCO"]),
    ("OnePlus", ["OnePlus"]),
    ("Sony", ["Sony", "Xperia"]),
]


def _brand_for_model(model_raw: str) -> str:
    for brand_name, keywords in _BRAND_RULES:
        if any(kw in model_raw for kw in keywords):
            return brand_name
    return "Generic"


# Buyback model string → (DeviceType name, domain)
_DEVICE_TYPE_RULES = [
    (
        [
            "iPhone",
            "Galaxy A",
            "Galaxy S",
            "Galaxy Note",
            "Galaxy Z",
            "Pixel",
            "Redmi",
            "Xperia",
            "OnePlus",
        ],
        "Smartphone",
        "PHONES",
    ),
    (["iPad"], "Tablette", "COMPUTERS"),
    (["MacBook", "iMac"], "Ordinateur", "COMPUTERS"),
    (
        [
            "IdeaPad",
            "ThinkPad",
            "Chromebook",
            "Latitude",
            "XPS",
            "Inspiron",
            "Precision",
            "Spectre",
            "EliteBook",
            "ZenBook",
            "VivoBook",
            "Pavilion",
            "Omen",
            "Laptop",
        ],
        "Ordinateur",
        "COMPUTERS",
    ),
    (["Watch", "watch"], "Montre", "PHONES"),
    (["AirPods", "Buds"], "Audio", "PHONES"),
]


def _device_type_for_model(model_raw: str):
    for keywords, name, domain in _DEVICE_TYPE_RULES:
        if any(kw in model_raw for kw in keywords):
            return name, domain
    return "Divers", "PHONES"


# Buyback model string → Series name (product line, not full model name)
_SERIES_RULES = [
    (r"iPhone\s*(\d+)", lambda m: f"iPhone {m.group(1)}"),
    (r"iPad\s*(Pro|Air|Mini)", lambda m: f"iPad {m.group(1)}"),
    (r"iPad", lambda m: "iPad"),
    (r"MacBook\s*(Air|Pro)", lambda m: f"MacBook {m.group(1)}"),
    (r"Galaxy\s*S\d+", lambda m: "Galaxy S"),
    (r"Galaxy\s*A\d+", lambda m: "Galaxy A"),
    (r"Galaxy\s*Note", lambda m: "Galaxy Note"),
    (r"Galaxy\s*Z\s*Fold", lambda m: "Galaxy Z Fold"),
    (r"Galaxy\s*Z\s*Flip", lambda m: "Galaxy Z Flip"),
    (r"Pixel\s*\d+", lambda m: "Google Pixel"),
    (r"IdeaPad", lambda m: "IdeaPad"),
    (r"ThinkPad", lambda m: "ThinkPad"),
    (r"Latitude", lambda m: "Latitude"),
    (r"XPS", lambda m: "XPS"),
    (r"Chromebook", lambda m: "Chromebook"),
]


def _series_for_model(model_raw: str) -> str:
    for pattern, formatter in _SERIES_RULES:
        m = re.search(pattern, model_raw, re.IGNORECASE)
        if m:
            return formatter(m)
    words = model_raw.strip().split()
    return " ".join(words[:2]) if len(words) >= 2 else model_raw.strip()


# Fallback Part-type inference (used when "Type de Pièce" column is blank)
_PART_TYPE_PATTERNS = [
    ("Batterie", ["batterie"]),
    ("Connecteur de Charge", ["connecteur de charge"]),
    ("Nappe et Autres", ["nappe"]),
    ("Coque de Réparation", ["coque de réparation", "coque de reparation"]),
    ("Vitre Arrière", ["vitre arrière", "vitre arriere"]),
    ("Cache Arrière", ["cache arrière", "cache arriere"]),
    ("Lentille Caméra", ["lentille"]),
    ("SSD SATA", ["ssd"]),
    ("Adhésif", ["stickers adhésif", "stickers adhesif", "adhésif", "adhesif"]),
    ("Ecran", ["ecran", "lcd", "oled", "tactile"]),
    ("Appareil Reconditionné", ["smartphone occasion"]),
    (
        "Carte Mémoire",
        ["carte mémoire", "carte memoire", "microsd", "microsdxc", "microsdhc"],
    ),
    ("Protection", ["coque", "etui", "verre trempé", "verre trempe"]),
    ("Câble / Adaptateur", ["câble", "cable", "adaptateur"]),
    (
        "Consommable Magasin",
        ["lingette", "alcool isopropylique", "nettoyant circuits", "nettoyant"],
    ),
    ("Outillage", ["tournevis"]),
    ("Emballage", ["boite pour smartphone"]),
]

_BRAND_FROM_PART_PATTERNS = [
    ("Apple", ["iphone", "ipad", "macbook", "imac", "apple watch", "airpods"]),
    ("Samsung", ["samsung", "galaxy"]),
    ("Xiaomi", ["xiaomi", "redmi", "poco"]),
    ("PNY", ["pny"]),
    ("Kingston", ["kingston"]),
    ("Crosscall", ["crosscall"]),
    ("Dell", ["dell", "latitude", "xps"]),
    ("Lenovo", ["lenovo", "ideapad", "thinkpad"]),
]


def _infer_part_type(name: str, sous_cat: str = "") -> str:
    """Fallback: infer PartType name from product name when column is blank."""
    n = _norm(name)
    for pt, kws in _PART_TYPE_PATTERNS:
        if any(_norm(kw) in n for kw in kws):
            return pt
    return sous_cat.strip() or "Divers"


def _infer_brand_for_part(name: str) -> str:
    """Fallback: infer brand from part product name when column is blank."""
    n = _norm(name)
    for brand, kws in _BRAND_FROM_PART_PATTERNS:
        if any(kw in n for kw in kws):
            return brand
    return "Générique"


# ── management command ─────────────────────────────────────────────────────────


class Command(BaseCommand):
    help = "GLOBAL DEPLOYMENT: Populates master catalog from TSVs with NO owner"

    def handle(self, *args, **options):
        STOCK_FILE = "data/parts.tsv"
        BUYBACK_FILE = "data/buyback.tsv"

        if os.path.exists(STOCK_FILE):
            self.stdout.write(
                self.style.MIGRATE_LABEL(f"Importing parts:    {STOCK_FILE}")
            )
            self.import_stock(STOCK_FILE)
        else:
            self.stdout.write(self.style.ERROR(f"Missing: {STOCK_FILE}"))

        if os.path.exists(BUYBACK_FILE):
            self.stdout.write(
                self.style.MIGRATE_LABEL(f"Importing buybacks: {BUYBACK_FILE}")
            )
            self.import_buybacks(BUYBACK_FILE)
        else:
            self.stdout.write(self.style.ERROR(f"Missing: {BUYBACK_FILE}"))

    # ── private DB helpers ─────────────────────────────────────────────────────

    def _get_or_create_device_type(self, name: str, domain: str) -> DeviceType:
        """
        DeviceType requires a unique `slug` and a non-blank `domain`.
        """
        slug = _slugify(name)
        base_slug, counter = slug, 1
        while DeviceType.objects.filter(slug=slug).exclude(name=name).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        dev_type, _ = DeviceType.objects.get_or_create(
            name=name,
            defaults={
                "slug": slug,
                "domain": domain,
                "description": f"Imported: {name}",
                "is_active": True,
            },
        )
        return dev_type

    def _get_or_create_quality_tier(self, name: str) -> QualityTier:
        """QualityTier has unique_together = ("name", "owner") — owner=None is explicit."""
        tier, _ = QualityTier.objects.get_or_create(name=name, owner=None)
        return tier

    def _get_or_create_color(self, name: str) -> Color:
        """Same unique_together constraint as QualityTier."""
        color, _ = Color.objects.get_or_create(name=name, owner=None)
        return color

    def _get_or_create_product_model_for_compat(
        self, compat_str: str, fallback_brand: str = "Generic"
    ) -> ProductModel:
        """
        Get or create a ProductModel from a compatibility string such as
        'iPhone 12 mini' or 'Galaxy A7 2018 A750'.

        Used when linking compatible_models on a Part.
        """
        model_name = compat_str.strip()
        if not model_name:
            raise ValueError("Empty compatibility string")

        # Brand: try rule-based detection; fall back to the part's own brand
        brand_name = _brand_for_model(model_name)
        if brand_name == "Generic":
            brand_name = fallback_brand

        dt_name, dt_domain = _device_type_for_model(model_name)
        dev_type = self._get_or_create_device_type(dt_name, dt_domain)
        brand, _ = Brand.objects.get_or_create(name=brand_name)

        series_name = _series_for_model(model_name)
        series, _ = Series.objects.get_or_create(
            name=series_name,
            brand=brand,
            defaults={"device_type": dev_type},
        )

        product_model, _ = ProductModel.objects.get_or_create(
            name=model_name,
            brand=brand,
            defaults={
                "device_type": dev_type,
                "series": series,
                "is_serialized": True,
                "owner": None,
            },
        )
        return product_model

    # ── import: spare parts ────────────────────────────────────────────────────

    def import_stock(self, path):
        """
        Reads the Stock Pièces TSV and creates Part instances (concrete subclass
        of BaseProduct) — NOT raw BaseProduct rows.

        Each Part gets:
          • part_type  – from the "Type de Pièce" column (inferred if blank)
          • brand      – from the "Marque" column (inferred if blank)
          • compatible_models – M2M, populated from the "Compatibilité" column
        """
        created = updated = skipped = 0

        with open(path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                if not row.get("Produit"):
                    skipped += 1
                    continue

                try:
                    prod_name = row["Produit"].strip()
                    sous_cat = row.get("Sous Categorie", "").strip()

                    # ── DeviceType (used for compatible model creation) ─────
                    raw_cat = row.get("Categorie", "Divers").strip()
                    dt_name, dt_domain = _device_type_for_category(raw_cat)
                    dev_type = self._get_or_create_device_type(dt_name, dt_domain)

                    # ── Brand ─────────────────────────────────────────────
                    brand_name = row.get("Marque", "").strip()
                    if not brand_name:
                        brand_name = _infer_brand_for_part(prod_name)
                    brand, _ = Brand.objects.get_or_create(name=brand_name)

                    # ── PartType ──────────────────────────────────────────
                    part_type_name = row.get("Type de Pièce", "").strip()
                    if not part_type_name:
                        part_type_name = _infer_part_type(prod_name, sous_cat)
                    part_type, _ = PartType.objects.get_or_create(name=part_type_name)

                    # ── Part (concrete subclass of BaseProduct via MTI) ────
                    # NOTE: Part.objects.get_or_create looks up the `part` table
                    # (joined to `base_product`), so raw BaseProduct rows are
                    # never matched here — correct behaviour on re-runs.
                    part, part_created = Part.objects.get_or_create(
                        name=prod_name,
                        owner=None,
                        defaults={
                            "brand": brand,
                            "part_type": part_type,
                            "is_serialized": False,
                        },
                    )

                    # Keep brand / part_type fresh on subsequent imports
                    needs_save = False
                    if part.brand != brand:
                        part.brand = brand
                        needs_save = True
                    if part.part_type != part_type:
                        part.part_type = part_type
                        needs_save = True
                    if needs_save:
                        part.save()

                    # ── compatible_models (M2M) ───────────────────────────
                    compat_raw = row.get("Compatibilité", "").strip()
                    if compat_raw:
                        # Support comma-separated list in the Compatibilité cell
                        for compat_str in compat_raw.split(","):
                            compat_str = compat_str.strip()
                            if not compat_str:
                                continue
                            try:
                                pm = self._get_or_create_product_model_for_compat(
                                    compat_str, fallback_brand=brand_name
                                )
                                part.compatible_models.add(pm)
                            except Exception as exc:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"  ⚠ Compat model '{compat_str}' skipped: {exc}"
                                    )
                                )

                    # ── Quality / Color / Price ───────────────────────────
                    quality = (
                        self._get_or_create_quality_tier(row["Qualité"].strip())
                        if row.get("Qualité")
                        else None
                    )
                    color = (
                        self._get_or_create_color(row["Variante"].strip())
                        if row.get("Variante")
                        else None
                    )

                    raw_price = (
                        row.get("Prix d'achat HT", "0")
                        .replace("€", "")
                        .replace("\xa0", "")
                        .replace(" ", "")
                        .replace(",", ".")
                        .strip()
                    )
                    try:
                        cost = float(raw_price)
                    except ValueError:
                        cost = 0.0

                    sku = (
                        row.get("ENA", "").strip()
                        or row.get("Code interne Fournisseur", "").strip()
                        or None
                    )

                    # ── ProductVariant — product FK points to the Part ────
                    # Part IS a BaseProduct (Django MTI), so the FK is valid.
                    _, was_created = ProductVariant.objects.update_or_create(
                        sku=sku,
                        defaults={
                            "product": part,  # ← Part, not raw BaseProduct
                            "name": prod_name,
                            "cost_price": cost,
                            "retail_price": cost * 2.0,
                            "quality_tier": quality,
                            "color": color,
                        },
                    )
                    if was_created:
                        created += 1
                    else:
                        updated += 1

                except Exception as exc:
                    self.stdout.write(
                        self.style.ERROR(f"  ✗ [{row.get('Produit', '?')}]: {exc}")
                    )
                    skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"  Parts — created: {created}, updated: {updated}, skipped: {skipped}"
            )
        )

    # ── import: buybacks / second-hand ────────────────────────────────────────

    def import_buybacks(self, path):
        """
        Reads the Rachat/Reprise TSV and creates ProductModel instances (concrete
        subclass of BaseProduct via MTI) — NOT a raw BaseProduct + a separate
        ProductModel.

        The ProductVariant.product FK is set to the ProductModel directly,
        so the device appears correctly in the repair catalogue and the
        parts-compatibility matrix.
        """
        created = updated = skipped = 0

        with open(path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                # Strip all keys to handle trailing-space column headers
                row = {k.strip(): v for k, v in row.items()}

                model_raw = row.get("MODEL", "").strip()
                if not model_raw:
                    skipped += 1
                    continue

                try:
                    # "Occasion/Rachat" is a business workflow, not a DeviceType.
                    # Infer the real category from the model string.
                    dt_name, dt_domain = _device_type_for_model(model_raw)
                    dev_type = self._get_or_create_device_type(dt_name, dt_domain)

                    brand_name = _brand_for_model(model_raw)
                    brand, _ = Brand.objects.get_or_create(name=brand_name)

                    # Series = product *line* ("iPhone 13", "Galaxy S", "IdeaPad"),
                    # not the full model name or a business category like "Rachat".
                    series_name = _series_for_model(model_raw)
                    series, _ = Series.objects.get_or_create(
                        name=series_name,
                        brand=brand,
                        defaults={"device_type": dev_type},
                    )

                    # ── ProductModel (concrete subclass of BaseProduct via MTI) ──
                    # Django MTI: creating a ProductModel automatically creates
                    # the parent BaseProduct row.  We do NOT create a separate
                    # raw BaseProduct here — that was the original bug.
                    product_model, _ = ProductModel.objects.get_or_create(
                        name=model_raw,
                        brand=brand,
                        defaults={
                            "device_type": dev_type,
                            "series": series,
                            "is_serialized": True,
                            "owner": None,
                        },
                    )

                    # ── Grade / SKU / Prices ──────────────────────────────
                    grade_raw = row.get("Grade", "Grade B").strip() or "Grade B"
                    quality = self._get_or_create_quality_tier(grade_raw)

                    sku = (
                        str(row.get("IMEI", "")).strip()
                        or str(row.get("No ID", "")).strip()
                        or None
                    )
                    if not sku:
                        self.stdout.write(
                            self.style.WARNING(
                                f"  ⚠ Skipping '{model_raw}': no IMEI / No ID"
                            )
                        )
                        skipped += 1
                        continue

                    try:
                        cost = float(row.get("Prix d'achat", 0) or 0)
                    except (ValueError, TypeError):
                        cost = 0.0
                    try:
                        retail = float(row.get("Prix de vente", 0) or 0)
                    except (ValueError, TypeError):
                        retail = 0.0

                    battery = row.get("Batterie %", "").strip()
                    is_sold = row.get("Statut", "").strip().lower() == "vendu"

                    # Battery / IMEI metadata goes in `description` (no raw
                    # `quantity` or `notes` fields on ProductVariant).
                    # ProductVariant.product FK points to the ProductModel,
                    # not to the raw BaseProduct — this is the fix.
                    _, was_created = ProductVariant.objects.update_or_create(
                        sku=sku,
                        defaults={
                            "product": product_model,  # ← ProductModel, not raw BaseProduct
                            "name": model_raw,
                            "cost_price": cost,
                            "retail_price": retail,
                            "quality_tier": quality,
                            "description": f"IMEI: {sku} | Battery: {battery}"
                            + (" | Vendu" if is_sold else ""),
                        },
                    )
                    if was_created:
                        created += 1
                    else:
                        updated += 1

                except Exception as exc:
                    self.stdout.write(self.style.ERROR(f"  ✗ [{model_raw}]: {exc}"))
                    skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"  Buybacks — created: {created}, updated: {updated}, skipped: {skipped}"
            )
        )
