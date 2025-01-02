import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import no from './locales/no';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: localStorage.getItem('language') || 'en',
  resources: {
    en,
    no,
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;