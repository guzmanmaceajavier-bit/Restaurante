/** Configuración por entorno. Ver .env.example */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? 'Sabor y Origen';
export const ITEMS_PER_PAGE = 8;
export const CURRENCY_LOCALE = 'es-CO';
