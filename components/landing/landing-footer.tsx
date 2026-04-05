import Link from 'next/link'
import { ShoppingBag, MessageCircle, Instagram, Facebook } from 'lucide-react'

const LINKS = {
  Product: ['Marketplace', 'Sell on CampusCart', 'Pricing', 'AI Assistant'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">CampusCart</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Nigeria&apos;s most loved campus and business marketplace. Connect with buyers via WhatsApp, Instagram, and Facebook.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              <a
                href="https://wa.me/"
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#25D366' }}
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://instagram.com/"
                className="w-9 h-9 rounded-lg flex items-center justify-center instagram-gradient"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://facebook.com/"
                className="w-9 h-9 rounded-lg flex items-center justify-center facebook-blue"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusCart. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with love for Nigerian campus entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  )
}
