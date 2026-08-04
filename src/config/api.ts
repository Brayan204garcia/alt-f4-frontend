/**
 * Configuración centralizada de la API Backend de AltF4-SIC.
 * Normaliza la URL base eliminando barras inclinadas al final si las hubiera.
 */
export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.bryan.lat'
).replace(/\/$/, '')

export const ALFT4_ADMIN_TOKEN: string =
  import.meta.env.VITE_ALFT4_ADMIN_TOKEN ||
  'dsfdsfdsffdsfdsfdsfdsvvweh0ZhQypergdfgfdgfdgfdgvaGdsfsjQNoZ30WShium444443OGqdsFmUzgUmQQzJCPQ'



