import { createContext, ReactNode, useState, useContext, useEffect } from 'react';

type FontFamily = 'Poppins' | 'Lato' | 'Roboto' | 'Merriweather' | 'Montserrat';
type FontSize = 'small' | 'medium' | 'large' | 'x-large';
type TextColor = 'default' | 'dark' | 'blue' | 'green' | 'purple' | 'red';

interface TextSettings {
  fontFamily: FontFamily;
  fontSize: FontSize;
  textColor: TextColor;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setTextColor: (color: TextColor) => void;
}

const TextSettingsContext = createContext<TextSettings | undefined>(undefined);

export const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Montserrat', label: 'Montserrat' },
];

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'x-large', label: 'Extra Large' },
];

export const TEXT_COLOR_OPTIONS: { value: TextColor; label: string; hex: string }[] = [
  { value: 'default', label: 'Default', hex: '#1f2937' },
  { value: 'dark', label: 'Dark', hex: '#111827' },
  { value: 'blue', label: 'Blue', hex: '#1e40af' },
  { value: 'green', label: 'Green', hex: '#047857' },
  { value: 'purple', label: 'Purple', hex: '#6d28d9' },
  { value: 'red', label: 'Red', hex: '#b91c1c' },
];

export function FontSettingsProvider({ children }: { children: ReactNode }) {
  // Get saved font preferences from localStorage or use defaults
  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
    const savedFont = localStorage.getItem('fontFamily');
    return (savedFont as FontFamily) || 'Poppins';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const savedSize = localStorage.getItem('fontSize');
    return (savedSize as FontSize) || 'medium';
  });

  const [textColor, setTextColorState] = useState<TextColor>(() => {
    const savedColor = localStorage.getItem('textColor');
    return (savedColor as TextColor) || 'default';
  });

  const setFontFamily = (font: FontFamily) => {
    setFontFamilyState(font);
    localStorage.setItem('fontFamily', font);
    document.documentElement.style.setProperty('--font-family', font);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size);
    applyFontSize(size);
  };

  const setTextColor = (color: TextColor) => {
    setTextColorState(color);
    localStorage.setItem('textColor', color);
    applyTextColor(color);
  };

  // Apply font size based on selection
  const applyFontSize = (size: FontSize) => {
    let baseSizeRem;
    switch (size) {
      case 'small':
        baseSizeRem = '0.875rem'; // 14px
        break;
      case 'medium':
        baseSizeRem = '1rem'; // 16px
        break;
      case 'large':
        baseSizeRem = '1.125rem'; // 18px
        break;
      case 'x-large':
        baseSizeRem = '1.25rem'; // 20px
        break;
      default:
        baseSizeRem = '1rem';
    }
    document.documentElement.style.setProperty('--base-font-size', baseSizeRem);
  };

  // Apply text color based on selection
  const applyTextColor = (color: TextColor) => {
    let hexColor;
    const colorOption = TEXT_COLOR_OPTIONS.find(option => option.value === color);
    hexColor = colorOption ? colorOption.hex : '#1f2937'; // Default color if not found
    document.documentElement.style.setProperty('--text-color', hexColor);
  };

  // Apply settings on initial render
  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', fontFamily);
    applyFontSize(fontSize);
    applyTextColor(textColor);
  }, [fontFamily, fontSize, textColor]);

  return (
    <TextSettingsContext.Provider 
      value={{ 
        fontFamily, 
        fontSize, 
        textColor, 
        setFontFamily, 
        setFontSize, 
        setTextColor 
      }}
    >
      {children}
    </TextSettingsContext.Provider>
  );
}

export function useFontSettings() {
  const context = useContext(TextSettingsContext);
  if (!context) {
    throw new Error('useFontSettings must be used within a FontSettingsProvider');
  }
  return context;
}