import { useFontSettings, TEXT_COLOR_OPTIONS } from "@/hooks/use-font-settings";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export default function TextColorPicker() {
  const { textColor, setTextColor } = useFontSettings();

  return (
    <div className="flex flex-col space-y-4">
      <Label className="text-sm font-medium">
        Text Color
      </Label>
      <RadioGroup 
        defaultValue={textColor}
        onValueChange={(value) => setTextColor(value as any)}
        className="grid grid-cols-3 gap-4"
      >
        {TEXT_COLOR_OPTIONS.map((color) => (
          <div key={color.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={color.value} 
              id={`color-${color.value}`} 
              className="sr-only"
            />
            <label 
              htmlFor={`color-${color.value}`}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-md cursor-pointer border transition-all",
                textColor === color.value 
                  ? "ring-2 ring-offset-2 ring-primary" 
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-5 h-5 rounded-full border" 
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm">{color.label}</span>
              </div>
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}