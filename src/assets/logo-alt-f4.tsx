import logoAltF4Svg from '@/assets/brand-icons/logo_alt-f4-ia.svg'
import { cn } from '@/lib/utils'

export function LogoAltF4({ className }: { className?: string }) {
  return (
    <img
      src={logoAltF4Svg}
      alt='Alt-F4 IA'
      className={cn('w-full h-auto max-h-14 object-contain dark:invert', className)}
    />
  )
}
