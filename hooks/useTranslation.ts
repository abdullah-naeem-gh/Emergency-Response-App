import { useAppStore } from '@/store/useAppStore';
import enTranslations from '../locales/en.json';
import urTranslations from '../locales/ur.json';

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

const translations: Record<'en' | 'ur', typeof enTranslations> = {
  en: enTranslations,
  ur: urTranslations,
};

/**
 * Hook to get translations based on current language
 * Usage: const t = useTranslation(); t('home.title')
 */
export function useTranslation() {
  const language = useAppStore((state) => state.language);

  const t = (key: TranslationKey, params?: TranslationParams): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    // If value is still an object, return the key
    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in translation string
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return { t, language };
}

