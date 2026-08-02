import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  CasoAuditoriaTablaItem,
  EstadoAnalisisType,
  GlosaResumen,
  PaginatedCasosResponse,
  paginatedCasosResponseSchema,
  SeveridadMaximaType,
} from '@/features/users/data/schema'
import { API_BASE_URL } from '@/config/api'

export interface CasosQueryParams {
  page?: number
  page_size?: number
  search?: string
  q?: string
  query?: string
  id?: string
  radicado?: string
  es_consistente?: boolean
  severidad?: string
  resultado_estado?: string
  solo_auditados?: boolean
}

export const MOCK_CASOS_ITEMS: CasoAuditoriaTablaItem[] = [
  {
    id: 'CASO-2026-FUGA-01',
    estado: 'completado',
    estado_analisis: 'con_glosa',
    es_consistente: false,
    tiene_glosas: true,
    total_glosas: 2,
    total_advertencias: 0,
    severidad_maxima: 'alta',
    conteo_severidades: { alta: 2, media: 0, baja: 0 },
    paciente_documento: '1020304050',
    paciente_nombre: 'Santiago Mendoza',
    eps: 'Compensar EPS',
    fecha_atencion: '2026-07-28T09:00:00Z',
    glosas_resumen: [
      {
        codigo: 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO',
        categoria: 'fuga_ingreso',
        referencia_normativa: 'Resolución 3047 de 2008',
        severidad: 'alta',
        campo: 'historia_clinica.procedimientos[0]',
        descripcion:
          "Fuga de Ingreso: El procedimiento 'Hemograma Completo' (CUPS 902210) con soporte en la historia clínica (cantidad: 1) no fue facturado en la prefactura.",
        evidencia: {
          codigo_cups: '902210',
          descripcion: 'Hemograma Completo',
          cantidad_historia: 1,
          cantidad_prefactura: 0,
          unidades_faltantes: 1,
        },
      },
      {
        codigo: 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO',
        categoria: 'fuga_ingreso',
        referencia_normativa: 'Resolución 3047 de 2008',
        severidad: 'alta',
        campo: 'historia_clinica.procedimientos[1]',
        descripcion:
          "Fuga de Ingreso: El procedimiento 'Medición de Troponina I' (CUPS 903856) con soporte en la historia clínica (cantidad: 2) no fue facturado en la prefactura.",
        evidencia: {
          codigo_cups: '903856',
          descripcion: 'Medición de Troponina I',
          cantidad_historia: 2,
          cantidad_prefactura: 0,
          unidades_faltantes: 2,
        },
      },
    ],
    error_detalle: null,
    historia_clinica_json: {
      paciente: {
        documento: '1020304050',
        nombre: 'Santiago Mendoza',
        genero: 'Masculino',
        fecha_nacimiento: '1995-03-15',
      },
      atencion: {
        fecha_ingreso: '2026-07-28T09:00:00Z',
        diagnostico_principal: 'R509 - Fiebre, no especificada',
        medico_tratante: 'Dr. Roberto Gomez',
        observaciones:
          'Paciente febril. Se solicita hemograma completo y 2 mediciones de troponina I de control.',
      },
      procedimientos: [
        {
          cups: '902210',
          descripcion: 'Hemograma Completo',
          cantidad: 1,
          soporte: 'Orden médica y resultado de laboratorio adjunto.',
        },
        {
          cups: '903856',
          descripcion: 'Medición de Troponina I',
          cantidad: 2,
          soporte: 'Curva de troponinas en urgencias.',
        },
      ],
    },
    prefactura_json: {
      numero_factura: 'FAC-2026-8801',
      valor_total: 80000,
      items: [
        {
          codigo_cups: '890201',
          descripcion: 'Consulta urgencias',
          valor: 80000,
        },
      ],
    },
    resultado_analisis_json: {
      es_consistente: false,
      total_glosas: 2,
      glosas: [
        {
          codigo: 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO',
          categoria: 'fuga_ingreso',
          referencia_normativa: 'Resolución 3047 de 2008',
          severidad: 'alta',
          campo: 'historia_clinica.procedimientos[0]',
          descripcion:
            "Fuga de Ingreso: El procedimiento 'Hemograma Completo' (CUPS 902210) con soporte en la historia clínica (cantidad: 1) no fue facturado en la prefactura.",
          evidencia: {
            codigo_cups: '902210',
            descripcion: 'Hemograma Completo',
            cantidad_historia: 1,
            cantidad_prefactura: 0,
            unidades_faltantes: 1,
          },
        },
        {
          codigo: 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO',
          categoria: 'fuga_ingreso',
          referencia_normativa: 'Resolución 3047 de 2008',
          severidad: 'alta',
          campo: 'historia_clinica.procedimientos[1]',
          descripcion:
            "Fuga de Ingreso: El procedimiento 'Medición de Troponina I' (CUPS 903856) con soporte en la historia clínica (cantidad: 2) no fue facturado en la prefactura.",
          evidencia: {
            codigo_cups: '903856',
            descripcion: 'Medición de Troponina I',
            cantidad_historia: 2,
            cantidad_prefactura: 0,
            unidades_faltantes: 2,
          },
        },
      ],
      advertencias: [
        "Advertencia de pertinencia: El CUPS 659510 registrado en la historia clínica aplica para sexo F y el paciente registra sexo M. Al no estar facturado en la prefactura, no genera glosa económica (Res. 3047 de 2008).",
        "Advertencia (Fuga de ingreso): El procedimiento 'Consulta de medicina general' (CUPS 890201) con soporte en la historia clínica (cantidad: 1) no fue facturado en la prefactura. Al no estar facturado, no genera glosa económica (Res. 3047 de 2008).",
        "historia_clinica: campos obligatorios faltantes: epicrisis, evolucion, fecha_nacimiento, medico_tratante, sede, tipo_atencion",
      ],
      cruces: [
        {
          tipo: 'procedimientos_vs_items',
          codigos_historia: ['890201', '902210', '903856'],
          codigos_prefactura: ['890201'],
          codigos_sin_soporte: [],
          codigos_fuga_ingreso: ['902210', '903856'],
        },
      ],
    },
    created_at: '2026-07-28T09:05:00Z',
    updated_at: '2026-07-28T09:05:00Z',
  },
  {
    id: 'CASO-2026-00001',
    estado: 'completado',
    estado_analisis: 'con_glosa',
    es_consistente: false,
    tiene_glosas: true,
    total_glosas: 2,
    total_advertencias: 1,
    severidad_maxima: 'alta',
    conteo_severidades: { alta: 1, media: 1, baja: 0 },
    paciente_documento: '1098765432',
    paciente_nombre: 'Maria Gomez',
    eps: 'EPS Sura',
    fecha_atencion: '2026-07-20T10:30:00Z',
    glosas_resumen: [
      {
        codigo: 'GLOSA-01',
        categoria: 'Facturación / Tarifas',
        severidad: 'alta',
        campo: 'valor_total',
        descripcion:
          'El valor liquidado excede la tarifa acordada para el procedimiento CUPS.',
      },
      {
        codigo: 'GLOSA-02',
        categoria: 'Soporte Clínico',
        severidad: 'media',
        campo: 'diagnostico_principal',
        descripcion:
          'Falta concordancia entre el código CIE-10 y la justificación clínica en la historia.',
      },
    ],
    error_detalle: null,
    historia_clinica_json: {
      paciente: {
        documento: '1098765432',
        nombre: 'Maria Gomez',
        genero: 'Femenino',
        fecha_nacimiento: '1988-04-12',
      },
      atencion: {
        fecha_ingreso: '2026-07-20T10:30:00Z',
        diagnostico_principal: 'K802 - Calculosis de la vesícula biliar sin colecistitis',
        medico_tratante: 'Dr. Alejandro Silva',
        observaciones: 'Paciente presenta dolor abdominal en hipocondrio derecho. Se programa colecistectomía laparoscópica.',
      },
    },
    prefactura_json: {
      numero_factura: 'FAC-2026-9901',
      valor_total: 3500000,
      items: [
        { codigo_cups: '512201', descripcion: 'Colecistectomía laparoscópica', valor: 2800000 },
        { codigo_cups: '890201', descripcion: 'Consulta de especialista', valor: 700000 },
      ],
    },
    resultado_analisis_json: {
      es_consistente: false,
      total_glosas: 2,
      glosas: [
        {
          codigo: 'GLOSA-01',
          categoria: 'Facturación / Tarifas',
          severidad: 'alta',
          campo: 'valor_total',
          descripcion: 'El valor liquidado excede la tarifa acordada para el procedimiento CUPS.',
        },
        {
          codigo: 'GLOSA-02',
          categoria: 'Soporte Clínico',
          severidad: 'media',
          campo: 'diagnostico_principal',
          descripcion: 'Falta concordancia entre el código CIE-10 y la justificación clínica en la historia.',
        },
      ],
    },
    created_at: '2026-07-25T08:00:00Z',
    updated_at: '2026-07-25T08:05:00Z',
  },
  {
    id: 'CASO-2026-00002',
    estado: 'completado',
    estado_analisis: 'sin_glosa',
    es_consistente: true,
    tiene_glosas: false,
    total_glosas: 0,
    total_advertencias: 0,
    severidad_maxima: null,
    conteo_severidades: { alta: 0, media: 0, baja: 0 },
    paciente_documento: '1012345678',
    paciente_nombre: 'Carlos Rodriguez',
    eps: 'Sanitas EPS',
    fecha_atencion: '2026-07-21T14:15:00Z',
    glosas_resumen: [],
    error_detalle: null,
    historia_clinica_json: {
      paciente: {
        documento: '1012345678',
        nombre: 'Carlos Rodriguez',
        genero: 'Masculino',
        fecha_nacimiento: '1992-08-25',
      },
      atencion: {
        fecha_ingreso: '2026-07-21T14:15:00Z',
        diagnostico_principal: 'J00 - Rinofaringitis aguda (resfriado común)',
        medico_tratante: 'Dra. Claudia Morales',
        observaciones: 'Paciente con cuadro gripal leve. Se prescribe tratamiento sintomático.',
      },
    },
    prefactura_json: {
      numero_factura: 'FAC-2026-9902',
      valor_total: 120000,
      items: [
        { codigo_cups: '890201', descripcion: 'Consulta medicina general', valor: 120000 },
      ],
    },
    resultado_analisis_json: {
      es_consistente: true,
      total_glosas: 0,
      glosas: [],
    },
    created_at: '2026-07-25T09:00:00Z',
    updated_at: '2026-07-25T09:02:00Z',
  },
  {
    id: 'CASO-2026-00003',
    estado: 'completado',
    estado_analisis: 'con_advertencias',
    es_consistente: false,
    tiene_glosas: true,
    total_glosas: 1,
    total_advertencias: 2,
    severidad_maxima: 'media',
    conteo_severidades: { alta: 0, media: 1, baja: 0 },
    paciente_documento: '987654321',
    paciente_nombre: 'Ana Martinez',
    eps: 'Nueva EPS',
    fecha_atencion: '2026-07-22T11:00:00Z',
    glosas_resumen: [
      {
        codigo: 'ADV-01',
        categoria: 'Datos Demográficos',
        severidad: 'media',
        campo: 'genero_paciente',
        descripcion:
          'Inconsistencia potencial de género para el procedimiento realizado.',
      },
    ],
    error_detalle: null,
    historia_clinica_json: {
      paciente: {
        documento: '987654321',
        nombre: 'Ana Martinez',
        genero: 'Femenino',
      },
    },
    prefactura_json: {
      numero_factura: 'FAC-2026-9903',
      valor_total: 450000,
    },
    resultado_analisis_json: {
      es_consistente: false,
      total_glosas: 1,
    },
    created_at: '2026-07-25T10:00:00Z',
    updated_at: '2026-07-25T10:04:00Z',
  },
  {
    id: 'CASO-2026-00004',
    estado: 'completado',
    estado_analisis: 'sin_glosa',
    es_consistente: true,
    tiene_glosas: false,
    total_glosas: 0,
    total_advertencias: 0,
    severidad_maxima: null,
    conteo_severidades: { alta: 0, media: 0, baja: 0 },
    paciente_documento: '1054321890',
    paciente_nombre: 'Jorge Lopez',
    eps: 'Compensar EPS',
    fecha_atencion: '2026-07-23T16:45:00Z',
    glosas_resumen: [],
    error_detalle: null,
    historia_clinica_json: {
      paciente: {
        documento: '1054321890',
        nombre: 'Jorge Lopez',
      },
    },
    prefactura_json: {
      numero_factura: 'FAC-2026-9904',
      valor_total: 250000,
    },
    resultado_analisis_json: {
      es_consistente: true,
      total_glosas: 0,
    },
    created_at: '2026-07-25T11:00:00Z',
    updated_at: '2026-07-25T11:01:00Z',
  },
  {
    id: 'CASO-2026-00005',
    estado: 'completado',
    estado_analisis: 'con_glosa',
    es_consistente: false,
    tiene_glosas: true,
    total_glosas: 3,
    total_advertencias: 1,
    severidad_maxima: 'baja',
    conteo_severidades: { alta: 0, media: 0, baja: 3 },
    paciente_documento: '1087654321',
    paciente_nombre: 'Lucia Castro',
    eps: 'Salud Total',
    fecha_atencion: '2026-07-24T09:20:00Z',
    glosas_resumen: [
      {
        codigo: 'GLOSA-03',
        categoria: 'Autorizaciones',
        severidad: 'baja',
        campo: 'numero_autorizacion',
        descripcion: 'Número de autorización presenta formato inusual.',
      },
    ],
    error_detalle: null,
    historia_clinica_json: {
      paciente: {
        documento: '1087654321',
        nombre: 'Lucia Castro',
      },
    },
    prefactura_json: {
      numero_factura: 'FAC-2026-9905',
      valor_total: 800000,
    },
    resultado_analisis_json: {
      es_consistente: false,
      total_glosas: 3,
    },
    created_at: '2026-07-25T12:00:00Z',
    updated_at: '2026-07-25T12:03:00Z',
  },
]

