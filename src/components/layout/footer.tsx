import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { env } from '@/config/env'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-2 px-4 py-4 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="text-center sm:text-left">
          {env.appDescription && <span>{env.appDescription}</span>}
        </div>
        <div className="text-center">
          <span>Built with 🩵 by <a href="https://papermoon.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">PaperMoon</a></span>
        </div>
        <div className="flex items-center justify-center gap-4 sm:justify-end">
          {env.docsUrl && (
            <a href={env.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
              {t('header.docs')}
              <ExternalLink className="size-3" />
            </a>
          )}
          {env.githubUrl && (
            <a href={env.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
              {t('header.github')}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
