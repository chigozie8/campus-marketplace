'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function MetaMaskIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.958 1L19.48 10.892l2.453-5.784L32.958 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.042 1l13.361 9.984-2.336-5.876L2.042 1z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28.226 23.533l-3.588 5.483 7.677 2.115 2.205-7.463-6.294-.135zM.488 23.668l2.19 7.463 7.662-2.115-3.573-5.483-6.279.135z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.958 14.425l-2.146 3.242 7.633.338-.253-8.21-5.234 4.63zM25.042 14.425l-5.308-4.72-.174 8.3 7.619-.338-2.137-3.242zM10.34 29.016l4.607-2.217-3.966-3.09-.641 5.307zM20.053 26.799l4.592 2.217-.626-5.307-3.966 3.09z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24.645 29.016l-4.592-2.217.368 2.98-.04 1.274 4.264-2.037zM10.34 29.016l4.279 2.037-.025-1.274.354-2.98-4.608 2.217z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.7 21.926l-3.82-1.12 2.697-1.237 1.123 2.357zM20.285 21.926l1.123-2.357 2.712 1.237-3.835 1.12z" fill="#233447" stroke="#233447" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.34 29.016l.656-5.483-4.229.12 3.573 5.363zM23.989 23.533l.671 5.483 3.558-5.363-4.229-.12zM27.177 17.667l-7.619.338.707 3.921 1.123-2.357 2.712 1.237 3.077-3.139zM10.88 20.806l2.712-1.237 1.108 2.357.722-3.921-7.633-.338 3.091 3.139z" fill="#CC6228" stroke="#CC6228" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.812 17.667l3.198 6.24-.101-3.101-3.097-3.139zM24.106 20.806l-.116 3.101 3.187-6.24-3.071 3.139zM14.502 18.005l-.722 3.921.909 4.673.202-6.164-.389-2.43zM20.558 18.005l-.374 2.415.188 6.179.909-4.673-.723-3.921z" fill="#E27525" stroke="#E27525" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.281 21.926l-.909 4.673.656.455 3.966-3.09.116-3.101-3.829 1.063zM10.88 20.863l.101 3.101 3.966 3.09.656-.455-.909-4.673-3.814-1.063z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.32 31.053l.04-1.274-.338-.293h-5.03l-.324.293.025 1.274-4.279-2.037 1.498 1.228 3.038 2.09h5.2l3.053-2.09 1.483-1.228-4.366 2.037z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.028 26.799l-.656-.455h-3.76l-.656.455-.354 2.98.324-.293h5.03l.338.293-.266-2.98z" fill="#161616" stroke="#161616" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M33.517 11.3l1.15-5.559L32.958 1l-11.93 8.848 4.592 3.879 6.49 1.896 1.432-1.668-.622-.45 1.003-.914-.773-.596 1.003-.773-.636-.622zM.333 5.741L1.483 11.3l-.65.622 1.003.773-.758.596 1.003.914-.622.45 1.417 1.668 6.49-1.896 4.591-3.879L2.042 1 .333 5.741z" fill="#763E1A" stroke="#763E1A" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32.11 13.623l-6.49-1.896 1.952 2.94-2.913 5.661 3.835-.05h5.738l-2.122-6.655zM9.38 11.727l-6.49 1.896L.803 20.278h5.723l3.82.05-2.898-5.66 1.932-2.94zM20.558 18.005l.404-7.157 1.845-4.996h-8.21l1.83 4.996.419 7.157.144 2.445.015 6.149h3.76l.03-6.149.163-2.445z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PhantomIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="64" fill="url(#phantom-gradient)"/>
      <defs>
        <linearGradient id="phantom-gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#534BB1"/>
          <stop offset="100%" stopColor="#551BF9"/>
        </linearGradient>
      </defs>
      <path d="M110.2 64c0 25.6-20.8 46.4-46.4 46.4-25.6 0-46.4-20.8-46.4-46.4S38.2 17.6 63.8 17.6c25.6 0 46.4 20.8 46.4 46.4z" fill="white" fillOpacity=".15"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M35 64.5C35 47.655 48.655 34 65.5 34c10.56 0 19.85 5.376 25.3 13.5H80.5C76.36 41.7 71.27 38.5 65.5 38.5 51.14 38.5 39.5 50.14 39.5 64.5S51.14 90.5 65.5 90.5c6.62 0 12.66-2.548 17.14-6.705A22.44 22.44 0 0065.5 89c-12.426 0-22.5-10.074-22.5-22.5 0-4.19 1.14-8.115 3.13-11.46A21.97 21.97 0 0043 64.5C43 75.822 52.178 85 63.5 85S84 75.822 84 64.5c0-.47-.013-.938-.04-1.404A15.98 15.98 0 0080 72.5c-8.284 0-15-6.716-15-15s6.716-15 15-15c3.977 0 7.592 1.548 10.27 4.073C87.63 40.54 79.14 35 69.5 35 51.603 35 37 49.603 37 67.5" fill="white"/>
      <circle cx="80" cy="57.5" r="5" fill="white"/>
      <circle cx="91" cy="57.5" r="3" fill="white"/>
    </svg>
  )
}

type Web3WalletButtonsProps = {
  mode?: 'signin' | 'signup'
}