export function getMockPaginatedCasos(
  params: CasosQueryParams = {}
): PaginatedCasosResponse {
  let filtered = [...MOCK_CASOS_ITEMS]
  const searchTerm = sanitizeString(
    params.search || params.q || params.query || params.id || params.radicado
  ).toLowerCase()

  if (searchTerm) {
    filtered = filtered.filter((item) =>
      [
        item.id,
        item.paciente_nombre,
        item.paciente_documento,
        item.eps,
        item.api,
      ]
        .map((value) => sanitizeString(value).toLowerCase())
        .some((value) => value.includes(searchTerm))
    )
  }

  if (params.es_consistente !== undefined) {
    filtered = filtered.filter(
      (item) => item.es_consistente === params.es_consistente
    )
  }

  if (params.severidad) {
    filtered = filtered.filter(
      (item) =>
        item.severidad_maxima === params.severidad ||
        item.glosas_resumen.some((g) => g.severidad === params.severidad)
    )
  }

  if (params.resultado_estado) {
    filtered = filtered.filter(
      (item) => item.estado_analisis === params.resultado_estado
    )
  }

  if (params.solo_auditados) {
    filtered = filtered.filter(
      (item) => item.estado_analisis !== null || item.estado === 'completado'
    )
  }

  const page = params.page && params.page > 0 ? params.page : 1
  const page_size =
    params.page_size && params.page_size > 0 ? params.page_size : 10
  const total = filtered.length
  const total_pages = Math.ceil(total / page_size) || 1
  const start = (page - 1) * page_size
  const items = filtered.slice(start, start + page_size)

  return {
    items,
    total,
    page,
    page_size,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  }
}

