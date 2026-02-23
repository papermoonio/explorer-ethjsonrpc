import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { detectSearchType } from '@/lib/search'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const type = detectSearchType(trimmed)
    switch (type) {
      case 'address':
        navigate(`/address/${trimmed}`)
        break
      case 'hash':
        // 64-char hex could be tx hash OR block hash.
        // Default to tx; the TxDetailPage will offer "Try as block hash?" if not found.
        navigate(`/tx/${trimmed}`)
        break
      case 'hexBlock':
      case 'blockNumber':
        navigate(`/block/${trimmed}`)
        break
      default:
        toast.error(t('search.invalid'))
        return
    }

    setQuery('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('header.search')}
          className="pl-9"
        />
      </div>
      <Button type="submit" size="icon" variant="outline" aria-label="Search">
        <Search className="size-4" />
      </Button>
    </form>
  )
}
