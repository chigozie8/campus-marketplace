'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Pencil, Save, X, Receipt } from 'lucide-react'

interface PlatformFeeEditorProps {
  initialAmount: number
  initialLabel: string
}

export function PlatformFeeEditor({ initialAmount, initialLabel }: PlatformFeeEditorProps) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(String(initialAmount))
  const [label, setLabel] = useState(initialLabel)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const parsed = Number(amount)
    if (!label.trim()) { toast.error('Fee label cannot be empty'); return }
    if (isNaN(parsed) || parsed < 0) { toast.error('Enter a valid amount (0 or more)'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            platform_fee_amount: String(Math.round(parsed)),
            platform_fee_label: label.trim(),
          },
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('VAT settings updated')
      setEditing(false)
    } catch {
      toast.error('Could not save — try again')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setAmount(String(initialAmount))
    setLabel(initialLabel)
    setEditing(false)
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <div>
            <h4 className="font-black text-sm text-foreground">Platform / Escrow Fee</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Added to every buyer's checkout total <span className="font-semibold">and</span> retained by VendoorX from each escrow payment. Shown as "{label}" on the payment screen.
            </p>
          </div>
        </div>
        {!editing && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-8 gap-1.5 text-xs font-semibold shrink-0"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        {!editing ? (
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Fee label (shown to buyers)</p>
              <p className="font-black text-foreground mt-0.5">{label}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Amount (₦)</p>
              <p className="font-black text-foreground mt-0.5 text-lg">₦{Number(amount).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Fee label — what buyers see at checkout
              </Label>
              <Input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. VAT & Service Fee"
                className="rounded-xl h-10 text-sm"
                maxLength={60}
              />
              <p className="text-[11px] text-muted-foreground">
                Examples: "VAT & Service Fee", "Processing Fee", "Platform Charge"
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Amount (₦)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₦</span>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="rounded-xl h-10 pl-7 text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Set to 0 to remove the fee entirely. Changes apply to all new orders immediately.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-9 rounded-xl font-bold text-sm gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
                className="h-9 rounded-xl font-semibold text-sm gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
