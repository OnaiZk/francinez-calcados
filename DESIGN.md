# Design System — Francinez Calçados

## 1. Aesthetic Direction & Brand Essence

- **Brand Name**: Francinez Calçados (`FC` Monogram)
- **Domain**: Digital Flagship Website & WhatsApp Footwear Catalog (Sneakers, Suede Flats, Platform Sneakers, Luxury Slides & Sandals).
- **Aesthetic Persona**: **Luminous Boutique Flagship (Branco, Bege & Dourado Champagne)**. Inspired by modern luxury footwear e-commerce (Veja, Reformation Shoes, Farfetch Editorial), combining crisp pure white (`#FFFFFF`), soft ivory (`#FAF8F5`), warm satin beige (`#F3EDE2`), and brushed champagne gold (`#B08D57` / `#7A5B2B`) with deep espresso ink (`#1C1917`).
- **Complete Website + Frictionless WhatsApp Checkout**: Structured as a complete, portfolio-worthy e-commerce website (Top Announcement Bar, Sticky Header with Navigation, Editorial Hero Section with Featured Showcase, Curated Category Cards, Interactive Filter Dock, 21-Model Product Grid, Special Size Consultation Banner, 3-Step "Como Comprar" Guide, and Multi-Column Footer) while converting 100% of orders into a structured WhatsApp checkout message.
- **Anti-Goals**:
  - **Zero Neon / Zero Hard Sell**: Strictly no neon greens, fluorescent badges, or countdown timers.
  - **No Fixed Size Ceiling**: Never display a rigid store-wide size limit (such as `"34 ao 43"`). Sizes are rendered dynamically from the catalog dataset plus direct WhatsApp consultation triggers (`"Outro nº? Consultar"`) so new models (e.g., size `44`+) integrate seamlessly.
  - **Standardized Studio Plinths**: Every footwear photo sits on a uniform warm alabaster studio plinth (`#EFECE6`) at a consistent 3/4 right-facing angle.

---

## 2. Color Palette & Atmospheric Tokens

All tokens are defined on `:root` in [`styles.css`](./styles.css).

| Token | Value | Role & Usage |
| :--- | :--- | :--- |
| `--bg-white` | `#FFFFFF` | Primary surface for header, hero, product cards, filter dock, and drawers |
| `--bg-ivory` | `#FAF8F5` | Main page canvas (`body`) and subtle alternating sections |
| `--bg-beige` | `#F3EDE2` | Warm satin beige surface for hero highlights, filter pills, and secondary containers |
| `--bg-beige-deep` | `#E8DFD1` | Hover surface for beige interactive controls |
| `--bg-plinth` | `#EFECE6` | Standardized 4:3 footwear photography plinth background |
| `--ink-primary` | `#1C1917` | Primary deep espresso typography and dark luxury CTAs (`16.8:1` on white) |
| `--ink-secondary` | `#4A433B` | Secondary body copy, navigation links, and descriptions (`9.4:1` on white) |
| `--ink-muted` | `#635B52` | Metadata, installment notes, and captions (`6.2:1` on white — WCAG AA compliant) |
| `--gold-primary` | `#B08D57` | Brushed champagne gold for active borders, monogram accents, and highlights |
| `--gold-dark` | `#7A5B2B` | High-contrast burnished gold for text labels, badges, and Pix pricing (`5.8:1` on white) |
| `--gold-soft` | `#F7F2E7` | Soft champagne tint for active pills, badges, and consultation banners |
| `--gold-border` | `#DECFAF` | Refined gold hairline border for cards, badges, and featured banners |
| `--wa-brand` | `#1F5E43` | Sober forest emerald reserved for final WhatsApp submission actions |
| `--border-subtle` | `#EAE3D5` | Primary hairline divider across cards, header, and sections |
| `--border-strong` | `#D8CEBC` | Emphasized border for inputs and unselected interactive pills |

---

## 3. Typography & Scannable Hierarchy

- **Primary Font (`--font-sans`)**: `'Plus Jakarta Sans'`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. Used across all UI controls, navigation, product titles, prices, and body copy for clean modern legibility on mobile and desktop.
- **Editorial Display Font (`--font-display`)**: `'Cormorant Garamond'`, `Georgia, serif`. Used selectively for italicized luxury keywords in the Hero and Section headings (`<em>estilo</em>`).
- **Numeric Discipline**: `font-variant-numeric: tabular-nums` is enforced on all prices (`.price-pix-value`, `.price-card-row`), size pills (`.size-pill`, `.card-size-btn`), and bag totals so numbers align cleanly without layout jitter.

### Type Scale
- **Hero Display (`h1`)**: `clamp(1.85rem, 3.8vw, 3.1rem)`, weight `800`, line-height `1.08`, letter-spacing `-0.03em`.
- **Section Title (`.section-title`)**: `clamp(1.35rem, 2.5vw, 1.95rem)`, weight `800`, letter-spacing `-0.025em`.
- **Product Card Title (`.card-title`)**: `0.84rem` mobile / `0.94rem` desktop (`640px+`), weight `700`, line-height `1.3`, 2-line clamp (`min-height: 2.6em`).
- **Pix Price (`.price-pix-value`)**: `1.05rem` mobile / `1.18rem` desktop, weight `800`, tabular numerals.
- **Card Installment Note (`.price-card-row`)**: `0.68rem`, single-line (`white-space: nowrap`), `color: var(--ink-muted)`.

---

## 4. Layout, Spatial Architecture & Responsive Breakpoints

- **Container Width**: `max-width: 1320px`, centered with `14px` horizontal padding on mobile and `28px` on tablet/desktop.
- **Mobile-First 2-Column Product Grid**:
  - `< 640px`: `grid-template-columns: repeat(2, minmax(0, 1fr))` with `10px` gap (and a `2 col | 1 col` user toggle in the toolbar).
  - `640px – 1023px`: `repeat(3, minmax(0, 1fr))` with `18px` gap.
  - `>= 1024px`: `repeat(4, minmax(0, 1fr))` with `20px` gap.
- **Dynamic Size Architecture**:
  - `#size-rail` dynamically computes all unique sizes from `PRODUCTS` in [`app.js`](./app.js) and appends an `"Outro nº? Chamar"` pill (`data-action="consult-custom-size"`), ensuring zero hardcoded size limits.
- **Overlays & Drawers**:
  - **Product Quick-View (`.quickview-sheet`)**: Bottom sheet on mobile (`border-radius: 24px 24px 0 0`), centered `740px` modal dialog on desktop (`>= 768px`).
  - **Shopping Bag Drawer (`.bag-drawer`)**: Slide-over drawer (`max-width: 440px`) with item quantity steppers, Pix vs. Cartão toggle, Entrega vs. Retirada selector, live WhatsApp message preview, and direct `wa.me` launch.
