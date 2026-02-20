import { useEffect } from 'react'
import { env } from '@/config/env'

/**
 * Set the document title. Appends the app title from env config.
 * Example: usePageTitle('Block #12345') -> "Block #12345 | Block Explorer"
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${env.appTitle}` : env.appTitle
  }, [title])
}
