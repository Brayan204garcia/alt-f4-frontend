// ─── Tipos de dominio para la gestión de API Keys ────────────────────────────

export interface Client {
  id: string
  name: string
  created_at: string
}

export interface ApiKey {
  id: string
  key_prefix: string
  client_id: string
  name: string
  scopes: string
  active: boolean
  created_at: string
  last_used_at?: string | null
}

export interface CreatedApiKey extends ApiKey {
  raw_key: string
}

export interface CreateClientPayload {
  name: string
}

export interface CreateApiKeyPayload {
  name: string
  scopes: string[]
}

export interface RevokeKeyResponse {
  id: string
  active: false
  message: string
}

export interface RotateKeyResponse {
  old_key_id: string
  new_key_id: string
  new_raw_key: string
  new_key_prefix: string
  client_id: string
  name: string
  scopes: string
  active: boolean
  created_at: string
}

export type ApiError = {
  detail: string
}
