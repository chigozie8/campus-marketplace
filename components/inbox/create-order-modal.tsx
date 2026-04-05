'use client'

import { useState } from 'react'
import { X, ShoppingCart, Package, Check } from 'lucide-react'

interface Props {
  customerName: string
  products: { id: string; title: string; price: number; images: string[] | null }[]
  onClose: () => void
}

export function CreateOrderModal({ customerName, products, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)

  const selected = products.find(p => p.id === selectedId)
  const total = selected ? selected.price * qty : 0

  function handleCreate() {
    if (!selected) return
    // In production: POST /api/orders with { product_id, qty, notes, customer }
    setDone(true)
    setTimeout(onClose, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <h2 className="font-black text-sm text-gray-950 dark:text-white">Create Order</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <p className="font-bold text-gray-950 dark:text-white">Order created!</p>
            <p className="text-xs text-gray-400">Closing…</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{customerName}</p>
            </div>

            {/* Product selector */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Select product</p>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                      selectedId === p.id
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-border hover:border-gray-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        : <Package className="w-4 h-4 text-gray-400 m-auto mt-2.5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-primary font-bold">₦{p.price.toLocaleString()}</p>
                    </div>
                    {selectedId === p.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            {selected && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-border font-bold text-gray-600 hover:bg-gray-50 dark:hover:bg-muted transition-colors flex items-center justify-center">
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900 dark:text-white">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-border font-bold text-gray-600 hover:bg-gray-50 dark:hover:bg-muted transition-colors flex items-center justify-center">
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="font-black text-lg text-gray-950 dark:text-white">₦{total.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Notes (optional)</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Delivery instructions, special requests…"
                rows={2}
                className="w-full text-xs rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted px-3 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!selected}
              className="w-full flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-sm py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 shadow-lg shadow-black/10"
            >
              <ShoppingCart className="w-4 h-4" />
              Confirm Order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
