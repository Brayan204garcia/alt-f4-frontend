/**
 * Configuración centralizada de la API Backend de AltF4-SIC.
 * Normaliza la URL base eliminando barras inclinadas al final si las hubiera.
 */
export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://185.253.153.67'
).replace(/\/$/, '')
