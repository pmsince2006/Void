import { Product, ProductFilterParams } from '../types/product';
import { Collection } from '../types/cart';

// Fallback high-fashion editorial imagery inspired by the uploaded visual reference
// Monochromatic studio backgrounds, concrete textures, draped silhouettes
const FIXTURE_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'STRUCTURED COLLAPSE COAT',
    subtitle: 'Wave 01 // Master Silhouette',
    sku: 'VD-01-W01-001',
    slug: 'structured-collapse-coat',
    category: 'outerwear',
    collection: 'CITY ARMOR',
    drop: 'DROP 01 // HORIZON',
    wave: 'W01',
    price: 495,
    currency: 'USD',
    description: 'Double-breasted oversized silhouette in 620gsm bonded Italian wool blend. Features sharp asymmetric lapel construction, dropped ergonomic shoulders, and integrated storm throat-latch.',
    editorialDescription: 'Born in urban shadows. A sculptural garment that shields against wind and visual noise, sculpted for dramatic drape.',
    details: [
      '620gsm heavyweight bonded wool blend',
      'Brutal architectural collar and hidden storm flap',
      'Matte black custom titanium hardware with VOID laser engraving',
      'Dual deep angled welt pockets and interior passport holster',
      'Handcrafted in limited wave of 80 pieces'
    ],
    materials: ['78% Virgin Wool', '18% Polyamide', '4% Cashmere'],
    fit: 'Exaggerated unisex oversized fit. Size down for true-to-size proportion.',
    sizes: ['01 (S)', '02 (M)', '03 (L)', '04 (XL)'],
    colors: [
      { name: 'Monolith Black', hex: '#111111' },
      { name: 'Raw Slate', hex: '#3E3E3E' }
    ],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'DROP 01',
    inStock: true,
    stockCount: 14,
    isFeatured: true,
    isNewDrop: true,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-15'
  },
  {
    id: 'prod-002',
    name: 'BALLISTIC MONOLITH PARKA',
    subtitle: 'Wave 01 // City Armor',
    sku: 'VD-01-W01-002',
    slug: 'ballistic-monolith-parka',
    category: 'outerwear',
    collection: 'CITY ARMOR',
    drop: 'DROP 01 // HORIZON',
    wave: 'W01',
    price: 540,
    currency: 'USD',
    description: 'Longline weatherproof tactical shell crafted from 3-layer laminated Cordura nylon. Concealed double two-way storm zippers, structured geometric hood with wire reinforcement, and articulated sleeve darts.',
    editorialDescription: 'Engineered as kinetic protection for metropolitan movement.',
    details: [
      '3-layer 500D waterproof breathable technical shell',
      'Taped seam construction throughout',
      'Extended wire-reinforced structured cowl hood',
      'Magnetic pocket closures with quick-pull paracord toggles',
      'Modular internal carry sling system'
    ],
    materials: ['100% Technical Polyamide with DWR finish'],
    fit: 'Relaxed elongated cut designed to layer over heavy knits.',
    sizes: ['01 (S)', '02 (M)', '03 (L)', '04 (XL)'],
    colors: [
      { name: 'Void Black', hex: '#111111' },
      { name: 'Ash Concrete', hex: '#777777' }
    ],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'LIMITED',
    inStock: true,
    stockCount: 8,
    isFeatured: true,
    isNewDrop: true,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-16'
  },
  {
    id: 'prod-003',
    name: 'DECONSTRUCTED TAILORED BLAZER',
    subtitle: 'Wave 02 // Collapsed Tailoring',
    sku: 'VD-01-W02-003',
    slug: 'deconstructed-tailored-blazer',
    category: 'tailoring',
    collection: 'COLLAPSED TAILORING',
    drop: 'DROP 01 // HORIZON',
    wave: 'W02',
    price: 380,
    currency: 'USD',
    description: 'Unstructured single-breasted blazer featuring raw raw-edge hems, exposed interior canvas bonding, and exaggerated padded shoulders that command presence.',
    editorialDescription: 'The meeting point of brutalism and modern bespoke tailoring.',
    details: [
      'Premium 450gsm tropical wool and linen blend',
      'Sculptural padded shoulder silhouette',
      'Contrast pick-stitching along peak lapel edge',
      'Signature grosgrain internal harness strap'
    ],
    materials: ['65% Wool', '35% Linen'],
    fit: 'Broad shoulder, boxy torso drape.',
    sizes: ['01 (S)', '02 (M)', '03 (L)', '04 (XL)'],
    colors: [
      { name: 'Pitch Black', hex: '#111111' },
      { name: 'Warm Ivory', hex: '#F4F2ED' }
    ],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'NEW ARRIVAL',
    inStock: true,
    stockCount: 19,
    isFeatured: true,
    isNewDrop: true,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-17'
  },
  {
    id: 'prod-004',
    name: 'HEAVY GAUGE SUB-BASS HOODIE',
    subtitle: 'Wave 02 // Noise & Pulse',
    sku: 'VD-01-W02-004',
    slug: 'heavy-gauge-sub-bass-hoodie',
    category: 'knitwear',
    collection: 'HEAVY FLEECE',
    drop: 'DROP 01 // HORIZON',
    wave: 'W02',
    price: 240,
    currency: 'USD',
    description: 'Formulated in custom 700gsm French terry knit with double-layered crossover hood and no drawstrings for a pure minimal facade. Garment dyed in stone-cold mineral pigments.',
    editorialDescription: 'Massive weight, tactile insulation, and an uncompromising silhouette.',
    details: [
      '700gsm custom loopback French terry',
      'Seamless kangaroo pocket with invisible side zip entry',
      'Reinforced ribbed cuffs with thumbhole aperture',
      'Tonal micro-embroidered VOID coordinate code on cuff'
    ],
    materials: ['100% Organic Heavyweight Cotton'],
    fit: 'Voluminous boxy crop.',
    sizes: ['01 (S)', '02 (M)', '03 (L)', '04 (XL)'],
    colors: [
      { name: 'Concrete Grey', hex: '#777777' },
      { name: 'Near Black', hex: '#111111' }
    ],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'DROP 01',
    inStock: true,
    stockCount: 22,
    isFeatured: true,
    isNewDrop: true,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-17'
  },
  {
    id: 'prod-005',
    name: 'PLEATED WIDE ARCHIVE TROUSER',
    subtitle: 'Wave 03 // Spatial Flow',
    sku: 'VD-01-W03-005',
    slug: 'pleated-wide-archive-trouser',
    category: 'bottoms',
    collection: 'COLLAPSED TAILORING',
    drop: 'DROP 01 // HORIZON',
    wave: 'W03',
    price: 290,
    currency: 'USD',
    description: 'Double deep inverted pleats cascading into an architectural wide-leg stance. Extended waistband tab with industrial gunmetal buckle closures.',
    editorialDescription: 'Volumetric movement that redefines the modern streetwear stance.',
    details: [
      'Heavy drape wool-gabardine weave',
      'Double front inverted knife pleats',
      'Adjustable side cinch waist tabs',
      'Deep trouser hem for tailored break or stack'
    ],
    materials: ['70% Wool', '30% Technical Viscose'],
    fit: 'High rise, dramatic wide leg fluid drape.',
    sizes: ['01 (S)', '02 (M)', '03 (L)', '04 (XL)'],
    colors: [
      { name: 'Monolith Black', hex: '#111111' },
      { name: 'Stone Bone', hex: '#D6D1C8' }
    ],
    images: [
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'ARCHIVE',
    inStock: true,
    stockCount: 6,
    isFeatured: false,
    isNewDrop: true,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-18'
  },
  {
    id: 'prod-006',
    name: 'TACTICAL CHEST HARNESS BAG',
    subtitle: 'Wave 03 // Kinetic Hardware',
    sku: 'VD-01-W03-006',
    slug: 'tactical-chest-harness-bag',
    category: 'accessories',
    collection: 'TECHNICAL ACCESSORIES',
    drop: 'DROP 01 // HORIZON',
    wave: 'W03',
    price: 185,
    currency: 'USD',
    description: 'Modular ballistic nylon chest rig with Fidlock magnetic V-buckles. Convertible to crossbody holster or standalone utility pouch.',
    editorialDescription: 'High-speed modular utility gear constructed for functional carrying.',
    details: [
      '1050D ballistic Cordura nylon construction',
      'German Fidlock magnetic quick-release hardware',
      'YKK Aquaguard matte waterproof zippers',
      'Breathable 3D spacer mesh back padding'
    ],
    materials: ['Cordura 1050D', 'Mil-spec Nylon Webbing'],
    fit: 'One-size fully adjustable harness system.',
    sizes: ['ONE SIZE'],
    colors: [
      { name: 'Matte Black', hex: '#111111' }
    ],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'LIMITED',
    inStock: true,
    stockCount: 11,
    isFeatured: true,
    isNewDrop: false,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-18'
  },
  {
    id: 'prod-007',
    name: 'RAW EDGE OVERSIZED KIMONO COAT',
    subtitle: 'Wave 04 // Upcoming Protocol',
    sku: 'VD-01-W04-007',
    slug: 'raw-edge-oversized-kimono-coat',
    category: 'outerwear',
    collection: 'CITY ARMOR',
    drop: 'DROP 01 // HORIZON',
    wave: 'W04',
    price: 460,
    currency: 'USD',
    description: 'East-meets-brutalist oversized open wrap coat with obi tie belt, raw needle-punched wool edges, and deep side slits for walking freedom.',
    editorialDescription: 'Sculpted for ceremonial presence and urban utility.',
    details: [
      '550gsm boiled virgin wool',
      'Hand-finished fringed edge treatments',
      'Concealed magnetic interior closure button',
      'Double oversized patch pockets'
    ],
    materials: ['100% Boiled Virgin Wool'],
    fit: 'Volumetric cocoon drape.',
    sizes: ['01 (S)', '02 (M)', '03 (L)', '04 (XL)'],
    colors: [
      { name: 'Monolith Black', hex: '#111111' },
      { name: 'Concrete Grey', hex: '#777777' }
    ],
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'NEW ARRIVAL',
    inStock: true,
    stockCount: 5,
    isFeatured: true,
    isNewDrop: true,
    releaseStatus: 'unlocked',
    releaseDate: '2026-10-18'
  },
  {
    id: 'prod-008',
    name: 'ASYMMETRIC HEAVY HOODED CAPE',
    subtitle: 'Wave 05 // Horizon Protocol',
    sku: 'VD-01-W05-008',
    slug: 'asymmetric-heavy-hooded-cape',
    category: 'outerwear',
    collection: 'CITY ARMOR',
    drop: 'DROP 01 // HORIZON',
    wave: 'W05',
    price: 510,
    currency: 'USD',
    description: 'Sculptural technical cape with asymmetric front zipper and integrated face shield scarf. Built for extreme silhouettes.',
    editorialDescription: 'The pinnacle statement of the Horizon Protocol.',
    details: [
      'Bonded technical neoprene and wool shell',
      'Asymmetric diagonal zip fastening',
      'Removable balaclava neck warmer'
    ],
    materials: ['70% Wool', '30% Technical Elastane'],
    fit: 'Sweeping fluid geometric drape.',
    sizes: ['01 (S)', '02 (M)', '03 (L)'],
    colors: [
      { name: 'Monolith Black', hex: '#111111' }
    ],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'
    ],
    badge: 'LIMITED',
    inStock: true,
    stockCount: 7,
    isFeatured: false,
    isNewDrop: true,
    releaseStatus: 'incoming',
    releaseDate: '2026-10-25'
  }
];

