import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Place } from "@shared/schema";

interface PlacePickerProps {
  selectedPlaceId?: number;
  onSelect: (placeId?: number) => void;
}

export default function PlacePicker({ selectedPlaceId, onSelect }: PlacePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>(undefined);

  const { data: places, isLoading } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  // Update the selected place when the ID changes or places are loaded
  useEffect(() => {
    if (places && selectedPlaceId) {
      const place = places.find((place) => place.id === selectedPlaceId);
      setSelectedPlace(place);
    } else if (!selectedPlaceId) {
      setSelectedPlace(undefined);
    }
  }, [selectedPlaceId, places]);

  const handleSelect = (place: Place) => {
    if (selectedPlaceId === place.id) {
      // Deselect if selecting the same place
      setSelectedPlace(undefined);
      onSelect(undefined);
    } else {
      setSelectedPlace(place);
      onSelect(place.id);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPlace ? (
            <div className="flex items-center gap-2">
              <span>{selectedPlace.icon}</span>
              <span>{selectedPlace.name}</span>
            </div>
          ) : (
            "Select location..."
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search location..." />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Loading places...</div>
              ) : (
                places?.map((place) => (
                  <CommandItem
                    key={place.id}
                    onSelect={() => handleSelect(place)}
                    className="flex items-center gap-2"
                  >
                    <span className="mr-2">{place.icon}</span>
                    <span>{place.name}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedPlaceId === place.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              )}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}