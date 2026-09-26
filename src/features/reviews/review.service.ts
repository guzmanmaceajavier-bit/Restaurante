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

export interface ResenaAdmin {
  id: number;
  nombre: string;
  estrellas: number;
  comentario: string;
  fecha: string;
  respuestaAdmin?: string;
  respondedAt?: string;
}

export interface FiltroResenas {
  busqueda: string;
  estrellas: number;
}

export interface ResenaProducto {
  id: string | number;
  nombre?: string;
  estrellas: number;
  comentario?: string;
  fecha?: string;
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

  /** Solo clave pública (sin tocar la copia admin). */
  savePublic: <T>(reviews: T[]): void => reviewStorage.saveAll(reviews),

  getResenasOrDefaults: <T>(defaults: T[]): T[] => {
    const stored = reviewStorage.getAll<T>();
    return stored.length ? stored : defaults;
  },

  getResenasPorProducto: (nombreProducto: string): ResenaProducto[] =>
    reviewStorage
      .getAll<StoredReview>()
      .filter((r) => (r.nombre ?? '').toLowerCase().includes((nombreProducto ?? '').toLowerCase()))
      .map((r) => {
        const raw = r as unknown as Record<string, unknown>;
        return {
          id: r.id,
          nombre: raw['nombre'] as string | undefined,
          estrellas: raw['estrellas'] as number,
          comentario: raw['comentario'] as string | undefined,
          fecha: r.fecha,
        };
      }),

  filterResenas: (resenas: ResenaAdmin[], filtro: FiltroResenas): ResenaAdmin[] =>
    resenas
      .filter((r) => {
        if (filtro.estrellas > 0 && r.estrellas !== filtro.estrellas) return false;
        if (filtro.busqueda) {
          const q = filtro.busqueda.toLowerCase();
          return r.nombre?.toLowerCase().includes(q) || r.comentario?.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime()),

  getPromedio: (resenas: ResenaAdmin[]): number =>
    resenas.length === 0
      ? 0
      : Number((resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length).toFixed(1)),

  getDistribucion: (resenas: ResenaAdmin[]): Record<number, number> => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    resenas.forEach((r) => {
      if (dist[r.estrellas] !== undefined) dist[r.estrellas]++;
    });
    return dist;
  },

  responderResena: (id: number, respuesta: string, actuales: ResenaAdmin[]): ResenaAdmin[] => {
    const updated = actuales.map((r) =>
      r.id === id ? { ...r, respuestaAdmin: respuesta.trim(), respondedAt: new Date().toISOString() } : r,
    );
    reviewStorage.saveAll(updated);
    return updated;
  },

  eliminarResena: (id: number, actuales: ResenaAdmin[]): ResenaAdmin[] => {
    const updated = actuales.filter((r) => r.id !== id);
    reviewStorage.saveAll(updated);
    return updated;
  },

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
