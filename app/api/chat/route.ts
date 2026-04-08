import { NextRequest, NextResponse } from 'next/server'

const QUICK_REPLIES = [
  'How do I start selling?',
  'How does payment work?',
  'Is VendoorX free?',
  'How do I contact a seller?',
]

const FAQ: Array<{ patterns: string[]; answer: string }> = [
  {
    patterns: ['start sell', 'how.*sell', 'become.*seller', 'create.*store', 'open.*store', 'register.*sell', 'sign up.*sell'],
    answer: "Starting is super easy! 🚀\n\n1. Click **Join Free** or **Start Selling**\n2. Create your account with your university email\n3. Set up your store profile and add your products\n4. Share your store link and start getting orders!\n\nYour store is live in under 5 minutes. Want me to walk you through anything specific?",
  },
  {
    patterns: ['pay', 'payment', 'paystack', 'transfer', 'card', 'ussd', 'how.*pay', 'pay.*how'],
    answer: "VendoorX uses **Paystack** for secure payments 🔒\n\nBuyers can pay via:\n• Debit/credit card\n• Bank transfer\n• USSD (*737#, *901#, etc.)\n\nMoney is held safely until the order is confirmed, then sent to the seller. No cash, no stress!",
  },
  {
    patterns: ['free', 'cost', 'price', 'plan', 'subscription', 'how much', 'fee', 'charge'],
    answer: "Yes, VendoorX has a **free plan** to get you started! 🎉\n\nFree plan includes:\n• Create your store\n• List your products\n• Receive orders & payments\n\nPaid plans unlock **Boost** (push your products to the top), advanced analytics, and priority support. Check the Pricing page for current rates!",
  },
  {
    patterns: ['contact.*seller', 'message.*seller', 'chat.*seller', 'reach.*seller', 'talk.*seller'],
    answer: "You can contact any seller directly! 💬\n\nJust open their product page or store and tap the **WhatsApp / Message** button. You'll be connected instantly.\n\nVendoorX also keeps all your seller messages in one inbox so nothing gets lost!",
  },
  {
    patterns: ['deliver', 'shipping', 'logistics', 'send.*item', 'ship'],
    answer: "Delivery is arranged directly between buyer and seller 🚚\n\nMost campus sellers offer:\n• Campus drop-off / pickup\n• Dispatch rider delivery\n• Meeting at a safe location on campus\n\nAlways confirm delivery details with the seller in chat before paying!",
  },
  {
    patterns: ['safe', 'scam', 'trust', 'secure', 'legit', 'real', 'verified'],
    answer: "Your safety is our #1 priority 🛡️\n\nVendoorX protects you with:\n• **Verified seller badges** for trusted vendors\n• **Student verification** for university emails\n• **Secure Paystack payments** (money held until confirmed)\n• **Dispute resolution** if anything goes wrong\n• **Review & rating system** so you know who to trust",
  },
  {
    patterns: ['refund', 'return', 'dispute', 'problem.*order', 'issue.*order', 'wrong.*item', 'scammed'],
    answer: "We've got your back! 💪\n\nIf something goes wrong with an order:\n1. Open the order in your dashboard\n2. Click **Report Issue** or **Open Dispute**\n3. Our team reviews it within 24 hours\n\nFor urgent issues, tap the button below to reach us directly on WhatsApp and we'll sort it out fast!",
  },
  {
    patterns: ['whatsapp', 'instagram', 'facebook', 'social.*media', 'inbox', 'connect.*social'],
    answer: "VendoorX connects all your social selling in one place! 📱\n\nLink your:\n• **WhatsApp Business**\n• **Instagram DMs**\n• **Facebook Messages**\n\nAll messages from these platforms flow into your VendoorX inbox. No more switching apps — manage everything from one dashboard!",
  },
  {
    patterns: ['boost', 'promote', 'advertise', 'visibility', 'more.*sales', 'top.*listing'],
    answer: "Want more eyes on your products? 👀\n\n**Boost** puts your listings at the top of the marketplace so more buyers see them first!\n\nYou can boost individual products for as little as ₦500. Go to your dashboard → Products → Boost to get started!",
  },
  {
    patterns: ['referral', 'refer', 'invite', 'earn.*reward', 'reward'],
    answer: "Love VendoorX? Share it and earn! 🎁\n\nYou get a unique referral link in your dashboard. When someone signs up using your link:\n• They get a welcome bonus\n• You earn rewards too!\n\nFind your referral code under Dashboard → Referrals.",
  },
  {
    patterns: ['university', 'campus', 'student', 'school', 'which.*university', 'supported.*school'],
    answer: "VendoorX is built for **Nigerian university students** 🎓\n\nWe support students across universities in Nigeria. Sign up with your school email (.edu.ng or university domain) to get your **Student Verified** badge — it builds trust with buyers!",
  },
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'hiya'],
    answer: "Hey there! 👋 I'm Vee, VendoorX's AI assistant.\n\nI can help you with:\n• Buying & selling on VendoorX\n• Payments & delivery\n• Account & store setup\n• Safety & disputes\n\nWhat would you like to know? 😊",
  },
  {
    patterns: ['thank', 'thanks', 'helpful', 'great', 'awesome', 'perfect', 'nice'],
    answer: "Happy to help! 😊 You're all set.\n\nIf you ever have more questions, I'm always here. Good luck on VendoorX! 🚀",
  },
]

function getBotReply(message: string): string {
  const lower = message.toLowerCase()

  for (const faq of FAQ) {
    const matched = faq.patterns.some(pattern => {
      try {
        return new RegExp(pattern, 'i').test(lower)
      } catch {
        return lower.includes(pattern)
      }
    })
    if (matched) return faq.answer
  }

  return "Hmm, I'm not sure about that one 🤔\n\nBut our team definitely can help! Tap **'Talk to a real person'** below to reach us on WhatsApp and we'll get back to you right away."
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    const reply = getBotReply(message.trim())
    return NextResponse.json({ reply, quickReplies: QUICK_REPLIES })
  } catch {
    return NextResponse.json(
      { reply: "Something went wrong on my end. Please try again or reach us on WhatsApp!" },
      { status: 200 }
    )
  }
}
