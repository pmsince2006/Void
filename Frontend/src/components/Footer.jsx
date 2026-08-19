import { Link } from 'react-router-dom'

/**
 * Footer Component for VOID
 * Features brand overview, navigation links, help/support, policies, social links, and copyright statement.
 */
export default function Footer() {
  const shopLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'New Arrivals', path: '/new' },
    { name: 'Collections', path: '/collections' },
  ]

  const helpLinks = [
    { name: 'Contact Us', path: '/shop' },
    { name: 'FAQ', path: '/shop' },
    { name: 'Track Order', path: '/account' },
  ]

  const policyLinks = [
    { name: 'Privacy Policy', path: '/shop' },
    { name: 'Terms & Conditions', path: '/shop' },
    { name: 'Shipping', path: '/shop' },
    { name: 'Returns', path: '/shop' },
  ]

  return (
    <footer className="w-full bg-black border-t border-neutral-900 text-neutral-400 font-sans text-xs">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Overview Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-[0.3em] uppercase text-white hover:opacity-80 transition-opacity inline-block"
            >
              VOID
            </Link>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Streetwear engineered for those who break boundaries and define their own path.
              Minimalist design paired with raw structural aesthetics.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500 block">
                VOL. 01 / ESSENTIALS
              </span>
            </div>
          </div>

          {/* SHOP Column */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-[0.2em] uppercase text-xs">
              SHOP
            </h4>
            <ul className="space-y-2.5 tracking-wider">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HELP Column */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-[0.2em] uppercase text-xs">
              HELP
            </h4>
            <ul className="space-y-2.5 tracking-wider">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* POLICIES Column */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-[0.2em] uppercase text-xs">
              POLICIES
            </h4>
            <ul className="space-y-2.5 tracking-wider">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar / Copyright */}
      <div className="border-t border-neutral-900 bg-neutral-950/50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono tracking-widest text-neutral-500">
          <p>© 2026 VOID. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6 uppercase text-neutral-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              INSTAGRAM
            </a>
            <span className="text-neutral-800">•</span>
            <span className="text-neutral-500">BUILT FOR THE UNDEFINED</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
