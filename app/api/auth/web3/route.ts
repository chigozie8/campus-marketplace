import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const { chain, address, signature, message } = await req.json()

    if (!chain || !address || !signature || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    let verified = false

    if (chain === 'ethereum') {
      try {
        const recovered = ethers.verifyMessage(message, signature)
        verified = recovered.toLowerCase() === address.toLowerCase()
      } catch {
        verified = false
      }
    } else if (chain === 'solana') {
      try {
        const publicKeyBytes = bs58.decode(address)
        const signatureBytes = Buffer.from(signature, 'base64')
        const messageBytes = new TextEncoder().encode(message)
        verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
      } catch {
        verified = false
      }
    } else {
      return NextResponse.json({ error: 'Unsupported chain.' }, { status: 400 })
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid wallet signature.' }, { status: 401 })
    }

    const adminClient = createServiceClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
    }

    const walletEmail = `${address.toLowerCase()}@web3.vendoorx.ng`
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    const chainLabel = chain === 'ethereum' ? 'ETH' : 'SOL'

    let userId: string

    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('email', walletEmail)
      .maybeSingle()

    if (existingProfile?.id) {
      userId = existingProfile.id
    } else {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: walletEmail,
        email_confirm: true,
        user_metadata: {
          full_name: `${chainLabel} User (${shortAddress})`,
          wallet_address: address,
          wallet_chain: chain,
          wallet_login: true,
        },
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      userId = newUser.user!.id

      await adminClient.from('profiles').upsert(
        {
          id: userId,
          email: walletEmail,
          full_name: `${chainLabel} User (${shortAddress})`,
          wallet_address: address,
          role: 'buyer',
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
    }

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: walletEmail,
    })

    if (linkError || !linkData) {
      return NextResponse.json({ error: 'Failed to create session link.' }, { status: 500 })
    }

    const token_hash = linkData.properties?.hashed_token
    if (!token_hash) {
      return NextResponse.json({ error: 'No token returned from session.' }, { status: 500 })
    }

    return NextResponse.json({ token_hash, email: walletEmail })
  } catch (err) {
    console.error('[web3-auth]', err)
    return NextResponse.json({ error: 'Web3 authentication failed.' }, { status: 500 })
  }
}