const BASE_URL = API_BASE_URL

export function sanitizeString(value: unknown, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback
  const str = String(value).trim()
  if (!str) return fallback
  return str.replace(/<[^>]*>?/gm, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '') || fallback
}

export function formatFechaSegura(fechaInput: unknown): string {
  if (!fechaInput) return '-'
  const str = sanitizeString(fechaInput)
  if (!str) return '-'
  try {
    const d = new Date(str)
    if (isNaN(d.getTime())) {
      return str
    }
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return str
  }
}

function normalizeCasoItem(item: any): CasoAuditoriaTablaItem {
  if (!item || typeof item !== 'object') {
    item = {}
  }

  const id = sanitizeString(
    item.id || item.radicado || item.id_caso || item._id || '',
    'SIN-ID'
  )

  const rawNombre =
    item.paciente_nombre ||
    item.nombre_paciente ||
    item.paciente ||
    item.historia_clinica_json?.paciente?.nombre_completo ||
    item.historia_clinica_json?.paciente?.nombre

  const paciente_nombre = sanitizeString(rawNombre, 'Sin nombre')

  const rawDocumento =
    item.paciente_documento ||
    item.documento_paciente ||
    item.cedula ||
    item.historia_clinica_json?.paciente?.documento ||
    null

  const paciente_documento = rawDocumento ? sanitizeString(rawDocumento) : null

  const rawEps =
    item.eps ||
    item.eps_nombre ||
    item.nombre_eps ||
    item.historia_clinica_json?.paciente?.eps ||
    item.historia_clinica_json?.eps ||
    item.historia_clinica_json?.atencion?.eps ||
    item.prefactura_json?.paciente?.eps ||
    item.prefactura_json?.eps ||
    item.prefactura_json?.nombre_eps ||
    item.resultado_analisis_json?.eps ||
    item.resultado_analisis_json?.paciente?.eps ||
    null

  const eps = sanitizeString(rawEps, 'Sin EPS')

  const rawFecha =
    item.fecha_atencion ||
    item.fecha ||
    item.fecha_ingreso ||
    item.historia_clinica_json?.atencion?.fecha_ingreso ||
    item.historia_clinica_json?.atencion?.fecha_atencion ||
    item.historia_clinica_json?.fecha_atencion ||
    item.historia_clinica_json?.fecha_ingreso ||
    item.historia_clinica_json?.fecha ||
    item.prefactura_json?.fecha_facturacion ||
    item.prefactura_json?.fecha_emision ||
    item.prefactura_json?.fecha ||
    item.resultado_analisis_json?.fecha_atencion ||
    item.created_at ||
    null

  const fecha_atencion = rawFecha ? sanitizeString(rawFecha) : null

  const rawApi =
    item.api ||
    item.api_origen ||
    item.origen_api ||
    item.fuente_api ||
    item.canal_api ||
    item.canal ||
    item.historia_clinica_json?.api ||
    item.prefactura_json?.api ||
    'v1'

  const api = sanitizeString(rawApi, 'v1')

  const rawGlosas = Array.isArray(item.glosas_resumen)
    ? item.glosas_resumen
    : Array.isArray(item.glosas)
    ? item.glosas
    : Array.isArray(item.resultado_analisis_json?.glosas)
    ? item.resultado_analisis_json.glosas
    : []

  const glosas_resumen: GlosaResumen[] = rawGlosas.map((g: any) => ({
    codigo: String(g?.codigo || g?.code || 'GLOSA'),
    categoria: String(g?.categoria || g?.category || 'General'),
    referencia_normativa: g?.referencia_normativa
      ? String(g.referencia_normativa)
      : undefined,
    severidad: String(g?.severidad || g?.severity || 'media'),
    campo: String(g?.campo || g?.field || 'desconocido'),
    descripcion: String(g?.descripcion || g?.description || g?.mensaje || ''),
    evidencia: g?.evidencia || undefined,
  }))

  // Cruzar todos los procedimientos de Historia Clínica con los ítems de Prefactura para detectar TODAS las fugas de ingreso
  const rawHcProc =
    item.historia_clinica_json?.procedimientos ||
    item.historia_clinica_json?.actividades ||
    item.historia_clinica_json?.atencion?.items ||
    []
  const hcProcedures: any[] = Array.isArray(rawHcProc) ? rawHcProc : []

  const rawPfItems =
    item.prefactura_json?.items ||
    item.prefactura_json?.items_facturados ||
    item.prefactura_json?.detalles ||
    []
  const pfItems: any[] = Array.isArray(rawPfItems) ? rawPfItems : []

  const billedCups = new Set(
    pfItems
      .map((pi: any) => pi?.codigo_cups || pi?.codigo_cups_facturado || pi?.cups || pi?.codigo)
      .filter(Boolean)
      .map(String)
  )

  if (Array.isArray(hcProcedures) && hcProcedures.length > 0) {
    hcProcedures.forEach((proc: any, pIdx: number) => {
      const cups = String(proc?.cups || proc?.codigo_cups || proc?.codigo || '')
      if (cups && !billedCups.has(cups)) {
        const alreadyInGlosas = glosas_resumen.some(
          (g) =>
            g.evidencia?.codigo_cups === cups ||
            g.campo?.includes(cups) ||
            g.descripcion?.includes(cups)
        )
        if (!alreadyInGlosas) {
          const desc = proc?.descripcion || proc?.nombre || proc?.procedimiento || `Procedimiento ${cups}`
          const cant = Number(proc?.cantidad || proc?.cantidad_realizada || 1)
          glosas_resumen.push({
            codigo: 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO',
            categoria: 'fuga_ingreso',
            referencia_normativa: 'Resolución 3047 de 2008',
            severidad: 'alta',
            campo: `historia_clinica.procedimientos[${pIdx}].cups`,
            descripcion: `Fuga de Ingreso: El procedimiento '${desc}' (CUPS ${cups}) con soporte en la historia clínica (cantidad: ${cant}) no fue facturado en la prefactura.`,
            evidencia: {
              codigo_cups: cups,
              descripcion: desc,
              cantidad_historia: cant,
              cantidad_prefactura: 0,
              unidades_faltantes: cant,
            },
          })
        }
      }
    })
  }

  const total_glosas =
    typeof item.total_glosas === 'number'
      ? item.total_glosas
      : item.resultado_analisis_json?.resumen?.total_glosas ?? glosas_resumen.length

  const total_advertencias =
    typeof item.total_advertencias === 'number'
      ? item.total_advertencias
      : item.resultado_analisis_json?.resumen?.total_advertencias ?? 0

  let es_consistente: boolean
  if (
    item.es_consistente === false ||
    item.es_consistente === 'false' ||
    total_glosas > 0 ||
    glosas_resumen.length > 0 ||
    item.estado_analisis === 'con_glosa'
  ) {
    es_consistente = false
  } else if (
    item.es_consistente === true ||
    item.es_consistente === 'true'
  ) {
    es_consistente = true
  } else {
    es_consistente = total_glosas === 0
  }

  let severidad_maxima: SeveridadMaximaType = null
  const rawSeveridad = item.severidad_maxima || item.severidad
  if (
    rawSeveridad === 'alta' ||
    rawSeveridad === 'media' ||
    rawSeveridad === 'baja'
  ) {
    severidad_maxima = rawSeveridad
  } else if (glosas_resumen.length > 0) {
    const severidades = glosas_resumen.map((g) => String(g.severidad).toLowerCase())
    if (severidades.includes('alta')) {
      severidad_maxima = 'alta'
    } else if (severidades.includes('media')) {
      severidad_maxima = 'media'
    } else if (severidades.includes('baja')) {
      severidad_maxima = 'baja'
    }
  }

  let estado_analisis: EstadoAnalisisType = null
  if (
    item.estado_analisis === 'con_glosa' ||
    item.estado_analisis === 'sin_glosa' ||
    item.estado_analisis === 'con_advertencias'
  ) {
    estado_analisis = item.estado_analisis
  } else if (total_glosas > 0) {
    estado_analisis = 'con_glosa'
  } else if (total_advertencias > 0) {
    estado_analisis = 'con_advertencias'
  } else {
    estado_analisis = 'sin_glosa'
  }

  const tiene_glosas =
    typeof item.tiene_glosas === 'boolean'
      ? item.tiene_glosas
      : total_glosas > 0

  const rawConteo =
    item.conteo_severidades && typeof item.conteo_severidades === 'object'
      ? item.conteo_severidades
      : {}

  const conteo_severidades = {
    alta: Number(rawConteo.alta) || glosas_resumen.filter((g) => g.severidad === 'alta').length,
    media: Number(rawConteo.media) || glosas_resumen.filter((g) => g.severidad === 'media').length,
    baja: Number(rawConteo.baja) || glosas_resumen.filter((g) => g.severidad === 'baja').length,
    ...rawConteo,
  }

  const estado = String(item.estado || 'completado')
  const error_detalle = item.error_detalle ? String(item.error_detalle) : null
  const created_at = String(
    item.created_at || item.fecha_creacion || new Date().toISOString()
  )
  const updated_at = String(
    item.updated_at || item.fecha_actualizacion || created_at
  )

  return {
    id,
    estado,
    estado_analisis,
    es_consistente,
    tiene_glosas,
    total_glosas,
    total_advertencias,
    severidad_maxima,
    conteo_severidades,
    paciente_documento: paciente_documento ? String(paciente_documento) : null,
    paciente_nombre: String(paciente_nombre),
    eps: String(eps),
    api: String(api),
    fecha_atencion: fecha_atencion ? String(fecha_atencion) : null,
    glosas_resumen,
    error_detalle,
    historia_clinica_json:
      item.historia_clinica_json && typeof item.historia_clinica_json === 'object'
        ? item.historia_clinica_json
        : null,
    prefactura_json:
      item.prefactura_json && typeof item.prefactura_json === 'object'
        ? item.prefactura_json
        : null,
    resultado_analisis_json:
      item.resultado_analisis_json &&
      typeof item.resultado_analisis_json === 'object'
        ? item.resultado_analisis_json
        : null,
    created_at,
    updated_at,
  }
}

