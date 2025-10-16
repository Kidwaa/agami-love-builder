import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18next, { createInstance, Resource } from "./i18next";

type I18nContextValue = {
  i18n: typeof i18next;
};

const I18nContext = createContext<I18nContextValue>({ i18n: i18next });

export function I18nextProvider({ children, i18n = i18next }: { children: React.ReactNode; i18n?: typeof i18next }) {
  const value = useMemo(() => ({ i18n }), [i18n]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const { i18n } = useContext(I18nContext);
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const listener = (lang: string) => setLanguage(lang);
    i18n.on("languageChanged", listener);
    return () => i18n.off("languageChanged", listener);
  }, [i18n]);

  return {
    t: (key: string, params?: Record<string, any>) => i18n.t(key, params),
    i18n,
    language,
  };
}

export function initReactI18next() {
  return {
    type: "3rdParty" as const,
    init(instance: typeof i18next) {
      return instance;
    },
  };
}

export function useI18nInstance(resources: Resource, lng: string) {
  const instance = useMemo(() => createInstance().init({ resources, lng }), [lng, resources]);
  return instance;
}

export function withTranslation(Component: React.ComponentType<any>) {
  return function Wrapper(props: any) {
    const { t } = useTranslation();
    return <Component {...props} t={t} />;
  };
}
