// Next
import Image from 'next/image'

// Lib
import { cn } from '@/lib/utils'

// Logos
import logo from '@public/logo/logo.png'
import logoText from '@public/logo/logo-text.png'
import logoLight from '@public/logo/logo-light.png'
import logoTextLight from '@public/logo/logo-text-light.png'

interface Props {
  text?: boolean
  light?: boolean
  width?: number
  className?: string
  hidden?: boolean
}

export function Logo(props: Props) {
  const { text, light, width = 154, hidden, className } = props

  // Sem `light` informado, o logo acompanha o tema: versão de letras escuras no
  // claro e de letras claras no escuro
  if (light === undefined) {
    return (
      <>
        <Image
          src={text ? logoText : logo}
          alt="logo atrupe"
          width={width}
          hidden={hidden}
          priority
          className={cn(className, 'dark:hidden')}
        />
        <Image
          src={text ? logoTextLight : logoLight}
          alt="logo atrupe"
          width={width}
          hidden={hidden}
          priority
          className={cn(className, 'hidden dark:block')}
        />
      </>
    )
  }

  let selectedLogo = logoText

  if (text) {
    selectedLogo = light ? logoTextLight : logoText
  } else {
    selectedLogo = light ? logoLight : logo
  }

  return (
    <Image
      src={selectedLogo}
      alt="logo atrupe"
      width={width}
      hidden={hidden}
      priority
      className={className}
    />
  )
}
