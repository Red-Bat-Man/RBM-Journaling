import { useFontSettings, FONT_SIZE_OPTIONS } from "@/hooks/use-font-settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function FontSizePicker() {
  const { fontSize, setFontSize } = useFontSettings();

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="font-size-select" className="text-sm font-medium">
        Text Size
      </Label>
      <Select
        value={fontSize}
        onValueChange={(value) => setFontSize(value as any)}
      >
        <SelectTrigger id="font-size-select" className="w-full md:w-[200px]">
          <SelectValue placeholder="Select text size" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZE_OPTIONS.map((size) => (
            <SelectItem 
              key={size.value} 
              value={size.value}
            >
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}