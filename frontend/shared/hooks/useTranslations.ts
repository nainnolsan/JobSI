'use client';
import { useSettings } from '../contexts/SettingsContext';
import { translations, type Translations } from '../locales/translations';

export function useTranslations(): Translations {
  const { language } = useSettings();
  return translations[language];
}
