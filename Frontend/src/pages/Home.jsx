import Navbar from '../components/Navbar'
import Hero from '../components/Hero'

/**
 * Home Page Component for VOID
 * Combines Navbar and Hero sections for the initial brand experience.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  )
}
