'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, CheckCircle2, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ReceiptData {
  reference: string
  order_id: string
  buyer_name: string
  buyer_email: string
  product_name: string
  quantity: number
  amount: number
  status: string
  date: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export default function ReceiptPage() {
  const params = useParams()
  const reference = params.reference as string
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) return
    fetch(`/api/receipt/${encodeURIComponent(reference)}`)
      .then(r => r.json())
      .then(r => {
        if (r.success) setReceipt(r.data)
        else setError(r.message || 'Receipt not found')
      })
      .catch(() => setError('Failed to load receipt'))
      .finally(() => setLoading(false))
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">Loading receipt…</p>
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-lg font-bold text-gray-800 mb-2">Receipt Not Found</p>
          <p className="text-sm text-gray-500 mb-6">{error || 'We could not find this receipt.'}</p>
          <Link href="/dashboard/orders" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 print:bg-white print:p-0">
      {/* Controls — hidden when printing */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Download className="w-4 h-4" />
          Save as PDF
        </button>
      </div>

      {/* Receipt card */}
      <div
        id="receipt"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none"
      >
        {/* Header */}
        <div className="bg-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black tracking-tight">VendoorX</span>
              </div>
              <p className="text-emerald-200 text-xs">www.vendoorx.ng</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-200 text-xs uppercase tracking-wider mb-1">Payment Receipt</p>
              <div className="bg-white/20 rounded-lg px-3 py-1">
                <p className="text-white font-mono text-xs font-bold">{shortId(receipt.order_id)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-8 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-emerald-800 text-sm font-semibold">Payment Successful</p>
          <span className="ml-auto text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium capitalize">
            {receipt.status}
          </span>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Amount */}
          <div className="text-center py-4 border-b border-dashed border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount Paid</p>
            <p className="text-4xl font-black text-gray-900">₦{receipt.amount.toLocaleString()}</p>
          </div>

          {/* Details table */}
          <div className="space-y-3">
            <DetailRow label="Date" value={formatDate(receipt.date)} />
            <DetailRow label="Buyer Name" value={receipt.buyer_name} />
            {receipt.buyer_email && <DetailRow label="Email" value={receipt.buyer_email} />}
            <DetailRow label="Product" value={receipt.product_name} />
            <DetailRow label="Quantity" value={String(receipt.quantity)} />
            <div className="border-t border-dashed border-gray-200 pt-3 space-y-3">
              <DetailRow label="Transaction Reference" value={receipt.reference ?? reference} mono />
              <DetailRow label="Order ID" value={shortId(receipt.order_id)} mono />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            Thank you for shopping on <span className="font-semibold text-gray-600">VendoorX</span> — Nigeria&apos;s campus marketplace.
            <br />
            For support, contact us at{' '}
            <span className="text-emerald-600 font-medium">support@vendoorx.ng</span>
          </p>
          <div className="mt-3 flex items-center justify-center gap-1">
            <div className="h-px bg-gray-200 flex-1" />
            <p className="text-[10px] text-gray-300 px-2 font-mono">{receipt.reference ?? reference}</p>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
        }
      `}</style>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs text-gray-400 shrink-0 mt-0.5">{label}</p>
      <p className={`text-sm text-right text-gray-800 font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </p>
    </div>
  )
}