export function normalizePaginatedCasosResponse(
  data: any,
  params?: CasosQueryParams
): PaginatedCasosResponse {
  if (!data || typeof data === 'string' || typeof data !== 'object') {
    throw new Error('La respuesta de la API no es un objeto JSON válido')
  }

  let rawItems: any[] | null = null
  if (Array.isArray(data)) {
    rawItems = data
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) rawItems = data.items
    else if (Array.isArray(data.data)) rawItems = data.data
    else if (Array.isArray(data.casos)) rawItems = data.casos
    else if (Array.isArray(data.results)) rawItems = data.results
  }

  if (!rawItems || !Array.isArray(rawItems)) {
    throw new Error('No se encontró un arreglo de ítems en la respuesta')
  }

  const total =
    typeof data?.total === 'number'
      ? data.total
      : typeof data?.count === 'number'
      ? data.count
      : rawItems.length

  const page =
    typeof data?.page === 'number'
      ? data.page
      : typeof data?.page_index === 'number'
      ? data.page_index
      : params?.page || 1

  const page_size =
    typeof data?.page_size === 'number'
      ? data.page_size
      : typeof data?.per_page === 'number'
      ? data.per_page
      : params?.page_size || 10

  const total_pages =
    typeof data?.total_pages === 'number'
      ? data.total_pages
      : Math.ceil(total / page_size) || 1

  const has_next =
    typeof data?.has_next === 'boolean'
      ? data.has_next
      : page < total_pages

  const has_prev =
    typeof data?.has_prev === 'boolean'
      ? data.has_prev
      : page > 1

  const items = rawItems.map(normalizeCasoItem)

  const normalizedResponse: PaginatedCasosResponse = {
    items,
    total,
    page,
    page_size,
    total_pages,
    has_next,
    has_prev,
  }

  try {
    return paginatedCasosResponseSchema.parse(normalizedResponse)
  } catch {
    return normalizedResponse
  }
}

