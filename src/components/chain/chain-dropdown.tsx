import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAppStore, useAllChains } from '@/stores/app-store'
import { AddChainDialog } from '@/components/chain/add-chain-dialog'

export function ChainDropdown() {
  const { t } = useTranslation()
  const selectedChain = useAppStore((s) => s.selectedChain)
  const setSelectedChain = useAppStore((s) => s.setSelectedChain)
  const allChains = useAllChains()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">{selectedChain.displayName}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allChains.map((chain) => (
            <DropdownMenuItem key={chain.id} onClick={() => setSelectedChain(chain)}>
              {chain.id === selectedChain.id && <Check className="size-4" />}
              <span className={chain.id === selectedChain.id ? 'font-medium' : ''}>{chain.displayName}</span>
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
