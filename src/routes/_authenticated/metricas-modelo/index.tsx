import { createFileRoute } from '@tanstack/react-router'
import { ModelMetrics } from '@/features/model-metrics'

export const Route = createFileRoute('/_authenticated/metricas-modelo/')({
  component: ModelMetrics,
})
