import { reviewStorage } from '../../services/storage/reviewStorage';
import type { StoredReview } from '../../services/storage/reviewStorage';

/** Fachada de reseñas. Hoy lee localStorage; mañana: /api/reviews. */
export const reviewService = {
  getAll: <T = StoredReview>(): T[] => reviewStorage.getAll<T>(),
  saveAll: <T>(reviews: T[]): void => {
    reviewStorage.saveAll(reviews);
    reviewStorage.saveAdmin(reviews);
  },
  getPublished: <T = StoredReview>(): T[] =>
    reviewStorage.getAll<StoredReview>().filter((r) => r.estado === 'publicada') as T[],
};
