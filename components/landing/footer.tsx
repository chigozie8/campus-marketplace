import Link from 'next/link'
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Grid Layout with improved spacing */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 md:gap-12 mb-12">
          {/* Brand Section - More breathing room */}
          <div className="col-span-2 pr-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 hero-gradient rounded-lg flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">
                Campus<span className="text-primary">Cart</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
              The #1 campus marketplace in Nigeria. Buy and sell via WhatsApp, Instagram &amp; Facebook.
            </p>
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:support@campuscart.com" className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                <Mail className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>support@campuscart.com</span>
              </a>
              <a href="tel:+2340000000000" className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                <Phone className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>+234 (0) 000 000 0000</span>
              </a>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-5 tracking-tight uppercase text-xs">Marketplace</h4>
            <ul className="space-y-3">
              {['Browse All', 'Electronics', 'Fashion', 'Books', 'Services'].map(item => (
                <li key={item}>
                  <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-5 tracking-tight uppercase text-xs">For Sellers</h4>
            <ul className="space-y-3">
              {['Start Selling', 'Seller Dashboard', 'Pricing', 'Verification', 'Analytics'].map(item => (
                <li key={item}>
                  <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-5 tracking-tight uppercase text-xs">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Blog', 'Careers', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider with spacing */}
        <div className="border-t border-border my-8 sm:my-10" />

        {/* Bottom Footer Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusCart. All rights reserved.
          </p>

          {/* Platform Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <span className="text-xs text-muted-foreground font-medium">Available on:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-600" />
                <span className="text-xs font-semibold text-pink-700 dark:text-pink-400">Instagram</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Facebook</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
