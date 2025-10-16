export type Resource = Record<string, { translation: Record<string, string> }>;

type Listener = (lang: string) => void;

class I18n {
  language = "en";
  resources: Resource = {};
  listeners = new Set<Listener>();

  init(options: { resources: Resource; lng: string }) {
    this.resources = options.resources;
    this.language = options.lng;
    return this;
  }

  changeLanguage(lang: string) {
    if (this.language === lang) return Promise.resolve(this.language);
    this.language = lang;
    this.listeners.forEach((listener) => listener(lang));
    return Promise.resolve(lang);
  }

  on(event: "languageChanged", listener: Listener) {
    if (event === "languageChanged") {
      this.listeners.add(listener);
    }
  }

  off(event: "languageChanged", listener: Listener) {
    if (event === "languageChanged") {
      this.listeners.delete(listener);
    }
  }

  t(key: string, params?: Record<string, any>) {
    const translation = this.resources[this.language]?.translation;
    let text = translation?.[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    return text;
  }
}

const instance = new I18n();

export function createInstance() {
  return new I18n();
}

export default instance;