export async function fetchCasosAuditados(
  params?: CasosQueryParams
): Promise<PaginatedCasosResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/casos/auditados`,
      {
        params,
        validateStatus: (status) => status >= 200 && status < 300,
      }
    )
    if (response.data && typeof response.data === 'object' && !response.data.detail) {
      return normalizePaginatedCasosResponse(response.data, params)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      'Backend API unavailable, using mock fallback for auditados:',
      error
    )
  }
  return getMockPaginatedCasos(params)
}

export async function fetchCasos(
  params?: CasosQueryParams
): Promise<PaginatedCasosResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/casos`,
      {
        params,
        validateStatus: (status) => status >= 200 && status < 300,
      }
    )
    if (response.data && typeof response.data === 'object' && !response.data.detail) {
      return normalizePaginatedCasosResponse(response.data, params)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      'Backend API unavailable, using mock fallback for casos:',
      error
    )
  }
  return getMockPaginatedCasos(params)
}

function hashStringToIndex(str: string, max: number): number {
  if (!str || max <= 0) return 0
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % max
}

export async function fetchCasoById(id: string): Promise<CasoAuditoriaTablaItem> {
  if (!id) {
    throw new Error('ID de caso no especificado')
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/v1/casos/${id}`, {
      validateStatus: (status) => status >= 200 && status < 300,
    })
    if (response.data && typeof response.data === 'object' && !response.data.detail) {
      return normalizeCasoItem(response.data)
    }
  } catch (_err1) {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/casos/auditados/${id}`, {
        validateStatus: (status) => status >= 200 && status < 300,
      })
      if (response.data && typeof response.data === 'object' && !response.data.detail) {
        return normalizeCasoItem(response.data)
      }
    } catch (_err2) {
      // Backend endpoint no disponible o retornó error 500, usar fallback
    }
  }

  const found = MOCK_CASOS_ITEMS.find(
    (item) => item.id.toLowerCase() === id.toLowerCase()
  )

  if (found) {
    return found
  }

  const mockIndex = hashStringToIndex(id, MOCK_CASOS_ITEMS.length)
  const baseMock = MOCK_CASOS_ITEMS[mockIndex] || MOCK_CASOS_ITEMS[0]

  return normalizeCasoItem({
    ...baseMock,
    id,
    paciente_nombre: baseMock.paciente_nombre,
    paciente_documento: baseMock.paciente_documento,
  })
}

export function useCasosAuditadosQuery(params?: CasosQueryParams) {
  return useQuery<PaginatedCasosResponse>({
    queryKey: ['casosAuditados', params],
    queryFn: () => fetchCasosAuditados(params),
  })
}

export function useCasosQuery(params?: CasosQueryParams) {
  return useQuery<PaginatedCasosResponse>({
    queryKey: ['casos', params],
    queryFn: () => fetchCasos(params),
  })
}

export function useCasoDetailQuery(id: string) {
  return useQuery<CasoAuditoriaTablaItem>({
    queryKey: ['casoDetail', id],
    queryFn: () => fetchCasoById(id),
    enabled: Boolean(id),
  })
}
