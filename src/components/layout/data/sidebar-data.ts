import {
  ListTodo,
  HelpCircle,
  Users,
  KeyRound,
  BrainCircuit,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Auditor Medico',
    email: 'alft4-sic@auditor.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Alt-F4 IA',
      logo: Command,
      plan: '',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Auditor IA',
          url: '/auditor-ia',
          icon: BrainCircuit,
        },
        {
          title: 'Auditorias Api',
          url: '/radicados-api',
          icon: Users,
        },
        {
          title: 'Resumen',
          url: '/resumen',
          icon: ListTodo,
        },
      ],
    },
    {
      title: 'Otros',
      items: [
        {
          title: 'Clave API',
          url: '/configuracion/clave-api',
          icon: KeyRound,
        },
        {
          title: 'Equipo',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
