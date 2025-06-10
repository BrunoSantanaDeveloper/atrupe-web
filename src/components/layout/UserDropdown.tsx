'use client'

// Next
import { useRouter } from 'next/navigation'

// UI
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'

// Components
import { MyProfileDialog } from './MyProfile'

// Icons
import { LogOut, User } from 'lucide-react'

// Actions
import { IconDotsVertical } from '@tabler/icons-react'

// Lib
import { cn } from '@/lib/utils'

export function UserDropdown({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()

  const handleLogOut = () => {
    router.push('/logout')
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="iconXs"
            variant={collapsed ? 'neutralLight' : 'neutralGhost'}
            className={cn(
              'rounded-full absolute right-3',
              collapsed
                ? 'shadow-lg outline outline-1 outline-gray-200 bg-white'
                : '',
            )}
          >
            <IconDotsVertical className="text-gray" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40" align="start">
          <DropdownMenuGroup>
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => {}}>
                <User size={16} className="mr-2" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogOut}>
            <LogOut size={16} className="mr-2" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MyProfileDialog />
    </Dialog>
  )
}
