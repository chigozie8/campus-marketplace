import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">
                Campus<span className="text-primary">Cart</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The #1 campus marketplace in Nigeria. Buy and sell via WhatsApp, Instagram & Facebook.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Marketplace</h4>
            <ul className="space-y-2">
              {['Browse All', 'Electronics', 'Fashion', 'Books', 'Services'].map(item => (
                <li key={item}>
                  <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Sellers</h4>
            <ul className="space-y-2">
              {['Start Selling', 'Seller Dashboard', 'Pricing', 'Verification', 'Analytics'].map(item => (
                <li key={item}>
                  <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Privacy Policy', 'Terms'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusCart. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Available on:</span>
            <span className="text-xs font-medium text-green-600">WhatsApp</span>
            <span className="text-xs font-medium text-pink-600">Instagram</span>
            <span className="text-xs font-medium text-blue-600">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
