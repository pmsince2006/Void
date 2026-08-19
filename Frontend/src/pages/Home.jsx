import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CollectionSection from '../components/CollectionSection'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

/**
 * Home Page Component for VOID
 * Combines Navbar, Hero, CollectionSection, ProductGrid, and Footer for the full brand storefront experience.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <CollectionSection />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  )
}