const FIXTURE_COLLECTIONS: Collection[] = [
  {
    id: 'col-01',
    title: 'CITY ARMOR',
    code: 'COL_01',
    description: 'Heavyweight protective silhouettes engineered for brutal urban landscapes and nocturnal movement.',
    season: 'HORIZON 2026',
    itemCount: 8,
    heroImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    slug: 'city-armor'
  },
  {
    id: 'col-02',
    title: 'COLLAPSED TAILORING',
    code: 'COL_02',
    description: 'Deconstructed suits, dropped shoulders, and fluid oversized wool gabardine drapery.',
    season: 'CORE REPEAT',
    itemCount: 6,
    heroImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    slug: 'collapsed-tailoring'
  },
  {
    id: 'col-03',
    title: 'HEAVY FLEECE & KNITS',
    code: 'COL_03',
    description: '700gsm custom French terry hoodies and thermal architectural sweaters with raw finishes.',
    season: 'PERPETUAL ARCHIVE',
    itemCount: 5,
    heroImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    slug: 'heavy-fleece-knits'
  },
  {
    id: 'col-04',
    title: 'TECHNICAL ACCESSORIES',
    code: 'COL_04',
    description: 'Cordura nylon chest rigs, magnetic Fidlock keychains, and modular holster systems.',
    season: 'HARDWARE PROTOCOL',
    itemCount: 7,
    heroImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    slug: 'technical-accessories'
  }
];

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    // Simulate real asynchronous network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    let items = [...FIXTURE_PRODUCTS];

    if (params?.category) {
      items = items.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params?.collection) {
      items = items.filter((p) => p.collection.toLowerCase().includes(params.collection!.toLowerCase()));
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined) {
      items = items.filter((p) => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.sort) {
      if (params.sort === 'price-asc') {
        items.sort((a, b) => a.price - b.price);
      } else if (params.sort === 'price-desc') {
        items.sort((a, b) => b.price - a.price);
      } else if (params.sort === 'newest') {
        items.sort((a, b) => (b.isNewDrop ? 1 : 0) - (a.isNewDrop ? 1 : 0));
      }
    }

    return items;
  },

  async getNewArrivals(): Promise<Product[]> {
    const all = await this.getProducts();
    return all.filter((p) => p.isNewDrop || p.releaseStatus === 'unlocked');
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const all = await this.getProducts();
    return all.filter((p) => p.isFeatured);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return FIXTURE_PRODUCTS.find((p) => p.slug === slug) || null;
  },

  async getCollections(): Promise<Collection[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...FIXTURE_COLLECTIONS];
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      throw new Error('Please enter a valid frequency link (email address).');
    }
    return {
      success: true,
      message: 'IDENTITY LOGGED. YOU ARE REGISTERED FOR DROP 01 NOTIFICATIONS.'
    };
  }
};
