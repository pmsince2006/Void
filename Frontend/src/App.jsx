import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'

/**
 * Placeholder component for secondary routes (/shop, /new, /collections, /account)
 */
function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-24 px-6">
      <Navbar />
      <div className="max-w-7xl mx-auto py-16 flex flex-col items-center justify-center text-center space-y-6">
        <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
          VOID // COMING SOON
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-wider uppercase text-white">
          {title}
        </h1>
        <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
          This section is currently under development. Return to the main portal to explore the initial collection.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<PlaceholderPage title="SHOP" />} />
        <Route path="/new" element={<PlaceholderPage title="NEW ARRIVALS" />} />
        <Route path="/collections" element={<PlaceholderPage title="COLLECTIONS" />} />
        <Route path="/account" element={<PlaceholderPage title="ACCOUNT" />} />
      </Routes>
    </Router>
  )
}

export default App