export function Web3WalletButtons({ mode = 'signin' }: Web3WalletButtonsProps) {
  const router = useRouter()
  const [ethLoading, setEthLoading] = useState(false)
  const [solLoading, setSolLoading] = useState(false)
  const isLoading = ethLoading || solLoading

  async function handleWeb3Response(data: { token_hash: string; email: string }) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: data.token_hash,
      type: 'magiclink',
    })
    if (error) {
      throw new Error('Failed to create session. Please try again.')
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function signInWithEthereum() {
    setEthLoading(true)
    try {
      const eth = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
      if (!eth) {
        toast.error('MetaMask not found', {
          description: 'Install MetaMask at metamask.io then try again.',
        })
        setEthLoading(false)
        return
      }

      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts[0]
      const nonce = `Welcome to VendoorX!\n\nSign this message to verify your wallet.\n\nNonce: ${Date.now()}\n\nThis signature does not cost gas.`

      const signature = await eth.request({
        method: 'personal_sign',
        params: [nonce, address],
      }) as string

      const toastId = toast.loading('Verifying wallet…')
      const res = await fetch('/api/auth/web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: 'ethereum', address, signature, message: nonce }),
      })
      const data = await res.json()
      toast.dismiss(toastId)

      if (!res.ok) {
        toast.error(data.error || 'Ethereum sign-in failed')
        setEthLoading(false)
        return
      }

      await handleWeb3Response(data)
      toast.success(mode === 'signup' ? 'Wallet connected! Welcome to VendoorX.' : 'Signed in with Ethereum!')
    } catch (err: unknown) {
      const code = (err as { code?: number }).code
      if (code === 4001 || code === -32603) {
        toast.error('Signature rejected', { description: 'Please approve the signature request to continue.' })
      } else {
        toast.error('MetaMask sign-in failed. Please try again.')
      }
      setEthLoading(false)
    }
  }

  async function signInWithSolana() {
    setSolLoading(true)
    try {
      const sol = (window as { solana?: { isPhantom?: boolean; connect: () => Promise<void>; publicKey: { toBase58: () => string }; signMessage: (msg: Uint8Array, enc: string) => Promise<{ signature: Uint8Array }> } }).solana
      if (!sol?.isPhantom) {
        toast.error('Phantom not found', {
          description: 'Install Phantom at phantom.app then try again.',
        })
        setSolLoading(false)
        return
      }

      await sol.connect()
      const address = sol.publicKey.toBase58()
      const message = `Welcome to VendoorX!\n\nSign this message to verify your wallet.\n\nNonce: ${Date.now()}\n\nThis signature does not cost any SOL.`

      const encodedMessage = new TextEncoder().encode(message)
      const { signature } = await sol.signMessage(encodedMessage, 'utf8')
      const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

      const toastId = toast.loading('Verifying wallet…')
      const res = await fetch('/api/auth/web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: 'solana', address, signature: signatureBase64, message }),
      })
      const data = await res.json()
      toast.dismiss(toastId)

      if (!res.ok) {
        toast.error(data.error || 'Solana sign-in failed')
        setSolLoading(false)
        return
      }

      await handleWeb3Response(data)
      toast.success(mode === 'signup' ? 'Wallet connected! Welcome to VendoorX.' : 'Signed in with Phantom!')
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? ''
      if (msg.includes('rejected') || msg.includes('cancel')) {
        toast.error('Signature rejected', { description: 'Please approve the signature request to continue.' })
      } else {
        toast.error('Phantom sign-in failed. Please try again.')
      }
      setSolLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signInWithEthereum}
        disabled={isLoading}
        className="group relative w-full flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-[#E8821C]/30 bg-gradient-to-r from-[#FFF8F0] to-[#FFF3E6] dark:from-[#2A1A0A] dark:to-[#1F1408] hover:border-[#E8821C]/60 hover:shadow-lg hover:shadow-[#E8821C]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-[#2A1A0A] shadow-sm flex-shrink-0 border border-[#E8821C]/20">
          {ethLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#E8821C]" />
          ) : (
            <MetaMaskIcon size={22} />
          )}
        </div>
        <span className="flex-1 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
          {ethLoading ? 'Connecting to MetaMask…' : 'Continue with MetaMask'}
        </span>
        <span className="text-[10px] font-bold text-[#E8821C] bg-[#E8821C]/10 px-2 py-0.5 rounded-full border border-[#E8821C]/20">
          ETH
        </span>
      </button>

      <button
        type="button"
        onClick={signInWithSolana}
        disabled={isLoading}
        className="group relative w-full flex items-center gap-3 px-4 h-12 rounded-xl border-2 border-[#9945FF]/30 bg-gradient-to-r from-[#FAF7FF] to-[#F5EEFF] dark:from-[#1A0D2B] dark:to-[#150A22] hover:border-[#9945FF]/60 hover:shadow-lg hover:shadow-[#9945FF]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-[#1A0D2B] shadow-sm flex-shrink-0 border border-[#9945FF]/20">
          {solLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#9945FF]" />
          ) : (
            <PhantomIcon size={22} />
          )}
        </div>
        <span className="flex-1 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
          {solLoading ? 'Connecting to Phantom…' : 'Continue with Phantom'}
        </span>
        <span className="text-[10px] font-bold text-[#9945FF] bg-[#9945FF]/10 px-2 py-0.5 rounded-full border border-[#9945FF]/20">
          SOL
        </span>
      </button>

      <p className="text-center text-[10px] text-gray-400 dark:text-muted-foreground leading-relaxed">
        Your wallet address is your identity. No password needed.
      </p>
    </div>
  )
}
