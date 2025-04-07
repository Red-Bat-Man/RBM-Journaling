import { useFontSettings, FONT_OPTIONS } from "@/hooks/use-font-settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function FontPicker() {
  const { fontFamily, setFontFamily } = useFontSettings();

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="font-select" className="text-sm font-medium">
        Font Style
      </Label>
      <Select
        value={fontFamily}
        onValueChange={(value) => setFontFamily(value as any)}
      >
        <SelectTrigger id="font-select" className="w-full md:w-[200px]">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map((font) => (
            <SelectItem 
              key={font.value} 
              value={font.value}
              className={`font-${font.value.toLowerCase()}`}
            >
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}