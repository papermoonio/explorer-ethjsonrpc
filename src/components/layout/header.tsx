import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Sun, Moon, Monitor, BookOpen, Github, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { env } from '@/config/env'
import { useAppStore } from '@/stores/app-store'
import { SearchBar } from '@/components/layout/search-bar'
import { ChainDropdown } from '@/components/chain/chain-dropdown'

type Theme = 'light' | 'dark' | 'system'
const themeOrder: Theme[] = ['light', 'dark', 'system']
const themeIcons: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor }

function ExternalLinks() {
  const { t } = useTranslation()
  return (
    <>
      {env.docsUrl && (
        <Button variant="ghost" size="icon" asChild>
          <a href={env.docsUrl} target="_blank" rel="noopener noreferrer" aria-label={t('header.docs')}>
            <BookOpen className="size-4" />
          </a>
        </Button>
      )}
      {env.githubUrl && (
        <Button variant="ghost" size="icon" asChild>
          <a href={env.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={t('header.github')}>
            <Github className="size-4" />
          </a>
        </Button>
      )}
    </>
  )
}

function ThemeToggle({ label }: { label?: boolean }) {
  const { t } = useTranslation()
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const ThemeIcon = themeIcons[theme]

  function cycleTheme() {
    const idx = themeOrder.indexOf(theme)
    setTheme(themeOrder[(idx + 1) % themeOrder.length]!)
  }

  if (label) {
    return (
      <Button variant="outline" size="sm" onClick={cycleTheme}>
        <ThemeIcon className="mr-2 size-4" />
        {t('header.theme')}
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label={t('header.theme')}>
      <ThemeIcon className="size-4" />
    </Button>
  )
}

export function Header() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold">
          {env.appLogoUrl && <img src={env.appLogoUrl} alt="" className="size-6" />}
          <span className="hidden sm:inline">{env.appTitle}</span>
        </Link>

        {/* Desktop controls */}
        <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
          <SearchBar />
          <ChainDropdown />
          <ExternalLinks />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('header.menu')}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>{env.appTitle}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <SearchBar />
                <ChainDropdown />
                <div className="flex items-center gap-2">
                  <ThemeToggle label />
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLinks />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
