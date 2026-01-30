import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CalendarIcon, Check, Smartphone, Tablet, Laptop, Monitor, Watch, Gamepad2, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddReparationStore } from '@/store/addReparationStore';
import { useRouter } from 'next/navigation';

const deviceTypes = [
  { id: 'smartphone' as const, name: 'Smartphone', Icon: Smartphone },
  { id: 'tablet' as const, name: 'Tablette', Icon: Tablet },
  { id: 'laptop' as const, name: 'Ordinateur portable', Icon: Laptop },
  { id: 'desktop' as const, name: 'Ordinateur de bureau', Icon: Monitor },
  { id: 'watch' as const, name: 'Montre connectée', Icon: Watch },
  { id: 'console' as const, name: 'Console de jeu', Icon: Gamepad2 },
];

const brandsByType: Record<string, string[]> = {
  smartphone: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Oppo', 'Huawei', 'Sony', 'Nokia', 'Motorola'],
  tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Huawei', 'Amazon'],
  laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Microsoft'],
  desktop: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Custom Build'],
  watch: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Amazfit'],
  console: ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo'],
};

const modelsByBrand: Record<string, string[]> = {
  'Apple': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone SE'],
  'Samsung': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23', 'Galaxy S22', 'Galaxy A54', 'Galaxy A34', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5'],
  'Google': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6'],
};

export function DeviceStep() {
  const router = useRouter();
  const { 
    formData, 
    setFormData,
    nextStep
  } = useAddReparationStore();

  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const deviceType = formData.deviceType;
  const selectedBrand = formData.brand;
  const selectedModel = formData.model;

  const canProceed = deviceType && selectedBrand && selectedModel;

  const handleDeviceTypeChange = (typeId: string) => {
    setFormData({
      deviceType: typeId as any,
      brand: null,
      model: null
    });
  };

  const handleBrandChange = (brand: string) => {
    setFormData({
      brand,
      model: null
    });
  };

  const handleModelChange = (model: string) => {
    setFormData({
      model
    });
  };

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Type d'appareil</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez le type d'appareil à réparer
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {deviceTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleDeviceTypeChange(type.id)}
            className={cn(
              'flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary/50',
              deviceType === type.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            )}
          >
            <type.Icon className="h-8 w-8" />
            <span className="text-sm font-medium text-center">{type.name}</span>
          </button>
        ))}
      </div>

      {deviceType && (
        <div className="grid gap-4 pt-4">
          <div className="space-y-2">
            <Label>Marque</Label>
            <Popover open={brandOpen} onOpenChange={setBrandOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={brandOpen}
                  className="w-full justify-between"
                >
                  {selectedBrand || "Sélectionnez une marque..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher une marque..." />
                  <CommandList>
                    <CommandEmpty>Aucune marque trouvée.</CommandEmpty>
                    <CommandGroup>
                      {brandsByType[deviceType]?.map((b) => (
                        <CommandItem
                          key={b}
                          value={b}
                          onSelect={(currentValue) => {
                            handleBrandChange(currentValue === selectedBrand ? '' : b)
                            setBrandOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedBrand === b ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {b}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedBrand && (
            <div className="space-y-2">
              <Label>Modèle</Label>
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={modelOpen}
                    className="w-full justify-between"
                  >
                    {selectedModel || "Sélectionnez un modèle..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un modèle..." />
                    <CommandList>
                      <CommandEmpty>Aucun modèle trouvé.</CommandEmpty>
                      <CommandGroup>
                        {(modelsByBrand[selectedBrand] || [selectedBrand + ' - Modèle standard']).map((m) => (
                          <CommandItem
                            key={m}
                            value={m}
                            onSelect={(currentValue) => {
                              handleModelChange(currentValue === selectedModel ? '' : m)
                              setModelOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedModel === m ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {m}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}