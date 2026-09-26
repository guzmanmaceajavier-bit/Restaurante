import { reviewStorage } from '../../services/storage/reviewStorage';
import type { StoredReview } from '../../services/storage/reviewStorage';
import { settingsStorage } from '../../services/storage/settingsStorage';

export interface ContactReview {
  name: string;
  text: string;
  rating: number;
}

export interface Testimonio {
  name: string;
  text: string;
  rating: number;
}

/** Fachada de reseñas. Hoy lee localStorage; mañana: /api/reviews. */
export const reviewService = {
  getAll: <T = StoredReview>(): T[] => reviewStorage.getAll<T>(),
  saveAll: <T>(reviews: T[]): void => {
    reviewStorage.saveAll(reviews);
    reviewStorage.saveAdmin(reviews);
  },
  getPublished: <T = StoredReview>(): T[] =>
    reviewStorage.getAll<StoredReview>().filter((r) => r.estado === 'publicada') as T[],

  getContactReviewsOrDefaults: (defaults: ContactReview[]): ContactReview[] => {
    const stored = settingsStorage.getContactReviews<ContactReview>();
    return stored.length ? stored : defaults;
  },

  guardarContactReview: (review: ContactReview, actuales: ContactReview[]): ContactReview[] => {
    const updated = [review, ...actuales];
    settingsStorage.setContactReviews(updated);
    return updated;
  },

  /** Unifica una reseña de contacto con el formato de resenas admin. */
  publicarResena: (name: string, rating: number, comentario: string): void => {
    const existing = reviewStorage.getAll<StoredReview>();
    existing.unshift({
      id: String(Date.now()),
      nombre: name.trim(),
      rating,
      comentario: comentario.trim(),
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    } as StoredReview);
    reviewStorage.saveAll(existing);
  },

  /** Testimonios del home: personalizados, luego resenas, luego respaldo. */
  getTestimonials: (fallback: Testimonio[]): Testimonio[] => {
    const custom = settingsStorage.getHomeTestimonials<Testimonio[]>();
    if (custom && Array.isArray(custom) && custom.length) return custom;
    const resenas = reviewStorage.getAll<StoredReview>();
    if (resenas.length >= 3) {
      return resenas.slice(0, 3).map((r) => {
        const raw = r as unknown as Record<string, unknown>;
        return {
          name: (raw['nombre'] as string) || (raw['name'] as string) || '',
          text: (raw['comentario'] as string) || (raw['text'] as string) || '',
          rating: (raw['estrellas'] as number) || r.rating || 5,
        };
      });
    }
    return fallback;
  },
};
