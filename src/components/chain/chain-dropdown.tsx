import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Plus, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAppStore, useAllChains } from '@/stores/app-store'
import { defaultChains } from '@/config/chains'
import { AddChainDialog } from '@/components/chain/add-chain-dialog'

export function ChainDropdown() {
  const { t } = useTranslation()
  const selectedChain = useAppStore((s) => s.selectedChain)
  const setSelectedChain = useAppStore((s) => s.setSelectedChain)
  const removeCustomChain = useAppStore((s) => s.removeCustomChain)
  const allChains = useAllChains()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isCustom = (chainId: number) => !defaultChains.some((c) => c.id === chainId)

  function handleRemove(e: React.MouseEvent, chainId: number) {
    e.stopPropagation()
    if (selectedChain.id === chainId) {
      setSelectedChain(defaultChains[0]!)
    }
    removeCustomChain(chainId)
    toast.success(t('chain.removed'))
    setMenuOpen(false)
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">{selectedChain.displayName}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allChains.map((chain) => (
            <DropdownMenuItem key={chain.id} onClick={() => setSelectedChain(chain)}>
              {chain.id === selectedChain.id && <Check className="size-4" />}
              <span className={chain.id === selectedChain.id ? 'font-medium' : '' + ' flex-1'}>{chain.displayName}</span>
              {isCustom(chain.id) && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, chain.id)}
                  className="ml-2 rounded p-0.5 hover:bg-destructive/20 hover:text-destructive"
                  aria-label={t('chain.remove')}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {t('chain.addCustom')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddChainDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
