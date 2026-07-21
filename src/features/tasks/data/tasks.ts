import { faker } from '@faker-js/faker'

faker.seed(12345)

const taskTitles = [
  'Revisar cruce de historia clinica y prefactura',
  'Validar soporte clinico de procedimiento',
  'Actualizar regla de diagnostico relacionado',
  'Documentar glosa por servicio no facturado',
  'Revisar severidad de alerta media',
  'Confirmar cantidad facturada contra cantidad realizada',
  'Preparar reporte de inconsistencias semanales',
  'Ajustar notificacion para severidad alta',
  'Verificar radicado con resultado consistente',
  'Cargar normativa de auditoria medica',
]

const taskDescriptions = [
  'Validar que el servicio facturado tenga soporte clinico suficiente.',
  'Revisar la relacion entre diagnostico principal y codigo CUPS.',
  'Confirmar que la prefactura coincida con los detalles de la atencion.',
  'Registrar observaciones para seguimiento del equipo auditor.',
  'Marcar el caso para revision manual antes de cerrar el radicado.',
]

export const tasks = Array.from({ length: 100 }, () => {
  const statuses = [
    'todo',
    'in progress',
    'done',
    'canceled',
    'backlog',
  ] as const
  const labels = ['bug', 'feature', 'documentation'] as const
  const priorities = ['low', 'medium', 'high'] as const

  return {
    id: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.helpers.arrayElement(taskTitles),
    status: faker.helpers.arrayElement(statuses),
    label: faker.helpers.arrayElement(labels),
    priority: faker.helpers.arrayElement(priorities),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    assignee: faker.person.fullName(),
    description: faker.helpers.arrayElement(taskDescriptions),
    dueDate: faker.date.future(),
  }
})
