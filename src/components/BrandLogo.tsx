import muntieLogo from '@/assets/muntie-logo.png'
import { cn } from '@/lib/utils'

const logoClasses = 'block h-auto w-52 sm:w-64 md:w-80 max-w-full object-contain'

interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src={muntieLogo}
      alt="The Medicare Optimizer"
      className={cn(logoClasses, className)}
    />
  )
}
