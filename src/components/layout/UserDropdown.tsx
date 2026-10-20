'use client'

// Next
import { useRouter } from '@/hooks/useRouter'
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
import { THEME_OPTIONS, THEME_SWITCHER } from './theme-options'

// Icons
import {
  IconCreditCard as CreditCard,
  IconDotsVertical,
  IconLogout as LogOut,
  IconUser as User,
} from '@tabler/icons-react'
import { Icon, ICON_SIZE } from '@/components/ui/icon'

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
            <Icon icon={IconDotsVertical} size="sm" className="text-gray" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40" align="start">
          <DropdownMenuGroup>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Icon icon={User} size="md" className="mr-2" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
            </DialogTrigger>
            {session?.user?.isAdmin && (
              <DropdownMenuItem
                onClick={() =>
                  router.push('/configuracoes/empresa-e-sistema/assinatura')
                }
              >
                <Icon icon={CreditCard} size="md" className="mr-2" />
                <span>Assinatura</span>
              </DropdownMenuItem>
            )}
            {/* Escondido até a mudança tema-claro-escuro ser arquivada */}
            {THEME_SWITCHER && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <currentTheme.icon size={ICON_SIZE.sm} className="mr-2" />
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
                          <option.icon size={ICON_SIZE.sm} className="mr-2" />
                          <span>{option.label}</span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogOut}>
            <Icon icon={LogOut} size="md" className="mr-2" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MyProfileDialog />
    </Dialog>
  )
}
