import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Watch,
  Gamepad2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useRouter } from "next/navigation";

const commonIssues = [
  "Écran cassé",
  "Batterie défectueuse",
  "Problème de charge",
  "Bouton power cassé",
  "Bouton volume cassé",
  "Caméra défectueuse",
  "Haut-parleur ne fonctionne pas",
  "Microphone défectueux",
  "Problème Wi-Fi",
  "Problème Bluetooth",
  "Problème de réseau",
  "Surchauffe",
  "Dégât des eaux",
];

export function IssuesStep() {
  const router = useRouter();
  const { formData, setFormData, nextStep, prevStep } = useAddReparationStore();

  const selectedIssues = formData.issues || [];
  const issueDescription = formData.issueDescription || "";
  const password = formData.password || "";
  const depositStatus = formData.depositStatus || "deposited";

  const toggleIssue = (issue: string) => {
    const updatedIssues = selectedIssues.includes(issue)
      ? selectedIssues.filter((i) => i !== issue)
      : [...selectedIssues, issue];
    setFormData({ issues: updatedIssues });
  };

  const canProceed = selectedIssues.length > 0;

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Problèmes rencontrés</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez tous les problèmes qui s'appliquent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {commonIssues.map((issue) => (
          <button
            key={issue}
            onClick={() => toggleIssue(issue)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all hover:border-primary/50",
              selectedIssues.includes(issue)
                ? "border-primary bg-primary/5"
                : "border-border bg-card",
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                selectedIssues.includes(issue)
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/50",
              )}
            >
              {selectedIssues.includes(issue) && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </div>
            <span className="text-sm font-medium">{issue}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description détaillée</Label>
          <Textarea
            id="description"
            placeholder="Décrivez le problème en détail..."
            value={issueDescription}
            onChange={(e) => setFormData({ issueDescription: e.target.value })}
            rows={4}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accessories">Accessoires fournis</Label>
            <Input
              id="accessories"
              placeholder="ex: Chargeur, Étui..."
              value={formData.accessories?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  accessories: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : [],
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Code de déverrouillage</Label>
            <Input
              id="password"
              placeholder="Code PIN ou mot de passe"
              value={password}
              onChange={(e) => setFormData({ password: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="deposit"
            checked={depositStatus === "deposited"}
            onCheckedChange={(checked) =>
              setFormData({
                depositStatus: checked ? "deposited" : "scheduled",
              })
            }
          />
          <Label htmlFor="deposit" className="cursor-pointer">
            Acompte reçu
          </Label>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline" size="lg">
          Retour
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} size="lg">
          Suivant
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

