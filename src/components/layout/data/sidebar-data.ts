import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  KeyRound,
  MessagesSquare,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Auditor Medico IA',
      logo: Command,
      plan: 'ALT-F4-SIC-2026',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Panel',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Auditor IA',
          url: '/chats',
          badge: 'ML',
          icon: MessagesSquare,
        },
        {
          title: 'Auditorias Api',
          url: '/radicados-api',
          icon: Users,
        },
        {
          title: 'Normativas',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Tareas',
          url: '/tasks',
          icon: ListTodo,
        },
      ],
    },
    {
      title: 'Paginas',
      items: [
        {
          title: 'Errores',
          icon: Bug,
          items: [
            {
              title: 'No autorizado',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Prohibido',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'No encontrado',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Metricas Modelo',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Mantenimiento',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Otros',
      items: [
        {
          title: 'Configuracion',
          icon: Settings,
          items: [
            {
              title: 'Perfil',
              url: '/configuracion',
              icon: UserCog,
            },
            {
              title: 'Cuenta',
              url: '/configuracion/cuenta',
              icon: Wrench,
            },
            {
              title: 'Apariencia',
              url: '/configuracion/apariencia',
              icon: Palette,
            },
            {
              title: 'Notificaciones',
              url: '/configuracion/notificaciones',
              icon: Bell,
            },
            {
              title: 'Visualizacion',
              url: '/configuracion/visualizacion',
              icon: Monitor,
            },
            {
              title: 'Clave API',
              url: '/configuracion/clave-api',
              icon: KeyRound,
            },
          ],
        },
        {
          title: 'Sobre Nosotros',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
