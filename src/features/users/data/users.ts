import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(67890)

const patientFirstNames = [
  'Maria',
  'Carlos',
  'Ana',
  'Jorge',
  'Lucia',
  'Andres',
  'Patricia',
  'Luis',
  'Diana',
  'Fernando',
  'Claudia',
  'Santiago',
  'Gloria',
  'Ricardo',
  'Paula',
  'Miguel',
]

const patientLastNames = [
  'Gomez',
  'Rodriguez',
  'Martinez',
  'Lopez',
  'Garcia',
  'Hernandez',
  'Ramirez',
  'Torres',
  'Castro',
  'Rojas',
  'Moreno',
  'Vargas',
  'Ortiz',
  'Jimenez',
  'Diaz',
  'Ruiz',
]

const auditResults = [
  { status: 'inconsistente', role: 'media' },
  { status: 'inconsistente', role: 'media' },
  { status: 'inconsistente', role: 'alta' },
  { status: 'consistente', role: 'ninguna' },
  { status: 'consistente', role: 'ninguna' },
] as const

export const users = Array.from({ length: 5 }, (_, index) => {
  const firstName = faker.helpers.arrayElement(patientFirstNames)
  const lastName = faker.helpers.arrayElement(patientLastNames)
  const eps = faker.helpers.arrayElement([
    'Sura EPS',
    'Nueva EPS',
    'Sanitas',
    'Compensar',
    'Salud Total',
    'Famisanar',
  ])
  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    username: `RAD-2026-${String(index + 1).padStart(5, '0')}`,
    email: eps,
    phoneNumber: faker.date.recent({ days: 30 }).toLocaleDateString('es-CO'),
    status: auditResults[index].status,
    role: auditResults[index].role,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
