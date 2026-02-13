import React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props extends React.ComponentPropsWithoutRef<"div"> {
  description: string;
  setDescription: (value: string) => void;
  accessories: string;
  setAccessories: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  scheduledDate: Date | null;
  setScheduledDate: (date: Date | null) => void;
}

const IssueDetailsForm: React.FC<Props> = ({
  description,
  setDescription,
  accessories,
  setAccessories,
  password,
  setPassword,
  scheduledDate,
  setScheduledDate,
  className,
  ...rest
}) => {
  return (
    <div className={cn("space-y-6 pt-6", className)} {...rest}>
      <div className="space-y-2">
        <Label htmlFor="description">Description détaillée</Label>
        <Textarea
          id="description"
          placeholder="Décrivez le problème en détail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accessories">Accessoires fournis</Label>
          <Input
            id="accessories"
            placeholder="ex: Chargeur, Étui..."
            value={accessories}
            onChange={(e) => setAccessories(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Code de déverrouillage</Label>
          <Input
            id="password"
            placeholder="Code PIN ou mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date prévue</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !scheduledDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate
                  ? scheduledDate.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                required={false}
                selected={scheduledDate || undefined}
                onSelect={(date) => setScheduledDate(date || null)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsForm;
