import * as React from 'react'
import { LogoAltF4 } from '@/assets/logo-alt-f4'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams: _teams }: TeamSwitcherProps) {
  return (
    <SidebarMenu className='w-full mb-0 pb-0'>
      <SidebarMenuItem className='w-full mb-0 pb-0'>
        <SidebarMenuButton
          size='lg'
          className='py-0.5 pt-1 pb-0 mb-0 px-1 h-auto hover:bg-transparent active:bg-transparent cursor-pointer w-full min-h-0'
        >
          <div className='w-full py-0 pb-0 my-0 mb-0 px-1'>
            <LogoAltF4 className='w-full h-auto max-h-14' />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
