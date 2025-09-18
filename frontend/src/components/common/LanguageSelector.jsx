// src/components/common/LanguageSelector.jsx
import React from 'react';
import { Globe, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const LanguageSelector = ({ variant = 'select', className }) => {
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 opacity-50">
        <Globe className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  if (variant === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{currentLang?.flag}</span>
            <span className="hidden md:inline">{currentLang?.name}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <div className="space-y-1">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                  currentLanguage === language.code 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-accent"
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-xs text-muted-foreground">{language.nativeName}</div>
                </div>
                {currentLanguage === language.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Select value={currentLanguage} onValueChange={changeLanguage}>
      <SelectTrigger className={cn("w-auto gap-2", className)}>
        <Globe className="h-4 w-4" />
        <span>{currentLang?.flag}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <span>{language.nativeName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
