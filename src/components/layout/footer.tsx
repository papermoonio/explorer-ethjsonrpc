import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { env } from '@/config/env'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          {env.appDescription && <span>{env.appDescription}</span>}
          <span>{t('footer.poweredBy')}</span>
        </div>
        <div className="flex items-center gap-4">
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
