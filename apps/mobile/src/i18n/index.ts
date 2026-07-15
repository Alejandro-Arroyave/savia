import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import { es } from "./locales/es";
import { en } from "./locales/en";

const i18n = new I18n({ es, en });

i18n.defaultLocale = "es";
i18n.enableFallback = true;
i18n.locale = getLocales()[0]?.languageCode ?? "es";

/** Traduce una clave (p. ej. "plants.title"), con interpolación/pluralización opcional. */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export { i18n };
