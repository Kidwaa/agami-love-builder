import i18n from "@/vendor/i18next";
import en from "./en.json";
import bn from "./bn.json";

i18n.init({
  lng: "en",
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
});

export default i18n;
