import Link from 'next/link'
import { ShoppingBag, MessageCircle, Instagram, Facebook } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Sell on VendoorX', href: '/auth/sign-up' },
    { label: 'AI Assistant', href: '/assistant' },
    { label: 'Seller Dashboard', href: '/dashboard' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                Vendoor<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Nigeria&apos;s #1 campus marketplace. Buy and sell anything on campus and close deals directly on WhatsApp.
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5">
              <a
                href="https://wa.me/"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#25D366' }}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://instagram.com/"
                className="w-9 h-9 rounded-lg flex items-center justify-center instagram-gradient transition-opacity hover:opacity-80"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://facebook.com/"
                className="w-9 h-9 rounded-lg flex items-center justify-center facebook-blue transition-opacity hover:opacity-80"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VendoorX. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with love for Nigerian campus entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  )
}
