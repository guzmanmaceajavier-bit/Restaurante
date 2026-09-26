import type { RestaurantConfig } from '../../lib/config';
import { STORAGE_KEYS } from './storageKeys';
import { readJson, readString, writeJson, writeString } from './jsonStore';

/** Lee el override guardado (sin defaults: los aplica lib/config). */
export const settingsStorage = {
  readRestaurantOverride: (): Partial<RestaurantConfig> | null => {
    const stored = readJson<Partial<RestaurantConfig>>(STORAGE_KEYS.RESTAURANT_CONFIG, {});
    return stored && Object.keys(stored).length ? stored : null;
  },
  writeRestaurantConfig: (config: RestaurantConfig): void => writeJson(STORAGE_KEYS.RESTAURANT_CONFIG, config),
  getLegalText: (key: typeof STORAGE_KEYS.LEGAL_PRIVACY | typeof STORAGE_KEYS.LEGAL_TERMS): string =>
    readString(key),
  setLegalText: (key: typeof STORAGE_KEYS.LEGAL_PRIVACY | typeof STORAGE_KEYS.LEGAL_TERMS, text: string): void =>
    writeString(key, text),
  getHomeFaqs: <T>(): T | null => readJson<T | null>(STORAGE_KEYS.HOME_FAQS, null),
  setHomeFaqs: <T>(faqs: T): void => writeJson(STORAGE_KEYS.HOME_FAQS, faqs),
  getHomeTestimonials: <T>(): T | null => readJson<T | null>(STORAGE_KEYS.HOME_TESTIMONIALS, null),
  getContactReviews: <T>(): T[] => readJson<T[]>(STORAGE_KEYS.CONTACT_REVIEWS, []),
  setContactReviews: <T>(reviews: T[]): void => writeJson(STORAGE_KEYS.CONTACT_REVIEWS, reviews),
};
