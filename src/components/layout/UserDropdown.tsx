'use client'

// Next
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

// UI
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'

// Components
import { MyProfileDialog } from './MyProfile'
import { THEME_OPTIONS } from './theme-options'

// Icons
import {
  IconCreditCard as CreditCard,
  IconDotsVertical,
  IconLogout as LogOut,
  IconUser as User,
} from '@tabler/icons-react'

// Lib
import { cn } from '@/lib/utils'

export function UserDropdown({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const currentTheme =
    THEME_OPTIONS.find((option) => option.value === theme) ??
    THEME_OPTIONS[THEME_OPTIONS.length - 1]

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
              <DropdownMenuItem>
                <User size={16} className="mr-2" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
            </DialogTrigger>
            {session?.user?.isAdmin && (
              <DropdownMenuItem
                onClick={() =>
                  router.push('/configuracoes/empresa-e-sistema/assinatura')
                }
              >
                <CreditCard size={16} className="mr-2" />
                <span>Assinatura</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <currentTheme.icon size={16} className="mr-2" />
                <span>Tema</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-36">
                  <DropdownMenuRadioGroup
                    value={currentTheme.value}
                    onValueChange={setTheme}
                  >
                    {THEME_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        <option.icon size={16} className="mr-2" />
                        <span>{option.label}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
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
