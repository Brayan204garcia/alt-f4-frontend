import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type {
  ApiKey,
  Client,
  CreateApiKeyPayload,
  CreateClientPayload,
  CreatedApiKey,
  RevokeKeyResponse,
  RotateKeyResponse,
} from './types'
import { API_BASE_URL } from '@/config/api'

const ADMIN_PREFIX = `${API_BASE_URL}/api/v1/admin`
const ADMIN_TOKEN = import.meta.env.VITE_ALFT4_ADMIN_TOKEN ?? ''

function adminHeaders() {
  return {
    'X-Admin-Token': ADMIN_TOKEN,
    'Content-Type': 'application/json',
  }
}

// ─── Clientes ────────────────────────────────────────────────────────────────

export async function fetchClients(): Promise<Client[]> {
  const { data } = await axios.get<Client[]>(`${ADMIN_PREFIX}/clients`, {
    headers: adminHeaders(),
  })
  return data
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  const { data } = await axios.post<Client>(
    `${ADMIN_PREFIX}/clients`,
    payload,
    { headers: adminHeaders() }
  )
  return data
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export async function fetchApiKeys(clientId: string): Promise<ApiKey[]> {
  const { data } = await axios.get<ApiKey[]>(
    `${ADMIN_PREFIX}/clients/${clientId}/api-keys`,
    { headers: adminHeaders() }
  )
  return data
}

export async function createApiKey(
  clientId: string,
  payload: CreateApiKeyPayload
): Promise<CreatedApiKey> {
  const { data } = await axios.post<CreatedApiKey>(
    `${ADMIN_PREFIX}/clients/${clientId}/api-keys`,
    payload,
    { headers: adminHeaders() }
  )
  return data
}

export async function revokeApiKey(keyId: string): Promise<RevokeKeyResponse> {
  const { data } = await axios.delete<RevokeKeyResponse>(
    `${ADMIN_PREFIX}/api-keys/${keyId}`,
    { headers: adminHeaders() }
  )
  return data
}

export async function rotateApiKey(keyId: string): Promise<RotateKeyResponse> {
  const { data } = await axios.post<RotateKeyResponse>(
    `${ADMIN_PREFIX}/api-keys/${keyId}/rotar`,
    undefined,
    { headers: adminHeaders() }
  )
  return data
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const queryKeys = {
  clients: ['admin', 'clients'] as const,
  apiKeys: (clientId: string) => ['admin', 'api-keys', clientId] as const,
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useClientsQuery() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: fetchClients,
    retry: 1,
  })
}

export function useApiKeysQuery(clientId: string | null) {
  return useQuery({
    queryKey: queryKeys.apiKeys(clientId ?? ''),
    queryFn: () => fetchApiKeys(clientId!),
    enabled: !!clientId,
    retry: 1,
  })
}

export function useCreateClientMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.clients })
    },
  })
}

export function useCreateApiKeyMutation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) => createApiKey(clientId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.apiKeys(clientId) })
    },
  })
}

export function useRevokeApiKeyMutation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.apiKeys(clientId) })
    },
  })
}

export function useRotateApiKeyMutation(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rotateApiKey,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.apiKeys(clientId) })
    },
  })
}
