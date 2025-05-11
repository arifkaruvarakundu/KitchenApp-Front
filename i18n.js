// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization'; // ✅ use expo-localization

// Import your translation files
import homeEN from './locales/en/Home.json';
import homeAR from './locales/ar/Home.json';
import shopEN from './locales/en/Shop.json';
import shopAR from './locales/ar/Shop.json';
import cartEN from './locales/en/Cart.json';
import cartAR from './locales/ar/Cart.json';
import SignInUpEN from './locales/en/SignIn_SignUp.json';
import SignInUpAR from './locales/ar/SignIn_SignUp.json';
import ProductDetailsEN from './locales/en/ProductDetails.json';
import ProductDetailsAR from './locales/ar/ProductDetails.json';
// import StackEN from './locales/en/Stack.json';
// import StackAR from './locales/ar/Stack.json';
import AccountEN from './locales/en/Account.json';
import AccountAR from './locales/ar/Account.json';
// import CampaignDetailEN from './locales/en/CampaignDetails.json';
// import CampaignDetailAR from './locales/ar/CampaignDetails.json';
// import StartCampaignEN from './locales/en/StartCampaign.json';
// import StartCampaignAR from './locales/ar/StartCampaign.json';
// ... import other namespaces similarly

// Define your resources
const resources = {
  en: {
    home: homeEN,
    shop: shopEN,
    cart: cartEN,
    SignIn_SignUp: SignInUpEN,
    ProductDetails: ProductDetailsEN,
    // Stack: StackEN,
    Account: AccountEN,
    // CampaignDetail: CampaignDetailEN,
    // StartCampaign: StartCampaignEN,
    // ... add other namespaces
  },
  ar: {
    home: homeAR,
    shop: shopAR,
    cart: cartAR,
    SignIn_SignUp: SignInUpAR,
    ProductDetails: ProductDetailsAR,
    // Stack: StackAR,
    Account: AccountAR,
    // CampaignDetail: CampaignDetailAR,
    // StartCampaign: StartCampaignAR,
    // ... add other namespaces
  },
};

// Detect the device's language (fallback to 'en' if not supported)
const localeCode = Localization.locale.split('-')[0]; // "en-US" -> "en"
const deviceLanguage = ['en', 'ar'].includes(localeCode) ? localeCode : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    ns: [
      'home',
      'shop',
      'cart',
      'SignIn_SignUp',
      'ProductDetails',
      // 'Stack',
      'Account',
      // 'CampaignDetail',
      // 'StartCampaign',
      // ... list all your namespaces
    ],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
