"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";
import { commandsApi } from "@/services/api/commands";
import { productsApi } from "@/services/api/products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import { useRepairs } from "@/hooks/use-repairs";
import { useCommonIssues } from "@/hooks/use-common-issues";
import { type Supplier, type Repair, type Issue } from "@/types";

const formSchema = z.object({
  order_name: z.string().min(2, {
    message: "Nom de la commande requis (minimum 2 caractères).",
  }),
  description: z.string().optional(),
  supplier_ids: z.array(z.number()).min(1, {
    message: "Au moins un fournisseur doit être sélectionné.",
  }),
  estimated_delivery_date: z.date({
    required_error: "Date de livraison estimée requise.",
  }),
  repair_id: z.number().optional(),
  issue_ids: z.array(z.number()).optional(),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

export interface CommandFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CommandForm({ onSuccess, onCancel, className }: CommandFormProps) {
  const router = useRouter();
  const { data: suppliersData } = useSuppliers();
  const { data: repairsData } = useRepairs(1); // Get first page of repairs
  const suppliers = suppliersData?.results || [];
  const repairs = repairsData?.results || [];

  // Using products with filtering options
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [suggestedParts, setSuggestedParts] = useState<any[]>([]);

  // Get issues based on selected repair's device type
  const deviceType = selectedRepair?.product_model ? selectedRepair.product_model : undefined;
  const { data: issuesData } = useCommonIssues(deviceType as string);

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.fetchProducts();
        setProducts(response.results || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Erreur lors du chargement des produits");
      }
    };

    fetchProducts();
  }, []);

  // Update suggested parts when repair is selected
  useEffect(() => {
    if (selectedRepair && selectedRepair.issues && Array.isArray(selectedRepair.issues)) {
      // In a real implementation, we'd map issue IDs to parts needed
      // For now, we'll simulate this by creating suggested parts
      const simulatedSuggestedParts = selectedRepair.issues.map((issue: any) => ({
        id: Math.random(),
        name: `Pièce pour ${typeof issue === 'string' ? issue : issue.name || 'problème'}`,
        quantity: 1,
        description: `Pièce suggérée pour le problème: ${typeof issue === 'string' ? issue : issue.name || 'non spécifié'}`
      }));
      setSuggestedParts(simulatedSuggestedParts);
    } else {
      setSuggestedParts([]);
    }
  }, [selectedRepair]);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_name: "",
      description: "",
      supplier_ids: [],
      estimated_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      repair_id: undefined,
      issue_ids: [],
      notes: "",
      reference: "",
    },
  });

  // Form state
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    id: number;
    name: string;
    quantity: number;
  }>>([]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Create store order with associated repair if selected
      const orderData = {
        order_name: values.order_name,
        description: values.description,
        suppliers: values.supplier_ids,
        estimated_delivery_date: format(values.estimated_delivery_date, "yyyy-MM-dd"),
        notes: values.notes,
        reference: values.reference,
      };

      await commandsApi.createStoreOrder(orderData);
      toast.success("Commande créée avec succès !");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/commandes");
      }
    } catch (error) {
      console.error("Error creating store order:", error);
      toast.error("Erreur lors de la création de la commande");
    }
  }

  // Supplier selection handler
  const toggleSupplier = (supplierId: number) => {
    const currentValues = form.getValues("supplier_ids");
    if (currentValues.includes(supplierId)) {
      form.setValue("supplier_ids", currentValues.filter((id) => id !== supplierId));
    } else {
      form.setValue("supplier_ids", [...currentValues, supplierId]);
    }
  };

  // Handle repair selection
  const handleRepairSelection = (repairId: number) => {
    const repair = repairs.find(r => r.id === repairId);
    if (repair) {
      setSelectedRepair(repair);
      form.setValue("repair_id", repairId);

      // Update order name to be more descriptive
      if (!form.getValues("order_name")) {
        form.setValue("order_name", `Commande pour réparation ${repair.uid}`);
      }
    }
  };

  // Handle adding suggested part to selection
  const handleAddSuggestedPart = (part: any) => {
    const newSelectedProduct = {
      id: part.id,
      name: part.name,
      quantity: part.quantity
    };

    // Check if part is already in selection
    const exists = selectedProducts.some(p => p.id === part.id);
    if (!exists) {
      setSelectedProducts([...selectedProducts, newSelectedProduct]);
      toast.success(`Pièce ajoutée: ${part.name}`);
    } else {
      toast.info("Cette pièce est déjà dans la sélection");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Repair Association */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <WrenchIcon className="h-5 w-5" />
              <h3 className="text-lg font-medium">Association à une réparation</h3>
            </div>

            <FormField
              control={form.control}
              name="repair_id"
              render={() => (
                <FormItem>
                  <FormLabel>Sélectionner une réparation (optionnel)</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repairs.map((repair: Repair) => (
                      <div
                        key={repair.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedRepair?.id === repair.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/30"
                        }`}
                        onClick={() => handleRepairSelection(repair.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Réparation #{repair.uid}</div>
                            <div className="text-sm text-muted-foreground">
                              Client: {repair.client?.username || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Date: {repair.date ? format(new Date(repair.date), "dd/MM/yyyy", { locale: fr }) : 'N/A'}
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            {repair.status || 'N/A'}
                          </div>
                        </div>

                        {repair.issues && Array.isArray(repair.issues) && repair.issues.length > 0 && (
                          <div className="mt-2 text-sm">
                            <div className="font-medium">Problèmes:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {repair.issues.slice(0, 3).map((issue: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                                >
                                  {typeof issue === 'string' ? issue : issue.name}
                                </span>
                              ))}
                              {repair.issues.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                                  +{repair.issues.length - 3} autre(s)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Sélectionnez une réparation pour associer cette commande de pièces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Suggested Parts based on selected repair */}
          {suggestedParts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pièces suggérées</h3>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="h-12 px-4 text-left">Pièce suggérée</th>
                      <th className="h-12 px-4 text-left">Description</th>
                      <th className="h-12 px-4 text-left">Quantité</th>
                      <th className="h-12 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedParts.map((part) => (
                      <tr key={part.id} className="border-b">
                        <td className="p-4 font-medium">{part.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{part.description}</td>
                        <td className="p-4">{part.quantity}</td>
                        <td className="p-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSuggestedPart(part)}
                          >
                            Ajouter
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de la commande</h3>

            <FormField
              control={form.control}
              name="order_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la commande *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Commande d'écrans iPhone pour réparation ABC123" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nom descriptif pour cette commande de pièces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input placeholder="Référence fournisseur optionnelle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails sur les pièces commandées..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Délai de livraison</h3>

            <FormField
              control={form.control}
              name="estimated_delivery_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de livraison estimée *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date à laquelle vous prévoyez de recevoir les pièces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Supplier Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fournisseurs</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suppliers.map((supplier: Supplier) => (
                <FormField
                  key={supplier.id}
                  control={form.control}
                  name="supplier_ids"
                  render={() => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={form.getValues("supplier_ids").includes(supplier.id)}
                          onCheckedChange={() => toggleSupplier(supplier.id)}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {supplier.name}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {supplier.contact_person} - {supplier.email}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </div>

          {/* Parts Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pièces à commander</h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher une pièce..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="button" variant="outline">
                  Rechercher
                </Button>
              </div>

              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="h-12 px-4 text-left">Pièce</th>
                      <th className="h-12 px-4 text-left">Référence</th>
                      <th className="h-12 px-4 text-left">Quantité</th>
                      <th className="h-12 px-4 text-left">Prix</th>
                      <th className="h-12 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((product) =>
                        searchTerm === "" ||
                        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 5) // Limit to first 5 results for UI
                      .map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-4">{product.name}</td>
                          <td className="p-4">{product.sku || "-"}</td>
                          <td className="p-4">
                            <Input
                              type="number"
                              min="1"
                              defaultValue="1"
                              className="w-20"
                              onChange={(e) => {
                                // In a real implementation, we would update selectedProducts state here
                              }}
                            />
                          </td>
                          <td className="p-4">
                            {product.price ? `${product.price} €` : "-"}
                          </td>
                          <td className="p-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // In a real implementation, we would add this product to selected products
                                toast.success(`Pièce ajoutée: ${product.name}`);
                              }}
                            >
                              Ajouter
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Selected products summary */}
              {selectedProducts.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Pièces sélectionnées:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedProducts.map((item) => (
                      <li key={item.id}>
                        {item.name} - Quantité: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notes supplémentaires</h3>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires pour le fournisseur..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border mt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit">
              Créer la commande
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}