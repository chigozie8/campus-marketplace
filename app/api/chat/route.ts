import { NextRequest, NextResponse } from 'next/server'

const QUICK_REPLIES = [
  'How do I start selling?',
  'How does payment work?',
  'Is VendoorX free?',
  'How do I contact a seller?',
]

const FAQ: Array<{ patterns: string[]; answer: string }> = [

  // ── Greetings ──
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night', 'sup', 'hiya', 'howdy', 'yo', 'what.*up', 'how are you', 'how r u'],
    answer: "Hey! 👋 I'm **Vee**, VendoorX's AI support assistant.\n\nI can help you with:\n• 🛒 Buying & finding products\n• 🏪 Setting up your store & selling\n• 💳 Payments, delivery & safety\n• 🔧 Account issues & troubleshooting\n• 📊 Boosting sales & growing your store\n\nWhat can I help you with today? 😊",
  },
  {
    patterns: ['what.*vendoorx', 'what is vendoorx', 'tell me about vendoorx', 'explain vendoorx', 'what does vendoorx do', 'about.*vendoorx', 'vendoorx.*about'],
    answer: "**VendoorX** is Nigeria's AI-powered WhatsApp commerce platform for sellers and buyers! 🎓🇳🇬\n\nHere's what we do:\n• 🏪 Sellers create beautiful online stores in minutes\n• 🛒 Buyers browse & buy from trusted sellers\n• 💳 Secure payments via Paystack (card, transfer, USSD)\n• 📱 WhatsApp, Instagram & Facebook messages in one inbox\n• 📦 Order tracking, analytics & dashboards built in\n\nWe're the Shopify for sellers in Africa — structured, trackable, and built for Nigerian sellers!",
  },

  // ── Sign Up & Account ──
  {
    patterns: ['sign up', 'register', 'create.*account', 'join', 'how.*join', 'get started', 'new.*account', 'open.*account'],
    answer: "Joining VendoorX is free and takes under 2 minutes! 🎉\n\n1. Click **Join Free** at the top of the page\n2. Enter your name, email & password\n3. Verify your email\n4. You're in! 🚀\n\nTip: Complete your profile and apply for a Verified Seller badge — buyers trust verified sellers more!",
  },
  {
    patterns: ['login', 'log in', 'sign in', 'cant.*login', 'cannot.*login', 'trouble.*login', 'login.*problem', 'access.*account'],
    answer: "Having trouble logging in? Let's fix that! 🔧\n\n• **Forgot password?** Click 'Forgot password' on the login page — we'll send a reset link to your email\n• **Wrong email?** Try the email you registered with\n• **Still stuck?** Clear your browser cache or try a different browser\n\nIf none of these work, tap the WhatsApp button above and our team will help you recover your account right away!",
  },
  {
    patterns: ['forgot.*password', 'reset.*password', 'change.*password', 'password.*reset', 'password.*forgot', 'lost.*password'],
    answer: "Resetting your password is easy! 🔑\n\n1. Go to the **Sign In** page\n2. Click **'Forgot password?'**\n3. Enter your email address\n4. Check your inbox for the reset link\n5. Click the link and set a new password\n\nThe link expires in 1 hour. If you don't see the email, check your spam folder!",
  },
  {
    patterns: ['verify.*email', 'email.*verify', 'confirmation.*email', 'resend.*verification', 'verify.*account', 'account.*verify'],
    answer: "Check your inbox for a verification email from VendoorX! 📧\n\nIf you didn't receive it:\n• Check your **spam/junk** folder\n• Make sure you entered the correct email\n• Click **'Resend verification email'** on the login page\n\nStill no luck? Reach our team on WhatsApp and we'll verify you manually!",
  },
  {
    patterns: ['delete.*account', 'close.*account', 'deactivate.*account', 'remove.*account'],
    answer: "We're sorry to see you go! 😢\n\nTo delete your account:\n1. Go to **Dashboard → Settings → Account**\n2. Scroll down to **Danger Zone**\n3. Click **Delete Account** and confirm\n\n⚠️ This is permanent — all your listings, orders, and data will be removed. If you're having an issue we can fix, please reach us on WhatsApp first!",
  },
  {
    patterns: ['profile', 'edit.*profile', 'update.*profile', 'change.*name', 'change.*photo', 'profile.*picture'],
    answer: "You can update your profile anytime! ✏️\n\nGo to **Dashboard → Profile** to:\n• Change your name & bio\n• Upload a profile photo\n• Update your phone number\n• Edit your business or organisation info\n\nA complete profile builds more trust with buyers and gets you more sales!",
  },

  // ── Store Setup ──
  {
    patterns: ['start sell', 'how.*sell', 'become.*seller', 'create.*store', 'open.*store', 'set up.*store', 'setup.*store', 'start.*store', 'make.*store', 'vendor'],
    answer: "Starting your store is super easy! 🏪🚀\n\n1. Sign up for free (or log in)\n2. Go to **Dashboard → Store Setup**\n3. Add your store name, logo & description\n4. List your first product\n5. Share your store link with customers!\n\n✅ Your store goes live instantly — no approval needed.\n💡 Tip: Add a great profile photo and write a clear store description to attract more buyers!",
  },
  {
    patterns: ['store.*name', 'store.*link', 'store.*url', 'share.*store', 'my.*store.*link', 'store.*slug'],
    answer: "Your store gets its own shareable link! 🔗\n\nIt looks like: **vendoorx.ng/store/your-store-name**\n\nFind it in **Dashboard → Store → Share Link**. You can:\n• Share it on WhatsApp status\n• Add it to your Instagram bio\n• Put it in your Twitter/X profile\n• Send it directly to customers\n\nThe more you share, the more sales you make!",
  },
  {
    patterns: ['list.*product', 'add.*product', 'upload.*product', 'post.*product', 'create.*listing', 'how.*list', 'new.*product'],
    answer: "Adding a product takes less than 2 minutes! 📦\n\n1. Go to **Dashboard → Products → Add Product**\n2. Upload clear photos (up to 5 images)\n3. Write a good title & description\n4. Set your price\n5. Choose a category\n6. Click **Publish**!\n\n💡 Pro tips:\n• Use bright, clear photos — they get 3x more clicks\n• Write honest, detailed descriptions\n• Price competitively for your marketplace",
  },
  {
    patterns: ['edit.*product', 'update.*product', 'change.*product', 'modify.*product', 'product.*edit'],
    answer: "You can edit any product anytime! ✏️\n\nGo to **Dashboard → Products**, find the product, and click the **Edit** button. You can update:\n• Photos, title & description\n• Price (including adding a sale price)\n• Stock quantity\n• Category & tags\n\nChanges go live instantly!",
  },
  {
    patterns: ['delete.*product', 'remove.*product', 'hide.*product', 'unpublish.*product'],
    answer: "To remove a product:\n\n**Delete permanently:** Dashboard → Products → click the trash icon\n\n**Hide temporarily (recommended):** Dashboard → Products → Edit → toggle **Published** off\n\nHiding keeps your product data intact so you can re-list it later!",
  },
  {
    patterns: ['how many.*product', 'product.*limit', 'listing.*limit', 'maximum.*listing'],
    answer: "Here's the product limit per plan:\n\n• **Free plan** — Up to 10 active listings\n• **Growth plan** — Unlimited listings\n• **Pro plan** — Unlimited listings + featured placement\n\nUpgrade anytime from **Dashboard → Billing** to unlock unlimited listings and more features!",
  },
  {
    patterns: ['category', 'categories', 'what.*sell', 'what.*can.*sell', 'what.*type.*product', 'product.*type'],
    answer: "You can sell almost anything on VendoorX! 🛍️\n\nPopular categories include:\n• 👗 Fashion & clothing\n• 📱 Electronics & gadgets\n• 📚 Textbooks & course materials\n• 🍔 Food & snacks (homemade too!)\n• 💄 Beauty & skincare\n• 🎒 Bags & accessories\n• 🏠 Dorm room essentials\n• 💻 Tech services & freelancing\n• 🎨 Art, crafts & handmade items\n\nIf it's legal and appropriate, you can list it!",
  },

  // ── Buying ──
  {
    patterns: ['how.*buy', 'buy.*product', 'purchase', 'order.*product', 'place.*order', 'how to order', 'shopping'],
    answer: "Buying on VendoorX is simple and safe! 🛒\n\n1. Browse the **Marketplace** or search for what you need\n2. Click on a product to view details\n3. Click **Buy Now** or **Make Offer**\n4. Choose your payment method\n5. Pay securely via Paystack\n6. Receive your order confirmation!\n\nThe seller will contact you to arrange delivery. You can also message them directly through the product page!",
  },
  {
    patterns: ['find.*product', 'search.*product', 'browse', 'marketplace', 'how.*search', 'look.*for'],
    answer: "Finding what you need is easy! 🔍\n\n• **Search bar** — Type what you're looking for at the top of the Marketplace\n• **Browse by category** — Filter by fashion, electronics, food, books, etc.\n• **Filter by price** — Set a budget range\n• **Filter by city or state** — See sellers in your area\n• **Sort by** — Newest, price, or most popular\n\nYou can also follow a seller's store to see all their new listings!",
  },
  {
    patterns: ['make.*offer', 'negotiate', 'bargain', 'discount', 'lower.*price', 'offer.*price', 'price.*negotiate'],
    answer: "Yes, you can negotiate on VendoorX! 💬\n\nOn any product page, click **'Make an Offer'** to send the seller your price. The seller can:\n• ✅ Accept your offer\n• ❌ Decline\n• 💬 Counter-offer with a different price\n\nThis is especially common for electronics, fashion, and big-ticket items. Be polite — sellers are more likely to accept fair offers from friendly buyers! 😊",
  },
  {
    patterns: ['track.*order', 'where.*order', 'order.*status', 'my.*order', 'order.*history', 'check.*order'],
    answer: "You can track all your orders in one place! 📦\n\nGo to **Dashboard → Orders** to see:\n• Order status (Pending, Confirmed, Delivered)\n• Seller contact details\n• Payment receipt\n• Order timeline\n\nYou'll also get notifications when your order status changes. If you have questions about a specific order, message the seller directly from the order page!",
  },
  {
    patterns: ['cancel.*order', 'order.*cancel', 'want.*cancel'],
    answer: "To cancel an order:\n\n1. Go to **Dashboard → Orders**\n2. Find the order and click **View Details**\n3. Click **'Request Cancellation'**\n\n⚠️ Note:\n• Cancellations are easiest before the seller confirms the order\n• If payment has been processed, a refund will be issued within 3-5 business days\n• For urgent cancellations, message the seller directly or reach our team on WhatsApp!",
  },

  // ── Payments ──
  {
    patterns: ['pay', 'payment', 'paystack', 'how.*pay', 'pay.*how', 'payment.*method', 'pay.*method'],
    answer: "VendoorX uses **Paystack** — Nigeria's most trusted payment gateway! 🔒💳\n\nYou can pay with:\n• **Debit/Credit Card** (Visa, Mastercard, Verve)\n• **Bank Transfer** (real-time)\n• **USSD** (*737#, *901#, *966#, and more)\n• **Bank Account Direct Debit**\n\nYour money is held securely and only released to the seller after you confirm delivery. 100% safe!",
  },
  {
    patterns: ['withdraw', 'payout', 'cashout', 'cash out', 'get.*money', 'receive.*money', 'transfer.*money', 'my.*earnings', 'when.*paid'],
    answer: "Getting paid is straightforward! 💰\n\nOnce a buyer confirms delivery:\n1. Your earnings appear in **Dashboard → Wallet**\n2. Click **Withdraw**\n3. Enter your bank account details\n4. Money hits your account within **1-2 business days**\n\n💡 Make sure your bank account is verified in **Dashboard → Settings → Bank Account** before your first withdrawal!",
  },
  {
    patterns: ['add.*bank', 'bank.*account', 'bank.*detail', 'verify.*bank', 'payout.*account', 'withdrawal.*account'],
    answer: "Add your bank account so you can receive payments! 🏦\n\nGo to **Dashboard → Settings → Bank Account**:\n1. Enter your bank name\n2. Enter your account number\n3. Your account name will auto-fill\n4. Click **Save**\n\nYou can update this anytime. We support all Nigerian banks including GTBank, Access, UBA, First Bank, Opay, Kuda, and more!",
  },
  {
    patterns: ['transaction.*fee', 'commission', 'percentage', 'vendoorx.*take', 'platform.*fee', 'charge.*seller'],
    answer: "VendoorX charges **0% commission** on your sales! 🎉\n\nYou keep 100% of what you earn (minus Paystack's standard processing fee of ~1.5%).\n\nThe only costs are:\n• **Free plan** — ₦0/month (up to 10 listings)\n• **Growth/Pro plans** — Monthly subscription for unlimited listings & premium features\n• **Boost** — Optional paid promotion for more visibility\n\nNo hidden fees. Ever.",
  },
  {
    patterns: ['payment.*fail', 'payment.*failed', 'payment.*declined', 'card.*declined', 'payment.*error', 'pay.*not.*work'],
    answer: "Payment failing? Let's fix it! 🔧\n\nCommon reasons & solutions:\n• **Card declined** — Try a different card or use bank transfer instead\n• **Insufficient funds** — Top up your account first\n• **Network error** — Check your internet and try again\n• **Card not enabled for online payments** — Call your bank to activate online transactions\n• **OTP issue** — Make sure your phone has signal to receive the OTP\n\nStill failing? Our team on WhatsApp can help sort it out quickly!",
  },
  {
    patterns: ['refund', 'money.*back', 'return.*money', 'get.*refund', 'refund.*policy', 'how.*refund'],
    answer: "We handle refunds fairly and fast! 💸\n\n**When you get a refund:**\n• Item not delivered\n• Item significantly different from description\n• Seller cancels the order\n• Dispute resolved in your favour\n\n**How long it takes:**\n• Card payments — 3-5 business days\n• Bank transfer — 1-3 business days\n\nTo request a refund, open a dispute from **Dashboard → Orders → Report Issue**, or reach our team on WhatsApp!",
  },

  // ── Delivery ──
  {
    patterns: ['deliver', 'shipping', 'logistics', 'how.*deliver', 'deliver.*how', 'ship.*item', 'dispatch', 'pickup', 'drop off'],
    answer: "Delivery is arranged directly between you and the seller! 🚚\n\nCommon delivery options on VendoorX:\n• **Local pickup** — Meet the seller at a safe, agreed spot\n• **Home drop-off** — Seller delivers to your address\n• **Dispatch rider** — Seller sends via bike (buyer usually pays delivery fee)\n• **Courier** — For inter-city orders\n\n💡 Always confirm delivery method and fee with the seller **before** paying!",
  },
  {
    patterns: ['delivery.*fee', 'shipping.*cost', 'how much.*deliver', 'deliver.*cost', 'delivery.*price', 'cost.*delivery'],
    answer: "Delivery fees vary by seller and location 📍\n\n• **Local pickups** — Usually free or very cheap\n• **Local delivery** — ₦200–₦500 typically\n• **Dispatch riders** — ₦500–₦2,000+ depending on distance\n• **Interstate courier** — Varies (GIG, DHL, Sendbox, etc.)\n\nAlways check with the seller directly. Some sellers offer free delivery for orders above a certain amount!",
  },
  {
    patterns: ['delivery.*time', 'how long.*deliver', 'when.*arrive', 'how long.*take', 'delivery.*duration'],
    answer: "Delivery times depend on the seller and your location ⏱️\n\n• **Same area** — Same day or next day usually\n• **Same city** — 1-2 days\n• **Different state** — 2-5 business days via courier\n\nAlways ask the seller their estimated delivery time before ordering. You can message them directly from the product page!",
  },

  // ── Safety & Trust ──
  {
    patterns: ['safe', 'scam', 'trust', 'secure', 'legit', 'real', 'verified', 'fake', 'fraud', 'is it safe', 'trustworthy'],
    answer: "VendoorX is built with your safety in mind! 🛡️\n\n**How we protect you:**\n• 🔒 **Secure payments** — Money held until you confirm delivery (no cash risk)\n• ✅ **Verified seller badges** — We verify trusted vendors\n• ✅ **Seller verification** — Verified seller badges\n• ⭐ **Reviews & ratings** — See what others say before buying\n• 🏛️ **Dispute resolution** — Our team mediates if something goes wrong\n• 📋 **Order records** — Everything documented for accountability\n\nAlways pay through the platform — never send money directly to avoid scams!",
  },
  {
    patterns: ['verified.*seller', 'seller.*badge', 'trusted.*seller', 'verify.*seller', 'how.*seller.*verified', 'blue.*badge', 'green.*badge'],
    answer: "VendoorX has **trust badges** to help you shop safely ✅\n\n• 🟢 **Verified Seller** — Our team has reviewed and verified this seller as legitimate\n• 🎓 **Institution Verified** — Seller linked a verified institution or business email\n\nVerified sellers get:\n• Higher visibility in search\n• More buyer trust (and more sales!)\n• Priority customer support\n\nSellers can apply for verification through **Dashboard → Profile → Get Verified**!",
  },
  {
    patterns: ['review', 'rating', 'feedback', 'rate.*seller', 'leave.*review', 'how.*review'],
    answer: "Reviews help the whole community! ⭐\n\nAfter receiving your order:\n1. Go to **Dashboard → Orders**\n2. Find the completed order\n3. Click **Leave a Review**\n4. Rate the seller (1-5 stars) and write your feedback\n\nYour review helps other buyers make informed decisions. Be honest and specific — good reviews massively help honest sellers grow! 🙌",
  },
  {
    patterns: ['report.*seller', 'report.*buyer', 'report.*scam', 'report.*fraud', 'block.*seller', 'suspicious'],
    answer: "Please report suspicious activity immediately! 🚨\n\n**To report a seller or listing:**\n1. Open the product page or seller's store\n2. Click the **⋯ menu** or **Report button**\n3. Select the reason and submit\n\nOur safety team reviews all reports within 24 hours. For urgent scam reports, reach us directly on WhatsApp — we take fraud very seriously and act fast!",
  },

  // ── Disputes ──
  {
    patterns: ['dispute', 'problem.*order', 'issue.*order', 'wrong.*item', 'not.*receive', 'item.*not.*arrive', 'seller.*cheat', 'bad.*experience', 'complain'],
    answer: "Something went wrong? We'll sort it out! 💪\n\n**How to open a dispute:**\n1. Go to **Dashboard → Orders**\n2. Find the order\n3. Click **'Report Issue'** or **'Open Dispute'**\n4. Describe the problem and attach evidence (photos, screenshots)\n5. Our team reviews within **24 hours**\n\n**We can help with:**\n• Item not received\n• Wrong item delivered\n• Item not as described\n• Seller not responding\n• Refund requests\n\nFor urgent issues, tap the WhatsApp button to reach our team directly!",
  },
  {
    patterns: ['return.*item', 'return.*product', 'send.*back', 'return.*policy'],
    answer: "Here's our return policy 📦\n\n**Returns accepted when:**\n• Item is significantly different from the listing description\n• Item is damaged or defective\n• Wrong item was sent\n\n**Process:**\n1. Open a dispute within **48 hours** of receiving the item\n2. Provide photos as evidence\n3. Our team will mediate between you and the seller\n4. If approved, the seller arranges return pickup or you send it back\n5. Refund is processed once item is confirmed returned\n\nFor perishables (food items), please inspect on delivery!",
  },

  // ── Social Media Integration ──
  {
    patterns: ['whatsapp.*business', 'connect.*whatsapp', 'link.*whatsapp', 'whatsapp.*integration', 'social.*media.*connect', 'integrate.*social'],
    answer: "VendoorX connects all your social channels into one inbox! 📱\n\n**You can connect:**\n• ✅ **WhatsApp Business** — Get all customer messages in your dashboard\n• ✅ **Instagram DMs** — Never miss an order inquiry\n• ✅ **Facebook Messages** — Reply from one place\n\n**How to connect:**\nGo to **Dashboard → Integrations** and follow the setup guide for each platform.\n\nOnce connected, all messages flow into your **VendoorX Inbox** — no more switching between apps! 🎉",
  },
  {
    patterns: ['inbox', 'messages', 'message.*customer', 'chat.*customer', 'customer.*message', 'reply.*customer'],
    answer: "Your VendoorX Inbox keeps all conversations in one place! 💬\n\nGo to **Dashboard → Inbox** to:\n• See all messages from WhatsApp, Instagram & Facebook\n• Reply to customers without leaving VendoorX\n• View conversation history with each customer\n• Get notified of new messages in real-time\n\nNever lose an order inquiry again — everything is tracked and organised automatically!",
  },

  // ── Boost & Promotions ──
  {
    patterns: ['boost', 'promote', 'advertise', 'visibility', 'more.*sales', 'top.*listing', 'sponsored', 'featured', 'get.*more.*buyer', 'increase.*sale'],
    answer: "**Boost** gives your products maximum visibility! 🚀📈\n\n**What Boost does:**\n• Pushes your listing to the **top of search results**\n• Adds a ✨ 'Sponsored' badge that attracts buyers\n• Shows your product on the homepage featured section\n• More views = more sales!\n\n**How to Boost:**\nDashboard → Products → find your product → click **Boost** → choose duration → pay\n\nBoost prices start from ₦500. The more competitive your category, the more boosting helps!",
  },
  {
    patterns: ['sale.*price', 'discount.*price', 'slash.*price', 'original.*price', 'was.*price', 'price.*drop'],
    answer: "You can add a 'sale price' to show a discount on your listing! 💸\n\nWhen editing a product:\n1. Enter your **Original Price** (shown with strikethrough)\n2. Enter the **Sale Price** (the discounted price)\n3. VendoorX automatically calculates and shows the **% off** badge\n\nSale badges attract attention and increase click rates significantly. Great for clearing stock or running promotions!",
  },

  // ── Pricing Plans ──
  {
    patterns: ['plan', 'subscription', 'pricing', 'how much.*plan', 'free.*plan', 'paid.*plan', 'upgrade', 'growth.*plan', 'pro.*plan', 'starter.*plan'],
    answer: "VendoorX has plans for every seller! 💼\n\n🆓 **Free Plan — ₦0/month**\n• Up to 10 product listings\n• Store page & shareable link\n• Basic analytics\n• Paystack payments\n\n📈 **Growth Plan**\n• Unlimited listings\n• Advanced analytics & insights\n• Priority search placement\n• WhatsApp/Instagram/Facebook inbox\n\n🏆 **Pro Plan**\n• Everything in Growth\n• Verified seller badge\n• Featured on homepage\n• Priority customer support\n• Custom store domain\n\nCheck the **Pricing** page for current rates. Upgrade anytime from **Dashboard → Billing**!",
  },
  {
    patterns: ['free', 'is.*free', 'cost.*money', 'pay.*to.*sell', 'free to.*use', 'free.*join'],
    answer: "Yes, VendoorX is **free to join and free to sell**! 🎉\n\nThe Free plan includes everything you need to start:\n• Create your store\n• List up to 10 products\n• Accept payments via Paystack\n• Get your own store link\n• Manage orders from your dashboard\n\nUpgrade to paid plans when you're ready for unlimited listings, advanced features, and more visibility. But getting started costs absolutely nothing! 🚀",
  },

  // ── Analytics & Dashboard ──
  {
    patterns: ['analytics', 'dashboard', 'stats', 'statistics', 'sales.*data', 'performance', 'views', 'insights', 'revenue'],
    answer: "Your VendoorX dashboard gives you powerful insights! 📊\n\nYou can track:\n• 👀 **Product views** — How many people saw your listings\n• 🛒 **Orders** — Total orders, pending, completed\n• 💰 **Revenue** — Earnings over time (daily, weekly, monthly)\n• ⭐ **Ratings** — Your average seller rating\n• 📱 **Traffic sources** — Where buyers are coming from\n\nGo to **Dashboard → Analytics** to see all your stats. Use these insights to know which products sell best and when to restock!",
  },

  // ── Referrals ──
  {
    patterns: ['referral', 'refer.*friend', 'invite.*friend', 'referral.*link', 'referral.*code', 'earn.*refer', 'share.*earn'],
    answer: "Earn rewards by sharing VendoorX with friends! 🎁\n\n**How referrals work:**\n1. Go to **Dashboard → Referrals**\n2. Copy your unique referral link or code\n3. Share it with friends\n4. When they sign up using your link — you both get rewards!\n\n**What you earn:**\n• Credits that can be used for Boost or subscription discounts\n• The more friends you refer, the more you earn!\n\nShare your link on WhatsApp, Instagram, Twitter — anywhere your friends will see it! 🚀",
  },

  // ── University & Student Verification ──
  {
    patterns: ['university', 'campus', 'student.*verify', 'school.*email', 'edu.*email', 'student.*badge', 'student.*verified', 'which.*school', 'which.*university'],
    answer: "VendoorX is built for **Nigerian sellers and buyers**! 🇳🇬\n\nAnyone can sell on VendoorX — from individual traders to businesses, schools, and organisations across all 36 states!\n\n**How to get your Verified Seller badge:**\n1. Go to **Dashboard → Profile → Get Verified**\n2. Submit your government ID and a selfie\n3. Our team reviews within 48 hours\n4. ✅ Badge appears on your store and products!\n\nThe badge builds trust with buyers and gets you more sales!",
  },

  // ── Notifications ──
  {
    patterns: ['notification', 'alert', 'push.*notification', 'email.*notification', 'notify', 'get.*notified'],
    answer: "Stay updated with VendoorX notifications! 🔔\n\nYou'll get notified for:\n• 🛒 New orders placed\n• 💬 New customer messages\n• ✅ Order status updates\n• 💰 Payment received\n• ⭐ New reviews\n• 🎉 Promotions & platform news\n\n**Enable push notifications:**\nWhen prompted, click **Allow** to get instant browser/device notifications. You can manage settings in **Dashboard → Settings → Notifications**!",
  },

  // ── Mobile App / PWA ──
  {
    patterns: ['app', 'mobile.*app', 'download.*app', 'install.*app', 'android', 'iphone', 'ios', 'pwa', 'phone'],
    answer: "VendoorX works beautifully on your phone! 📱\n\n**Install the app:**\n1. Open VendoorX in your phone browser (Chrome or Safari)\n2. Look for the **'Install App'** button at the bottom of the screen\n3. Tap it and confirm — the app installs instantly!\n4. Open VendoorX from your home screen like a regular app\n\n✅ Works on **Android** and **iPhone**\n✅ No app store needed\n✅ Always up to date automatically\n✅ Fast, offline-capable experience!",
  },

  // ── Talk to a Human / Agent / Admin ──
  {
    patterns: ['talk.*human', 'speak.*human', 'real.*person', 'human.*agent', 'talk.*agent', 'speak.*agent', 'talk.*rep', 'speak.*rep', 'customer.*care.*rep', 'care.*rep', 'talk.*admin', 'speak.*admin', 'contact.*admin', 'reach.*admin', 'talk.*customer.*care', 'speak.*customer.*care', 'i want.*human', 'i need.*human', 'connect.*human', 'connect.*agent', 'live.*agent', 'live.*chat.*human', 'talk.*person', 'speak.*person', 'real.*agent', 'actual.*person'],
    answer: "Of course! Let me connect you with our team right away. 🙋‍♀️\n\nHere's how to reach a real VendoorX agent:\n\n📱 **WhatsApp (Fastest — recommended)**\nTap the **WhatsApp icon** in the top-right corner of this chat window — or message us directly at **+1 (579) 258-3013**. A pre-filled message with your conversation summary will be sent and our team typically replies within **5–10 minutes**!\n\n📱 **Direct WhatsApp**\n**+1 (579) 258-3013** — save this number and chat with us anytime!\n\n⏰ **Our working hours:**\n• Monday – Friday: 8:00am – 8:00pm\n• Saturday: 10:00am – 5:00pm\n• Sunday: Urgent issues only\n\nOur agents are friendly and will sort out any issue quickly! 💚",
  },

  // ── WhatsApp for Support ──
  {
    patterns: ['contact.*support', 'customer.*service', 'customer.*care', 'reach.*team', 'contact.*vendoorx', 'help.*team', 'support.*team', 'need.*help', 'i need.*support'],
    answer: "Our support team is always ready to help! 💪\n\n**Ways to reach us:**\n• 💬 **WhatsApp** — Tap the WhatsApp button in the chat header, or message **+1 (579) 258-3013** directly (fastest!)\n• 🌐 **Website** — vendoorx.ng/contact\n\n**Support hours:**\n• Monday–Friday: 8am–8pm\n• Saturday: 10am–5pm\n• Sunday: Limited (urgent issues only)\n\nFor urgent issues (payment problems, account locked, disputes), **WhatsApp is fastest** — we typically reply within minutes!",
  },

  // ── Complaints ──
  {
    patterns: ['complain', 'complaint', 'not happy', 'disappointed', 'frustrated', 'bad.*service', 'terrible', 'horrible', 'worst'],
    answer: "I'm really sorry to hear you're having a bad experience 😔\n\nYour feedback matters to us! Please share exactly what happened and we'll make it right.\n\nFor the fastest resolution:\n• Tap the **WhatsApp button** in the header to speak directly with our team\n• Or email us at **support@vendoorx.ng**\n\nWe take every complaint seriously and will do everything we can to fix your issue. Thank you for giving us the chance to improve! 🙏",
  },

  // ── Dark Mode ──
  {
    patterns: ['dark.*mode', 'light.*mode', 'theme', 'night.*mode', 'switch.*mode'],
    answer: "VendoorX supports both dark and light mode! 🌙☀️\n\nClick the **moon/sun icon** in the top navigation bar to toggle between themes. The setting saves automatically — your preference stays even after closing the browser!",
  },

  // ── Sellers Selling Multiple Items ──
  {
    patterns: ['stock', 'inventory', 'quantity', 'out.*of.*stock', 'how many.*available', 'restock'],
    answer: "You can manage your stock levels on VendoorX! 📦\n\nWhen adding or editing a product:\n• Set the **stock quantity**\n• VendoorX automatically marks items as **'Out of Stock'** when quantity hits 0\n• You'll get notified when stock is running low\n\nGo to **Dashboard → Products** to update quantities anytime. Keeping your stock accurate prevents disappointed buyers!",
  },

  // ── WhatsApp Order Tracking ──
  {
    patterns: ['order.*notification', 'order.*whatsapp', 'whatsapp.*order', 'notify.*whatsapp'],
    answer: "VendoorX notifies you about orders via multiple channels! 🔔\n\nYou'll receive:\n• **In-app notifications** on VendoorX\n• **Email notifications** to your registered email\n• **WhatsApp messages** if your WhatsApp Business is connected\n• **Push notifications** if you've enabled them on your device\n\nNever miss an order again! Connect WhatsApp Business in **Dashboard → Integrations** for real-time order alerts on your phone.",
  },

  // ── Technical Issues ──
  {
    patterns: ['not.*loading', 'page.*not.*load', 'app.*slow', 'app.*crash', 'site.*down', 'website.*down', 'not.*working', 'broken', 'error.*page', 'blank.*page', 'white.*page', '404', '500', 'server.*error'],
    answer: "Sorry you're having technical trouble! 🔧 Let's fix it:\n\n**Try these first:**\n• 🔄 Refresh the page (pull down on mobile)\n• 🌐 Check your internet connection\n• 🧹 Clear your browser cache (Settings → Clear data)\n• 🔁 Try a different browser (Chrome works best)\n• 📱 Try on your phone if on desktop, or vice versa\n\nIf the issue continues, our team needs to investigate urgently. Please message us on WhatsApp at **+1 (579) 258-3013** with a screenshot of the error — we'll fix it ASAP! 🚀",
  },
  {
    patterns: ['image.*not.*show', 'photo.*not.*load', 'picture.*broken', 'image.*upload.*fail', 'photo.*upload.*fail', 'cant.*upload.*image', 'cannot.*upload.*photo'],
    answer: "Image issues? Here's what to check 📸\n\n**Can't upload photos:**\n• File must be JPG, PNG, or WEBP format\n• Max file size is 5MB per image\n• Try compressing the photo first (use Squoosh.app — free!)\n\n**Photos not displaying:**\n• Refresh the page\n• Check your internet speed\n• Clear browser cache\n\nStill having trouble? WhatsApp us at **+1 (579) 258-3013** with the details and we'll sort it out right away! 📞",
  },
  {
    patterns: ['notification.*not.*work', 'push.*not.*work', 'not.*getting.*notification', 'notification.*stop', 'no.*notification'],
    answer: "Not getting notifications? Let's fix that! 🔔\n\n1. Make sure you allowed notifications when prompted\n2. Go to your browser/phone **Settings → Notifications → VendoorX** and ensure it's set to **Allow**\n3. Check **Dashboard → Settings → Notifications** to make sure all alerts are turned on\n4. On iPhone, notifications only work when added to home screen (install the app!)\n\nStill not working? Message us on WhatsApp **+1 (579) 258-3013** and we'll help you get it configured! 💚",
  },
  {
    patterns: ['slow.*website', 'website.*slow', 'taking.*long', 'loading.*slow', 'too.*slow'],
    answer: "Sorry VendoorX is feeling sluggish! 😓\n\n**Quick fixes:**\n• Check your internet speed (try fast.com)\n• Close other tabs eating up your data\n• Use Wi-Fi instead of mobile data if possible\n• Clear your browser cache\n• Try the app in Chrome for best performance\n\nIf the site is slow for everyone (not just you), our team is probably already on it! Message us on WhatsApp **+1 (579) 258-3013** to confirm — we monitor performance 24/7. 🛠️",
  },

  // ── Account Security ──
  {
    patterns: ['hack', 'hacked', 'account.*compromised', 'someone.*access', 'unauthorised.*access', 'suspicious.*login', 'account.*stolen', 'my.*account.*stolen'],
    answer: "🚨 This is urgent — act immediately!\n\n**If your account was hacked:**\n1. Try to **reset your password** right now at the login page\n2. If you can't get in, message us on WhatsApp **+1 (579) 258-3013** immediately\n3. Tell us your registered email and we'll lock the account to protect you\n\n**To secure your account going forward:**\n• Use a strong, unique password\n• Never share your login details with anyone\n• Watch for suspicious emails claiming to be VendoorX\n\nWe treat account security as our highest priority. Contact us NOW on WhatsApp! 🔐",
  },
  {
    patterns: ['two.*factor', '2fa', 'two.*step', 'otp', 'verification.*code', 'authenticat'],
    answer: "VendoorX uses OTP verification to keep your account safe! 🔐\n\nWhen you log in from a new device:\n• An OTP is sent to your registered email or phone\n• Enter it within 5 minutes to verify it's you\n• OTPs expire after 5 minutes — request a new one if needed\n\nHaving trouble with OTP verification? Message our team on WhatsApp **+1 (579) 258-3013** — we'll verify you manually and get you back in! 💚",
  },
  {
    patterns: ['change.*email', 'update.*email', 'new.*email', 'email.*change'],
    answer: "To change your registered email:\n\n1. Go to **Dashboard → Settings → Account**\n2. Click **Change Email**\n3. Enter your new email and confirm with your password\n4. Verify the new email via the link sent to it\n\nIf you no longer have access to your old email and need help updating it, message us on WhatsApp **+1 (579) 258-3013** with proof of identity and we'll update it manually! 🔧",
  },
  {
    patterns: ['change.*phone', 'update.*phone', 'phone.*number.*change', 'new.*phone.*number'],
    answer: "To update your phone number:\n\nGo to **Dashboard → Settings → Profile → Phone Number**.\n\nIf you're locked out or no longer have access to the old number, message our team on WhatsApp **+1 (579) 258-3013** and we'll help you update it securely! 📱",
  },
  {
    patterns: ['block.*account', 'account.*block', 'suspended.*account', 'account.*suspend', 'account.*banned', 'banned.*account', 'account.*disable', 'disable.*account'],
    answer: "Account suspended or blocked? 😟\n\nThis usually happens due to:\n• Suspected fraudulent activity\n• Listing prohibited items\n• Multiple policy violations\n• Payment issues\n\n**To appeal or get more info:**\nMessage us immediately on WhatsApp **+1 (579) 258-3013** with your registered email and we'll investigate and explain what happened. Most suspension cases are resolved quickly if there's been an error! 🙏",
  },

  // ── Seller-Specific Issues ──
  {
    patterns: ['seller.*not.*respond', 'seller.*not.*reply', 'seller.*ignor', 'no.*reply.*seller', 'seller.*offline', 'seller.*ghost'],
    answer: "Seller not responding? 😤 Here's what to do:\n\n1. Wait at least **24 hours** — they may be busy with classes!\n2. Try messaging them on **WhatsApp or Instagram** directly\n3. Check if their store shows as **Active**\n4. If you've already paid and they're unresponsive for 48+ hours — **open a dispute immediately**\n\n**To open a dispute:** Dashboard → Orders → Report Issue\n\nOr message our team on WhatsApp **+1 (579) 258-3013** and we'll contact the seller on your behalf! 💪",
  },
  {
    patterns: ['seller.*cheat', 'seller.*lie', 'seller.*fraud', 'seller.*scam', 'fake.*seller', 'dishonest.*seller'],
    answer: "We take seller fraud very seriously! 🚨\n\n**If a seller has cheated you:**\n1. **Do not send any more money**\n2. Open a dispute: **Dashboard → Orders → Report Issue**\n3. Gather evidence — screenshots, photos, order records\n4. Message us on WhatsApp **+1 (579) 258-3013** immediately\n\nWe will:\n• Investigate the seller's account\n• Freeze their payouts pending investigation\n• Process your refund if the dispute is valid\n• Ban fraudulent sellers from the platform\n\nYour money and safety come first. Contact us NOW! 💚",
  },
  {
    patterns: ['how.*earn.*more', 'increase.*sale', 'more.*customer', 'grow.*store', 'tips.*selling', 'sell.*faster', 'sell.*more'],
    answer: "Want to grow your VendoorX store? Here are proven tips! 📈\n\n🌟 **Top seller tips:**\n• 📸 Use bright, clear photos (huge difference in clicks!)\n• ✍️ Write detailed, honest descriptions with keywords\n• 💬 Reply to customers fast — within 1 hour if possible\n• 🚀 **Boost** your top products for more visibility\n• ⭐ Deliver quality — good reviews bring repeat buyers\n• 📱 Share your store link on WhatsApp Status daily\n• 🎁 Offer bundle deals or free delivery for bigger orders\n• 🔖 Price competitively — check what others charge\n\nWant personalised growth advice? Message our team on WhatsApp **+1 (579) 258-3013** — we love helping sellers succeed! 💚",
  },
  {
    patterns: ['bulk.*order', 'wholesale', 'large.*order', 'group.*order', 'multiple.*order', 'bulk.*buy'],
    answer: "Need to place a bulk or wholesale order? 📦\n\nFor large orders:\n1. **Message the seller directly** to discuss bulk pricing and availability\n2. Most VendoorX sellers offer discounts for bulk purchases — just ask!\n3. Confirm delivery arrangements for large quantities\n\nFor corporate or institutional bulk orders, our team can help match you with the right suppliers. Message us on WhatsApp **+1 (579) 258-3013** with your requirements and we'll connect you! 💼",
  },
  {
    patterns: ['gift', 'gift.*order', 'send.*gift', 'order.*gift', 'surprise.*gift', 'gift.*someone'],
    answer: "Sending a gift through VendoorX is sweet! 🎁\n\n**How to send a gift:**\n1. Order the item normally\n2. In the order notes or seller chat, mention:\n   - The recipient's name\n   - Delivery address (if different from yours)\n   - Any special gift message you want included\n3. The seller will arrange delivery directly to your recipient\n\nFor special gift wrapping or customisation, message the seller directly — many are happy to help! 🎀\n\nNeed help with a special gift order? Message us on WhatsApp **+1 (579) 258-3013**! 💚",
  },
  {
    patterns: ['seller.*rating', 'my.*rating', 'trust.*score', 'seller.*score', 'reputation', 'low.*rating', 'bad.*rating'],
    answer: "Your seller rating matters a lot on VendoorX! ⭐\n\n**How ratings work:**\n• Buyers rate you 1–5 stars after each completed order\n• Your average is shown on your store and products\n• Higher ratings = more buyer trust = more sales!\n\n**How to improve your rating:**\n• Ship quickly and communicate proactively\n• Make sure your product matches the description\n• Respond to issues professionally before they become disputes\n• Ask happy customers to leave a review!\n\nIf you believe a rating is unfair, message us on WhatsApp **+1 (579) 258-3013** and we'll review it! 💚",
  },

  // ── Privacy & Data ──
  {
    patterns: ['privacy', 'data.*protection', 'my.*data', 'personal.*information', 'gdpr', 'ndpr', 'data.*policy', 'privacy.*policy'],
    answer: "VendoorX takes your privacy seriously! 🔒\n\n**What we collect:**\n• Name, email, phone (for your account)\n• Payment info (processed securely by Paystack — we never store card details)\n• Order history and communications\n\n**What we never do:**\n• Sell your data to third parties\n• Share your info without consent\n• Store sensitive payment data\n\nYou can request a copy of your data or ask for deletion anytime. Read our full Privacy Policy at **vendoorx.ng/privacy**\n\nFor data-related requests, message us on WhatsApp **+1 (579) 258-3013**! 🛡️",
  },

  // ── Prohibited Items ──
  {
    patterns: ['prohibited', 'banned.*item', 'not.*allowed.*sell', 'can.*sell.*drug', 'illegal.*item', 'what.*not.*sell', 'forbidden.*item'],
    answer: "VendoorX has a strict policy on what can be listed! 🚫\n\n**You CANNOT sell:**\n• Illegal drugs or substances\n• Weapons or dangerous items\n• Counterfeit/pirated goods\n• Explicit or adult content\n• Stolen property\n• Alcohol (to minors)\n• Prescription medicines without license\n• Exam papers or academic fraud materials\n\n**If you're unsure** whether your item is allowed, message us on WhatsApp **+1 (579) 258-3013** before listing — we'll give you a quick answer! ✅",
  },

  // ── Partnerships & Collaborations ──
  {
    patterns: ['partner', 'partnership', 'collaborate', 'collab', 'work.*together', 'business.*proposal', 'invest', 'investor', 'sponsor', 'sponsorship'],
    answer: "Interested in partnering with VendoorX? We love collaborations! 🤝\n\nWe're open to:\n• Campus brand ambassadors\n• Seller and business partnerships\n• Sponsor placements\n• Business-to-business integrations\n• Media and press inquiries\n\nPlease reach our team directly on WhatsApp **+1 (579) 258-3013** with your proposal and we'll get back to you! We're always open to ideas that help Nigerian sellers and buyers thrive. 🚀",
  },
  {
    patterns: ['ambassador', 'campus.*rep', 'campus.*ambassador', 'brand.*rep', 'become.*rep', 'represent.*vendoorx'],
    answer: "Become a VendoorX Brand Ambassador! 🌟\n\nAs an ambassador you'll:\n• Represent VendoorX in your city\n• Earn commissions for every seller/buyer you bring in\n• Get exclusive perks and rewards\n• Build your CV and leadership experience\n• Be part of a growing seller-first movement!\n\nTo apply, message us on WhatsApp **+1 (579) 258-3013** with your name, city, and why you'd make a great ambassador. We'd love to have you on the team! 💚🎓",
  },

  // ── Feedback & Suggestions ──
  {
    patterns: ['suggest', 'suggestion', 'feedback', 'feature.*request', 'idea', 'improve', 'recommendation', 'wish.*vendoorx'],
    answer: "We love hearing from our community! 💡\n\nYour ideas help us build a better VendoorX for everyone. Share your suggestion directly with our team on WhatsApp **+1 (579) 258-3013** — every message is read and considered!\n\nYou can also rate and review your experience on our website. The features most requested by users are the ones we build next. Your voice matters! 🙏",
  },

  // ── Terms & Legal ──
  {
    patterns: ['terms', 'terms.*service', 'terms.*condition', 'legal', 'policy', 'rules', 'guidelines', 'community.*standard'],
    answer: "VendoorX's full legal documents are available on our website!\n\n📄 **Key policies:**\n• **Terms of Service** — vendoorx.ng/terms\n• **Privacy Policy** — vendoorx.ng/privacy\n• **Seller Guidelines** — vendoorx.ng/seller-guidelines\n• **Refund Policy** — vendoorx.ng/refunds\n\nIf you have specific legal questions or need clarification on any policy, message us on WhatsApp **+1 (579) 258-3013** and our team will explain everything clearly! ⚖️",
  },

  // ── Store Customisation ──
  {
    patterns: ['custom.*store', 'store.*design', 'store.*logo', 'store.*banner', 'personalise.*store', 'store.*colour', 'store.*theme'],
    answer: "Make your VendoorX store uniquely yours! 🎨\n\nYou can customise:\n• 🖼️ **Store banner** — a cover image at the top of your store\n• 📸 **Store logo** — your brand profile picture\n• 📝 **Store description** — tell buyers your story\n• 🏷️ **Store name** — your unique store URL\n• 📱 **Social links** — link your WhatsApp, Instagram, Twitter\n\nGo to **Dashboard → Store → Edit Store** to update everything.\n\nFor advanced customisation options (Pro plan), message us on WhatsApp **+1 (579) 258-3013**! 💚",
  },

  // ── Multiple Accounts ──
  {
    patterns: ['multiple.*account', 'two.*account', 'second.*account', 'another.*account', 'more than one.*account'],
    answer: "VendoorX allows **one account per person** 👤\n\nIf you need to manage multiple stores (e.g. for different product categories), you can do this from one account — just create separate store sections for each.\n\nHaving multiple accounts is against our Terms of Service and can lead to suspension. If you have a specific business reason for needing separate accounts, please message us on WhatsApp **+1 (579) 258-3013** and we'll find the best solution for you! 🙏",
  },

  // ── Wallet & Credits ──
  {
    patterns: ['wallet', 'credit', 'balance', 'vendoorx.*credit', 'platform.*credit', 'wallet.*balance', 'my.*balance'],
    answer: "Your VendoorX Wallet holds your earnings and credits! 💰\n\n**In your wallet:**\n• 💵 **Earnings** — money from completed sales\n• 🎁 **Credits** — earned from referrals, promotions, or compensations\n• 📊 **Transaction history** — every payment in and out\n\nAccess it at **Dashboard → Wallet**. You can use credits to pay for Boost, subscriptions, or withdraw cash to your bank.\n\nFor wallet discrepancies or missing funds, message us on WhatsApp **+1 (579) 258-3013** immediately! 🏦",
  },

  // ── Late / Missing Delivery ──
  {
    patterns: ['late.*delivery', 'delayed.*delivery', 'delivery.*late', 'order.*late', 'not.*delivered', 'missing.*package', 'lost.*package', 'package.*missing', 'where.*my.*order'],
    answer: "Order late or missing? Let's investigate! 🔍\n\n**First steps:**\n1. Check your order status at **Dashboard → Orders**\n2. Message the seller directly from the order page\n3. Confirm the delivery address was correct\n4. Check if a neighbour signed for it (for local deliveries)\n\n**If the seller isn't responding or it's been way too long:**\n→ Open a dispute at **Dashboard → Orders → Report Issue**\n→ Or message our team on WhatsApp **+1 (579) 258-3013** — we'll mediate and ensure you get your item or a full refund! 💪",
  },

  // ── Wrong / Damaged Item ──
  {
    patterns: ['wrong.*item', 'different.*item', 'not.*what.*order', 'received.*wrong', 'damaged.*item', 'broken.*item', 'item.*damaged', 'item.*broken', 'defective.*product'],
    answer: "Received the wrong or damaged item? That's unacceptable and we'll fix it! 😤\n\n**Act quickly — within 48 hours of delivery:**\n1. Take clear photos of what you received\n2. Go to **Dashboard → Orders → Report Issue**\n3. Describe the problem and upload your photos\n4. Our team reviews within 24 hours\n\nYou're entitled to either:\n• ✅ The correct item sent to you\n• 💰 A full refund\n\nFor urgent cases, message us directly on WhatsApp **+1 (579) 258-3013** with photos — we'll fast-track your case! 🚀",
  },

  // ── Price Change After Order ──
  {
    patterns: ['price.*change.*after', 'seller.*change.*price', 'different.*price', 'price.*higher.*than'],
    answer: "Sellers cannot change the price after you've placed an order! ❌\n\nThe price you pay is the price shown at checkout — locked in. If a seller is demanding more money after your order:\n\n1. **Do not pay any extra** outside the platform\n2. Screenshot the conversation as evidence\n3. Message us on WhatsApp **+1 (579) 258-3013** immediately\n\nThis is a policy violation and we'll take action against the seller. Your order should be fulfilled at the agreed price or cancelled with a full refund! 🛡️",
  },

  // ── Tax / Invoice ──
  {
    patterns: ['receipt', 'invoice', 'tax.*invoice', 'proof.*payment', 'payment.*receipt', 'vat', 'tax'],
    answer: "Need a receipt or invoice? 🧾\n\nYour payment receipt is automatically generated for every order:\n1. Go to **Dashboard → Orders**\n2. Click on the order\n3. Click **Download Receipt / View Invoice**\n\nFor formal tax invoices or VAT-compliant documents for business purposes, message us on WhatsApp **+1 (579) 258-3013** with your order details and company info — we'll generate one for you! 📊",
  },

  // ── Inter-City / National Orders ──
  {
    patterns: ['different.*city', 'another.*city', 'interstate', 'inter.*state', 'outside.*campus', 'lagos.*abuja', 'ship.*nationwide', 'national.*delivery', 'far.*delivery'],
    answer: "VendoorX supports nationwide orders across Nigeria! 🇳🇬\n\n**For orders outside the seller's city:**\n• Discuss with the seller their preferred courier service\n• Popular options: **GIG Logistics, Sendbox, DHL, FedEx, GIGL**\n• Courier fees are typically paid by the buyer\n• Delivery takes 2–5 business days nationwide\n\nAlways confirm interstate delivery arrangements and costs with the seller **before** paying to avoid surprises.\n\nNeed help finding a seller who ships to your city? Message us on WhatsApp **+1 (579) 258-3013**! 🚚",
  },

  // ── How to Get Verified ──
  {
    patterns: ['get.*verified', 'how.*verified', 'apply.*verification', 'verification.*process', 'verified.*badge.*how', 'become.*verified'],
    answer: "Getting verified on VendoorX builds massive trust with buyers! ✅\n\n**Verified Seller badge (manual review):**\n1. Go to **Dashboard → Profile → Get Verified**\n2. Submit your: government ID, proof of business, and a selfie\n3. Our team reviews within 48 hours\n4. Once approved, ✅ badge appears on all your listings!\n\nVerified sellers get significantly more sales. Message us on WhatsApp **+1 (579) 258-3013** if you need help with the process! 💚",
  },

  // ── Counterfeit / Authenticity ──
  {
    patterns: ['original', 'authentic', 'genuine', 'fake.*product', 'counterfeit', 'real.*product', 'is.*original', 'is.*authentic', 'replica'],
    answer: "Authenticity is a serious issue we fight hard on VendoorX! 💯\n\n**How to spot genuine sellers:**\n• Look for the ✅ **Verified Seller** badge\n• Check reviews from past buyers\n• Ask the seller for proof of authenticity or purchase receipts\n• Verified sellers have been vetted by our team\n\n**If you receive a fake item:**\n• Take photos immediately\n• Open a dispute: **Dashboard → Orders → Report Issue**\n• Message us on WhatsApp **+1 (579) 258-3013** — counterfeit sellers are permanently banned!\n\nNever accept fake goods. You're entitled to a full refund. 🛡️",
  },

  // ── How to Increase Sales ──
  {
    patterns: ['no.*sale', 'not.*getting.*sale', 'nobody.*buying', 'low.*sale', 'why.*no.*order', 'product.*not.*selling'],
    answer: "Don't worry — slow starts are normal! Here's how to turn it around 🔥\n\n**Action plan for more sales:**\n1. 📸 **Upgrade your photos** — bright, clean, multiple angles\n2. ✍️ **Rewrite your description** — include size, colour, condition, uses\n3. 💰 **Price check** — are you competitive with similar sellers?\n4. 🚀 **Boost your listings** — even ₦500 makes a huge difference\n5. 📲 **Share your store link** on WhatsApp Status every day\n6. 🏷️ **Add a sale price** — 'Was ₦5,000, Now ₦3,500' attracts clicks\n7. ⭐ **Ask friends to leave reviews** to build social proof\n\nFor a personalised store review and advice, message our team on WhatsApp **+1 (579) 258-3013** — we love helping sellers grow! 💚",
  },

  // ── New Features ──
  {
    patterns: ['new.*feature', 'update', 'what.*new', 'latest.*feature', 'coming.*soon', 'roadmap', 'future.*feature'],
    answer: "VendoorX is constantly improving! 🚀✨\n\nRecent updates include:\n• 📱 Real-time inbox (WhatsApp, Instagram, Facebook all in one)\n• 🔔 Web push notifications\n• 🎨 Enhanced store customisation\n• 🤖 AI support assistant (that's me, Vee! 👋)\n• 📊 Improved analytics dashboard\n\nWant to know what's coming next or suggest a feature? Message our team on WhatsApp **+1 (579) 258-3013** — community suggestions directly shape our roadmap! 💡",
  },

  // ── Student Groups / Organisations ──
  {
    patterns: ['student.*union', 'association', 'club', 'group.*order', 'organization', 'department.*store', 'faculty'],
    answer: "VendoorX works great for organisations and groups! 🤝\n\nBusinesses, associations, clubs, and schools use VendoorX to:\n• Sell branded merchandise (hoodies, bags, notebooks)\n• Sell event tickets and conference materials\n• Run department or chapter stores\n• Raise funds for group activities\n\nWe offer **special partnership packages** for registered organisations. Message us on WhatsApp **+1 (579) 258-3013** with your organisation details and we'll set you up with a great deal! 💚",
  },

  // ── How VendoorX Makes Money ──
  {
    patterns: ['how.*vendoorx.*make.*money', 'vendoorx.*revenue', 'business.*model', 'how.*make.*profit'],
    answer: "Great question! VendoorX makes money through:\n\n• 📋 **Subscription plans** — Growth and Pro monthly plans\n• 🚀 **Boost fees** — Sellers pay to promote listings\n• 🎯 **Featured placements** — Premium homepage spots\n\nWe charge **0% commission** on sales — you keep everything you earn! Our goal is to grow with our sellers, not take from them. 💚\n\nQuestions about our business? Message us on WhatsApp **+1 (579) 258-3013**!",
  },

  // ── VendoorX vs Competitors ──
  {
    patterns: ['vs.*jiji', 'vs.*konga', 'vs.*jumia', 'better.*than', 'compare.*vendoorx', 'why.*vendoorx', 'why.*not.*jiji', 'why.*choose.*vendoorx'],
    answer: "Great question! Here's what makes VendoorX different 🏆\n\n**VendoorX vs other platforms:**\n• 🎓 **Built for Nigerian sellers** — designed for WhatsApp-powered selling\n• 📱 **Social selling hub** — WhatsApp, Instagram, Facebook all in one dashboard\n• 💳 **0% commission** — you keep 100% of your earnings\n• 🔒 **Escrow payments** — money held safely until delivery confirmed\n• 🏪 **Your own store link** — shareable, branded storefront\n• 🤖 **AI support** — instant help 24/7\n• 🚀 **Verified Seller** — trust badges for sellers\n\nNo other platform is built specifically for Nigerian sellers. We're your home! 💚",
  },

  // ── Closings ──
  {
    patterns: ['thank', 'thanks', 'thank you', 'helpful', 'great', 'awesome', 'perfect', 'nice', 'cool', 'wonderful', 'excellent', 'brilliant'],
    answer: "You're so welcome! 😊 Happy to help!\n\nIf you ever have more questions, I'm always here — day or night. Wishing you amazing sales and happy customers on VendoorX! 🚀🎉",
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'ciao', 'take care', 'ttyl', 'good luck'],
    answer: "Goodbye! 👋 It was great chatting with you.\n\nRemember, I'm always here if you need help. Wishing you success on VendoorX! 🌟",
  },
]

function getBotReply(message: string): string {
  const lower = message.toLowerCase().trim()

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

  return "Hmm, I'm not 100% sure about that one 🤔\n\nBut our team definitely can help! Tap the **WhatsApp button** in the chat header to reach us directly — we'll reply in minutes and sort you out! 💪"
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
