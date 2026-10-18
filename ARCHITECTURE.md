# VOID — Architecture & Backend Integration Specification

> **Brand**: VOID  
> **Tagline**: *"Wear Your Own Identity."*  
> **Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS + React Router v7 + Lucide React  
> **Backend Roadmap**: Node.js + Express + MongoDB (MERN Stack)

---

## 1. Page Hierarchy & Routing Structure

All routes are declared in [`src/App.tsx`](file:///d:/Projects/Void/frontend/src/App.tsx) and wrapped with `ToastProvider`, `CartProvider`, and `WishlistProvider`.

| Route Path | Page Component | Layout Mode | Purpose & Description |
|---|---|---|---|
| `/` | [`LandingPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/LandingPage.tsx) | Framed Industrial Canvas | Award-winning cinematic editorial landing page featuring Vexo-inspired motion, framed poster panels, and 6 campaign sections. |
| `/shop` | [`ShopPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/ShopPage.tsx) | App Layout (`Layout.tsx`) | Full archive catalog with category filter tabs, search parameters, valuation range, sort cadence, and filter drawer. |
| `/product/:slug` | [`ProductDetailPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/ProductDetailPage.tsx) | App Layout (`Layout.tsx`) | Deep product showcase: multi-angle photo gallery, unisex size selector (`01`–`04`), colorways, quantity stepper, architectural specs, and companion silhouettes. |
| `/collections` | [`CollectionsPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/CollectionsPage.tsx) | App Layout (`Layout.tsx`) | Atmospheric collection tiles (*City Armor*, *Collapsed Tailoring*, *Heavy Fleece*, *Technical Accessories*) linking to filtered catalog views. |
| `/style-discovery` | [`StyleDiscoveryPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/StyleDiscoveryPage.tsx) | App Layout (`Layout.tsx`) | Interactive proportion matrix allowing users to calibrate preferences (Monolithic Armor, Collapsed Tailoring, Kinetic Hardware, Sub-Bass Fleece) and view matched silhouettes. |
| `/about` | [`AboutPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/AboutPage.tsx) | App Layout (`Layout.tsx`) | Atelier manifesto, design philosophy, zero-restock policy, and material specifications. |
| `*` | [`NotFoundPage.tsx`](file:///d:/Projects/Void/frontend/src/pages/NotFoundPage.tsx) | App Layout (`Layout.tsx`) | Minimalist brutalist 404 screen with recovery vector back to `/`. |

---

## 2. Component System Architecture

```
frontend/src/
├── components/
│   ├── landing/                   # Dedicated Editorial Landing Components
│   │   ├── LandingHero.tsx        # Section 1: Integrated top nav + asymmetric oversized typography + model cutout
│   │   ├── EditorialGrid.tsx      # Section 2: Asymmetric lookbook masonry grid with editorial labels
│   │   ├── StatementBanner.tsx    # Section 3: Full-width dark monochrome manifesto banner
│   │   ├── DropAnnouncement.tsx   # Section 4: "DROP 01 // FORM IN MOTION" announcement & fabric specs
│   │   ├── LookbookStrip.tsx      # Section 5: Horizontal outfit & silhouette strip
│   │   └── LandingFooter.tsx      # Section 6: Minimal black footer with brand tagline & directories
│   │
│   ├── layout/                    # Global Application Layout
│   │   ├── Layout.tsx             # Wrapper with header, drawers, toast container, and footer
│   │   ├── SiteHeader.tsx         # Sticky navigation header with search modal, account, saved & bag triggers
│   │   ├── MobileNavigation.tsx   # Responsive slide-in mobile navigation menu
│   │   ├── AnnouncementBar.tsx    # Top drop beacon & notification bar
│   │   ├── SiteFooter.tsx         # Full architectural 4-column footer with live UTC signal clock
│   │   ├── CartDrawer.tsx         # Slide-out interactive bag with quantity steppers and subtotal
│   │   └── WishlistDrawer.tsx     # Slide-out watchlist drawer with direct bag transfers
│   │
│   ├── product/                   # Product Displays
│   │   ├── ProductCard.tsx        # Card with hover photo swap, quick-size drawer, and wishlist toggle
│   │   └── ProductGrid.tsx        # Responsive grid (1 to 4 cols) with skeleton loaders & empty states
│   │
│   └── common/                    # Core Atomic UI Primitives
│       ├── Button.tsx             # Editorial pill `( SHO_P )`, solid, outline, and ghost variants
│       ├── PriceDisplay.tsx       # Standardized currency formatting with strikethrough original prices
│       ├── ProductBadge.tsx       # Brutalist technical tags: `[ DROP 01 ]`, `[ ARCHIVE ]`, `[ LIMITED ]`
│       ├── Breadcrumbs.tsx        # Monospaced breadcrumb hierarchy
│       ├── SearchInput.tsx        # Underlined brutalist search input with clear trigger
│       ├── FilterDrawer.tsx       # Slide-out drawer for filtering by category, price, and sort
│       ├── SizeSelector.tsx       # Unisex numbered sizing (`01 (S)`, `02 (M)`, `03 (L)`, `04 (XL)`)
│       ├── ColorSelector.tsx      # Swatch selector for mineral-dyed tonal colorways
│       ├── QuantitySelector.tsx   # Stepper `[-] [01] [+]`
│       ├── LoadingSkeleton.tsx    # High-contrast skeleton pulse placeholders
│       ├── EmptyState.tsx         # Empty query feedback
│       ├── ErrorState.tsx         # Transmission interruption feedback with retry action
│       ├── Modal.tsx              # Accessible dialog with escape listener and focus trap
│       └── Toast.tsx              # Feedback notifications (success, error, info)
```

---

## 3. Data Models & TypeScript Contracts

Defined in [`src/types/product.ts`](file:///d:/Projects/Void/frontend/src/types/product.ts) and [`src/types/cart.ts`](file:///d:/Projects/Void/frontend/src/types/cart.ts):

### Product Schema (`Product`)
```typescript
interface Product {
  id: string;                      // Unique ID (e.g., 'prod-001')
  name: string;                    // e.g., 'STRUCTURED COLLAPSE COAT'
  subtitle?: string;               // e.g., 'Wave 01 // Master Silhouette'
  sku: string;                     // e.g., 'VD-01-W01-001'
  slug: string;                    // URL slug (e.g., 'structured-collapse-coat')
  category: 'outerwear' | 'tailoring' | 'knitwear' | 'tops' | 'bottoms' | 'accessories';
  collection: string;              // e.g., 'CITY ARMOR'
  drop: string;                    // e.g., 'DROP 01 // HORIZON'
  wave: string;                    // e.g., 'W01'
  price: number;                   // e.g., 495
  currency: string;                // 'USD'
  originalPrice?: number;
  description: string;
  editorialDescription?: string;
  details: string[];               // Material and architectural features
  materials: string[];             // e.g., ['78% Virgin Wool', '18% Polyamide']
  fit: string;                     // e.g., 'Exaggerated unisex oversized fit'
  sizes: string[];                 // e.g., ['01 (S)', '02 (M)', '03 (L)', '04 (XL)']
  colors: { name: string; hex: string }[];
  images: string[];                // Image URLs (primary, secondary, detail)
  badge?: 'DROP 01' | 'ARCHIVE' | 'LIMITED' | 'NEW ARRIVAL' | 'SOLDOUT';
  inStock: boolean;
  stockCount?: number;
  isFeatured: boolean;
  isNewDrop: boolean;
  releaseStatus: 'unlocked' | 'incoming' | 'archived';
  releaseDate?: string;
}
```

### Cart Item Schema (`CartItem`)
```typescript
interface CartItem {
  id: string;                      // Composite key: `${productId}-${size}-${color}`
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}
```

---

## 4. Backend Implementation Roadmap (MERN Stack)

The backend directory [`backend/`](file:///d:/Projects/Void/backend) is currently scaffolded for Node.js / Express / MongoDB.

### Recommended Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                  # Mongoose MongoDB connection
│   ├── models/
│   │   ├── Product.ts             # Product Mongoose schema
│   │   ├── Collection.ts          # Collection Mongoose schema
│   │   ├── Order.ts               # Checkout order schema with Stripe session ID
│   │   └── Subscriber.ts          # Newsletter subscriber schema
│   ├── controllers/
│   │   ├── productController.ts   # Product listing, filtering, slug retrieval
│   │   ├── collectionController.ts# Collection listings
│   │   ├── orderController.ts     # Checkout session creation and webhook handler
│   │   └── newsletterController.ts# Email validation and frequency link logging
│   ├── routes/
│   │   ├── productRoutes.ts       # /api/products
│   │   ├── collectionRoutes.ts    # /api/collections
│   │   ├── orderRoutes.ts         # /api/orders
│   │   └── newsletterRoutes.ts    # /api/newsletter
│   ├── middleware/
│   │   ├── errorHandler.ts        # Centralized JSON error response
│   │   └── rateLimiter.ts         # Protection against DDoS & brute-force
│   └── server.ts                  # Express server entry point
├── package.json
└── tsconfig.json
```

### REST API Endpoints Specification

| Method | Endpoint | Query / Body Parameters | Response |
|---|---|---|---|
| `GET` | `/api/products` | `?category=&collection=&drop=&search=&minPrice=&maxPrice=&sort=&page=&limit=` | `{ products: Product[], total: number, page: number }` |
| `GET` | `/api/products/:slug` | None | `{ product: Product }` |
| `GET` | `/api/collections` | None | `{ collections: Collection[] }` |
| `POST` | `/api/newsletter/subscribe` | `{ email: string }` | `{ success: boolean, message: string }` |
| `POST` | `/api/checkout/create-session` | `{ items: { productId: string, size: string, color: string, quantity: number }[] }` | `{ checkoutUrl: string, sessionId: string }` |
| `POST` | `/api/webhooks/stripe` | Raw Stripe payload + signature header | Handled asynchronously to reserve inventory and emit order confirmation. |

---

## 5. Bridging the Frontend to the Real Backend

The frontend already has a pre-configured HTTP client at [`src/services/api.ts`](file:///d:/Projects/Void/frontend/src/services/api.ts):

1. **Environment Configuration**:
   Create a `.env` in `frontend/`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Switching from Fixtures to Live Endpoints in [`productService.ts`](file:///d:/Projects/Void/frontend/src/services/productService.ts)**:
   ```typescript
   import { apiClient } from './api';

   export const productService = {
     async getProducts(params?: ProductFilterParams): Promise<Product[]> {
       const query = new URLSearchParams(params as any).toString();
       return apiClient<Product[]>(`/products?${query}`);
     },
     async getProductBySlug(slug: string): Promise<Product | null> {
       return apiClient<Product>(`/products/${slug}`);
     },
     async getCollections(): Promise<Collection[]> {
       return apiClient<Collection[]>('/collections');
     },
     async subscribeNewsletter(email: string) {
       return apiClient<{ success: boolean; message: string }>('/newsletter/subscribe', {
         method: 'POST',
         body: JSON.stringify({ email })
       });
     }
   };
   ```

---

## 6. Design System Tokens Quick Reference

| Token Name | Hex Code | Purpose |
|---|---|---|
| `void-deep` | `#0B0B0B` | Distressed outer canvas & high-contrast deep backgrounds |
| `void-charcoal` | `#202020` | Secondary borders, frames, and deep panels |
| `void-ivory` | `#F0F0ED` | Editorial canvas surface for high-fashion editorial panels |
| `void-palegrey` | `#D1D3D2` | Card image stages, neutral fills, and secondary text |
| `void-mediumgrey` | `#777777` | Monospaced metadata, coordinate codes, and subtitles |
| `void-white` | `#FFFFFF` | Primary high-contrast typography and focus highlights |

- **Display Font**: `Syne` (800) for oversized brutalist statements.
- **Heading Font**: `Space Grotesk` (600/700) for uppercase titles and pill buttons.
- **Body Font**: `Inter` (300/400) for high legibility copy.
- **Monospace Font**: `JetBrains Mono` for SKU tags, wave badges, and drop metadata.
