import CollectionCard from './CollectionCard'

/**
 * CollectionSection Component
 * Wraps and lays out the Shop by Collection cards in a responsive grid.
 */
export default function CollectionSection() {
  const collections = [
    {
      id: 'denims',
      title: 'DENIMS',
      image:
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
      path: '/collections',
    },
    {
      id: 'tops',
      title: 'TOPS',
      image:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      path: '/collections',
    },
    {
      id: 'accessories',
      title: 'ACCESSORIES',
      image:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80',
      path: '/collections',
    },
  ]

  return (
    <section className="w-full bg-black py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-500">
            VOL. 01 // CATEGORIES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase text-white">
            SHOP BY COLLECTION
          </h2>
          <div className="w-12 h-[1px] bg-neutral-800 mt-2" />
        </div>

        {/* Responsive Collection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {collections.map((item) => (
            <CollectionCard
              key={item.id}
              title={item.title}
              image={item.image}
              path={item.path}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
