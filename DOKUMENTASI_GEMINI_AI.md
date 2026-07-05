# DOKUMENTASI LENGKAP PROJECT: MBG LELANG
# ==========================================
# Berikan file ini ke Gemini AI agar ia memahami keseluruhan codebase.
# Terakhir diperbarui: 5 Juli 2026

---

## 1. OVERVIEW PROJECT

**MBG Lelang** adalah platform O2O (Online-to-Offline) katalog barang bekas & lelang milik **PT Makmur Bersama Gadai (PT MBG)** — sebuah perusahaan pawnshop/gadai. 

### Konsep Bisnis:
- Pengguna publik melihat katalog barang online, lalu membeli langsung di toko fisik
- Platform juga berfungsi sebagai **internal management system** untuk gudang, kasir, dan analitik
- Fokus saat ini: **Cabang Pasuruan - Sangar**

### Tech Stack:
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 6
- **Auth**: Custom JWT (jose library) + bcryptjs
- **Image Storage**: Supabase Storage
- **Charts**: Recharts
- **Icons**: Lucide React
- **Barcode Scanner**: html5-qrcode
- **Excel Export**: exceljs
- **Deployment**: Vercel (region: sin1 / Singapore)
- **Base Path**: `/lelang` (semua route diprefix `/lelang/...`)

### Environment Variables yang Dibutuhkan:
```
DATABASE_URL="postgresql://..."       # Prisma connection string
DIRECT_URL="postgresql://..."         # Prisma direct connection
JWT_SECRET="..."                      # Secret key untuk JWT
NEXT_PUBLIC_SUPABASE_URL="..."        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."   # Supabase anon key
```

---

## 2. DATABASE SCHEMA (Prisma)

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  nama_lengkap String   @map("nama_lengkap")
  asal_cabang  String   @map("asal_cabang")
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model AuctionItem {
  id                   Int                @id @default(autoincrement())
  sku                  String             @unique
  branchName           String             @map("branch_name")
  title                String
  category             String
  description          String
  defects              String?
  price                Decimal            @db.Decimal(12, 2)
  status               Status             @default(Tersedia)
  images               String[]
  whatsappNumber       String             @map("whatsapp_number")
  createdAt            DateTime           @default(now()) @map("created_at")
  youtubeUrl           String?            @map("youtube_url")
  kondisi              Kondisi
  physicalItemId       String?            @map("physical_item_id")
  isMarketplaceVisible Boolean            @default(true) @map("is_marketplace_visible")
  hasWarranty          Boolean            @default(false) @map("has_warranty")
  nomorInduk           String?            @map("nomor_induk")
  parentId             Int?               @map("parent_id")
  parent               AuctionItem?       @relation("ItemVariants", fields: [parentId], references: [id], onDelete: Cascade)
  children             AuctionItem[]      @relation("ItemVariants")
  variantImageUrl      String?            @map("variant_image_url")
  hargaJual            Decimal?           @map("harga_jual") @db.Decimal(12, 2)
  physicalItem         PhysicalItem?      @relation(fields: [physicalItemId], references: [id])
  transactions         SalesTransaction[]
  returnReason         String?            @map("return_reason")

  @@index([status])
  @@index([branchName])
  @@index([category])
  @@index([nomorInduk])
  @@index([sku(ops: raw("gin_trgm_ops"))], map: "idx_auction_items_sku_trgm", type: Gin)
  @@map("auction_items")
}

model SalesTransaction {
  id              Int         @id @default(autoincrement())
  itemId          Int         @map("item_id")
  sku             String
  soldPrice       Decimal     @map("sold_price") @db.Decimal(12, 2)
  branchName      String      @map("branch_name")
  cashierName     String      @map("cashier_name")
  transactionDate DateTime    @default(now()) @map("transaction_date")
  item            AuctionItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  isReturned      Boolean     @default(false) @map("is_returned")
  returnReason    String?     @map("return_reason")

  @@index([transactionDate])
  @@index([branchName])
  @@index([branchName, transactionDate])
  @@map("sales_transactions")
}

model PhysicalItem {
  id           String         @id @default(uuid())
  itemName     String         @map("item_name")
  category     String
  serialNumber String?        @map("serial_number")
  branchName   String         @map("branch_name")
  currentRack  String         @map("current_rack")
  description  String?
  images       String[]
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  auctionItems AuctionItem[]
  contracts    PawnContract[]

  @@index([branchName])
  @@index([category])
  @@map("physical_items")
}

model PawnContract {
  id             String       @id @default(uuid())
  uniqueCode     String       @unique @map("unique_code")
  status         PawnStatus   @default(AKTIF)
  customerName   String       @map("customer_name")
  customerPhone  String?      @map("customer_phone")
  appraisalValue Decimal      @map("appraisal_value") @db.Decimal(12, 2)
  physicalItemId String       @map("physical_item_id")
  notes          String?
  startDate      DateTime     @default(now()) @map("start_date")
  endDate        DateTime?    @map("end_date")
  createdAt      DateTime     @default(now()) @map("created_at")
  previousSku    String?      @map("previous_sku")
  extensionCount Int          @default(0) @map("extension_count")
  extensionFee   Decimal?     @map("extension_fee") @db.Decimal(12, 2)
  sellingPrice   Decimal?     @map("selling_price") @db.Decimal(12, 2)
  buyerName      String?      @map("buyer_name")
  paymentMethod  String?      @map("payment_method")
  soldAt         DateTime?    @map("sold_at")
  physicalItem   PhysicalItem @relation(fields: [physicalItemId], references: [id])

  @@index([physicalItemId])
  @@index([status])
  @@index([customerName(ops: raw("gin_trgm_ops"))], map: "idx_pawn_contracts_customer_name_trgm", type: Gin)
  @@index([status], map: "idx_pawn_contracts_status")
  @@index([uniqueCode], map: "idx_pawn_contracts_unique_code")
  @@map("pawn_contracts")
}

model AuditLog {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now()) @map("created_at")
  adminEmail  String   @map("admin_email")
  eventType   String   @map("event_type")
  productSku  String   @map("product_sku")
  productName String   @map("product_name")
  description String

  @@index([createdAt])
  @@index([adminEmail])
  @@index([eventType])
  @@map("audit_logs")
}

enum Kondisi {
  Baru
  Bekas
}

enum Role {
  SUPERADMIN
  ADMIN
}

enum PawnStatus {
  AKTIF
  PERPANJANG
  LUNAS
  TEBUS
  PROSES_LELANG
  LELANG
  TERJUAL
}

enum Status {
  Tersedia
  Dipesan
  Terjual
  RETUR
}
```

---

## 3. FOLDER STRUCTURE

```
mbg-lelang/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Main seed data
│   ├── seed1000.ts            # Bulk seed (1000 items)
│   ├── seed_gudang.ts         # Seed physical items + pawn contracts
│   ├── seed_sold.ts           # Seed sales transactions
│   ├── seed_inject.ts         # Inject additional data
│   ├── clear_data.ts          # Clear all data
│   ├── migrate_*.sql/ts       # Migration scripts
│   └── update_*.ts            # Update scripts
├── src/
│   ├── middleware.ts           # Auth middleware (JWT check)
│   ├── app/
│   │   ├── globals.css         # Tailwind theme + custom utilities
│   │   ├── layout.tsx          # Root layout (Inter font, fetch patching)
│   │   ├── (public)/           # Public-facing routes
│   │   │   ├── layout.tsx      # Public layout (Navbar + Footer)
│   │   │   ├── page.tsx        # Landing page / catalog homepage
│   │   │   ├── CatalogView.tsx # Client component: product grid + modal
│   │   │   └── katalog/[id]/   # Product detail page
│   │   ├── mbg-internal-portal/  # Admin portal (protected)
│   │   │   ├── layout.tsx      # Admin layout (Sidebar + BottomNav)
│   │   │   ├── page.tsx        # Dashboard analytics
│   │   │   ├── AdminDashboardClient.tsx  # Dashboard charts (Recharts)
│   │   │   ├── login/page.tsx  # Login page
│   │   │   ├── items/          # Item management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ItemsTableClient.tsx  # Items table (53KB)
│   │   │   │   ├── new/        # Add new item
│   │   │   │   └── [id]/       # Edit item detail
│   │   │   ├── kasir/          # POS Kasir
│   │   │   │   ├── page.tsx
│   │   │   │   └── KasirPOSClient.tsx    # POS system (33KB)
│   │   │   ├── gudang/         # Warehouse management
│   │   │   │   ├── page.tsx
│   │   │   │   └── UnifiedGudangClient.tsx  # Gudang system (59KB)
│   │   │   ├── reports/        # Sales reports
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ReportClient.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── laporan/ringkasan/  # Report summary
│   │   │   ├── log-aktivitas/      # Audit log viewer
│   │   │   └── settings/manage-users/  # User management (SUPERADMIN)
│   │   ├── admin/              # Legacy admin redirect routes
│   │   │   ├── [[...slug]]/
│   │   │   └── laporan/
│   │   └── api/                # API Routes
│   │       ├── auth/route.ts           # Login (POST) / Logout (DELETE)
│   │       ├── items/route.ts          # Public items (GET) / Create item (POST)
│   │       ├── kasir/
│   │       │   ├── checkout/route.ts   # Batch checkout (POST)
│   │       │   └── scan/route.ts       # Barcode lookup (GET)
│   │       └── admin/
│   │           ├── items/[id]/route.ts # GET/PUT/PATCH/DELETE item
│   │           ├── analytics/route.ts  # Dashboard analytics (GET)
│   │           ├── logs/route.ts       # Audit logs (GET)
│   │           ├── users/
│   │           │   ├── route.ts        # Create user (POST)
│   │           │   ├── [id]/           # Edit/Delete user
│   │           │   └── me/             # Current user
│   │           ├── reports/export/     # Excel export
│   │           └── gudang/
│   │               ├── route.ts        # Physical items CRUD
│   │               ├── contracts/route.ts   # Pawn contracts
│   │               ├── lifecycle/route.ts   # Full lifecycle management
│   │               ├── registrasi/          # New item registration
│   │               ├── lookup/              # Item lookup
│   │               └── search/              # Search
│   ├── components/
│   │   ├── AdminSidebar.tsx    # Desktop sidebar navigation
│   │   ├── AdminBottomNav.tsx  # Mobile bottom navigation + quick scan
│   │   ├── Navbar.tsx          # Public navbar
│   │   ├── Footer.tsx          # Public footer
│   │   ├── SearchBar.tsx       # Search with debounce
│   │   ├── BackButton.tsx      # Back navigation button
│   │   ├── DatePicker.tsx      # Date picker
│   │   ├── DateRangePicker.tsx # Date range picker
│   │   ├── PrintLabelEppos.tsx # Barcode label printing
│   │   └── ProductSkeleton.tsx # Loading skeleton
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── session.ts          # JWT encrypt/decrypt/getSession
│   │   ├── audit.ts            # Audit log helper
│   │   └── gudang.ts           # Auto-transition expired contracts
│   └── utils/
│       └── supabase/
│           ├── client.ts       # Supabase browser client
│           ├── server.ts       # Supabase server client
│           └── middleware.ts   # Supabase middleware
├── next.config.ts              # Next.js config (basePath: /lelang)
├── vercel.json                 # Vercel config (region: sin1)
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

---

## 4. AUTHENTICATION & AUTHORIZATION

### Flow:
1. User login via `/mbg-internal-portal/login` → POST `/api/auth`
2. Server validates email/password (bcryptjs compare)
3. Server creates JWT token (jose, HS256, 1 day expiry)
4. Token stored as httpOnly cookie `mbg_session`
5. Middleware checks token on every request to protected routes

### Session Payload (JWT Claims):
```typescript
type SessionPayload = {
  id: string;
  email: string;
  nama_lengkap: string;
  asal_cabang: string;
  role: Role; // "ADMIN" | "SUPERADMIN"
};
```

### Middleware Protection Rules:
- `/api/admin/*` → requires valid JWT with ADMIN or SUPERADMIN role (returns 401/403)
- `/mbg-internal-portal/*` → requires valid JWT with ADMIN or SUPERADMIN role (redirects to `/`)
- `/mbg-internal-portal/login` → if already authenticated, redirects to `/mbg-internal-portal`
- Public routes → no protection

### Role Permissions:
| Action | ADMIN | SUPERADMIN |
|--------|-------|------------|
| Dashboard | ✅ | ✅ |
| POS Kasir | ✅ | ✅ |
| View items | ✅ | ✅ |
| Toggle visibility | ✅ | ✅ |
| Edit items (full) | ❌ | ✅ |
| Delete items | ❌ | ✅ |
| Retur barang | ❌ | ✅ |
| Manage users | ❌ | ✅ |
| Gudang management | ✅ | ✅ |
| Reports | ✅ | ✅ |

---

## 5. LIBRARY FILES (src/lib/)

### prisma.ts — Prisma Client Singleton
```typescript
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
```

### session.ts — JWT Session Management
```typescript
import { SignJWT, jwtVerify } from "jose";
const secretKey = process.env.JWT_SECRET || "default_secret_key_change_me_in_production_123456";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1d").sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch { return null; }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mbg_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
```

### audit.ts — Audit Logging
```typescript
export type AuditLogEventType = "Barang Masuk" | "Barang Terjual" | "Barang Dipersiapkan / Dipesan" | "Barang Retur";

export async function logActivity({ adminEmail, eventType, productSku, productName, description }) {
  // Creates a record in the AuditLog table
}
```

### gudang.ts — Auto-Transition Expired Contracts
```typescript
export async function checkAndTransitionExpiredContracts() {
  // Updates all AKTIF contracts with expired endDate to PROSES_LELANG
}
```

---

## 6. API ROUTES — FULL SPECIFICATION

### POST /api/auth — Login
- **Input**: `{ email, password }`
- **Output**: Sets `mbg_session` cookie, returns `{ success: true, user: SessionPayload }`
- **Error**: 401 if invalid credentials

### DELETE /api/auth — Logout
- **Output**: Deletes `mbg_session` cookie

### GET /api/items — Public Catalog
- **Query Params**: `limit`, `skip`, `category`, `q` (search), `nomorInduk` (variant lookup)
- **Filters**: Only `Tersedia` + `isMarketplaceVisible: true` + branch contains "Pasuruan"
- **Output**: `{ success, data: AuctionItem[], hasMore: boolean }`

### POST /api/items — Create Item
- **Input**: `{ sku (numeric), branchName, title, category, description, kondisi, price, images[], whatsappNumber, youtubeUrl?, physicalItemId?, hasWarranty?, variants?[] }`
- **Variants**: Each variant gets SKU `{parentSku}-{index}`, linked via `parentId` and `nomorInduk`
- **Output**: Created parent + variants
- **Audit**: Logs "Barang Masuk"

### GET /api/kasir/scan — Barcode Lookup
- **Query**: `sku`
- **Output**: Item data if found and status != Terjual

### POST /api/kasir/checkout — Batch Checkout
- **Input**: `{ items: [{ itemId, sku, soldPrice, branchName, cashierName }] }`
- **Logic**: Atomic transaction — verifies each item exists and is available, updates status to Terjual, creates SalesTransaction
- **Audit**: Logs "Barang Terjual" for each item
- **Cache**: Revalidates public catalog paths

### GET /api/admin/items/[id] — Item Detail
### PUT /api/admin/items/[id] — Full Item Edit (SUPERADMIN only)
### PATCH /api/admin/items/[id] — Partial Update
- Handles: visibility toggle (any admin), status changes, RETUR process (SUPERADMIN only)
- **RETUR flow**: Updates item to RETUR → flags SalesTransaction as `isReturned: true` → sets item back to `Tersedia`

### DELETE /api/admin/items/[id] — Delete Item (SUPERADMIN only)

### GET /api/admin/analytics — Dashboard Data
- **Query Params**: `startDate`, `endDate` (YYYY-MM-DD format, WIB timezone)
- **Output**: `{ totalActive, totalSold, totalRevenue, dailySalesData[], categoryData[], cashierData[], recentTransactions[] }`

### GET /api/admin/logs — Audit Logs
- **Query Params**: `limit`, `skip`, `eventType`, `q` (search)
- **Output**: Paginated audit logs

### POST /api/admin/users — Create User (SUPERADMIN only)
- **Input**: `{ email, password, nama_lengkap, asal_cabang, role }`
- **Password**: Hashed with bcrypt (salt rounds: 10)

### GET /api/admin/gudang — List Physical Items
- **Query Params**: `id` (single), `branch`, `rack`, `status`, `q` (search)
- **Output**: Physical items with contracts and auction item counts

### POST /api/admin/gudang — Create Physical Item + Initial Contract

### GET /api/admin/gudang/lifecycle — List Contracts by Tab
- **Query Params**: `tab` = `STOK_AKTIF` | `PERPANJANG` | `PROSES_LELANG` | `ETALASE_LELANG` | `ARSIP`
- **Side effect**: Auto-transitions expired AKTIF contracts to PROSES_LELANG

### POST /api/admin/gudang/lifecycle — Create New or Extend Contract
- **Actions**: `CREATE_NEW` (new physical item + contract) or `PERPANJANG` (extend existing)
- **Due dates**: Auto-calculated by category (Elektronik: 1 month, Gerabahan: 4 months, Kendaraan: 2 months)

### PATCH /api/admin/gudang/lifecycle — Contract Status Transitions
- **Actions**: `TEBUS` (customer redeems), `POST_KATALOG` (list for auction → upserts AuctionItem), `TERJUAL` (sold → creates SalesTransaction)

### POST /api/admin/gudang/contracts — Add Contract to Existing Physical Item
### PATCH /api/admin/gudang/contracts — Update Contract Status

---

## 7. BUSINESS LOGIC: PAWN LIFECYCLE

```
AKTIF ──(perpanjang)──► PERPANJANG ──(new contract)──► AKTIF
  │                                                      
  ├──(expired, auto)──► PROSES_LELANG ──(post to catalog)──► LELANG ──(sold)──► TERJUAL
  │
  └──(customer redeems)──► TEBUS
```

### Key Rules:
1. **Auto-transition**: Contracts with `status=AKTIF` and `endDate < now()` → automatically become `PROSES_LELANG`
2. **Extension**: Creates a NEW PawnContract with `previousSku` linking to the old one, increments `extensionCount`
3. **Post to Catalog (LELANG)**: Upserts an `AuctionItem` using the contract's `uniqueCode` as SKU
4. **Sold (TERJUAL)**: Updates PawnContract, AuctionItem status, and creates SalesTransaction
5. **Due date calculation by category**:
   - Elektronik: 1 month
   - Gerabahan: 4 months
   - Kendaraan: 2 months
   - Others: 1 month

---

## 8. BUSINESS LOGIC: ITEM VARIANTS

Items support a parent-children relationship:
- **Parent item**: SKU = numeric (e.g., `12345`), `parentId = null`, `nomorInduk = SKU`
- **Child variants**: SKU = `{parentSku}-{index}` (e.g., `12345-1`, `12345-2`), `parentId = parent.id`, `nomorInduk = parentSku`
- All variants share the same `nomorInduk` for grouping
- Public catalog fetches variants via `GET /api/items?nomorInduk=12345`
- Parent item has `isMarketplaceVisible = false` by default (only variants are shown)

---

## 9. BUSINESS LOGIC: POS KASIR

1. **Cart persistence**: Uses `localStorage` key `mbg_pos_cart`
2. **Scanning**: Camera barcode scan (html5-qrcode) or manual SKU input
3. **Lookup**: `GET /api/kasir/scan?sku=xxx` → validates item exists and not sold
4. **Discount**: Per-item discount input in IDR
5. **Checkout**: `POST /api/kasir/checkout` → atomic batch transaction
6. **Receipt**: Auto-prints thermal receipt (80mm) via `window.print()`
7. **Realtime sync**: Supabase Realtime listens for `auction_items` table changes — warns if an item in cart was sold by another cashier
8. **Audio feedback**: Web Audio API beep sounds (success = sine 1000Hz, error = sawtooth 300Hz)

---

## 10. BUSINESS LOGIC: RETUR

Only SUPERADMIN can process returns:
1. Item must be `status = Terjual`
2. Admin provides `returnReason`
3. Item temporarily set to `RETUR` status
4. SalesTransaction records flagged as `isReturned = true` (not deleted, preserving history)
5. Item immediately set back to `Tersedia` for re-listing
6. Audit log records the return event

---

## 11. KEY UI COMPONENTS

### AdminSidebar.tsx — Desktop Navigation
Menu items: Dashboard, POS Kasir, Semua Barang, Tambah Barang, Laporan, Log Aktivitas
SUPERADMIN gets extra: "Kelola Pengguna"
Shows branch name and user role at bottom.

### AdminBottomNav.tsx — Mobile Navigation
5-tab bottom nav with centered FAB (Scan POS button).
FAB opens full-screen camera scanner overlay for quick barcode scanning.
Scanned items go directly to cart in localStorage and redirect to POS page.

### CatalogView.tsx — Public Catalog
- Category filter pills (Semua, Elektronik, Gerabahan, Kendaraan)
- Product cards grid (2 cols mobile, 4 cols desktop)
- Infinite scroll with IntersectionObserver
- Client-side cache for pagination results
- Modal/drawer for product details with image carousel
- Video (YouTube embed) support
- Variant selector chips
- WhatsApp CTA button
- Google Maps location link

### KasirPOSClient.tsx — POS System
- Camera barcode scanner (html5-qrcode)
- Manual SKU input
- Cart with per-item discount
- Subtotal/discount/grand total calculation
- Checkout button → atomic transaction
- Thermal printer receipt layout
- Supabase Realtime stock sync

### SearchBar.tsx — Debounced Search
300ms debounce, syncs with URL query params, triggers SSR re-render.

---

## 12. STYLING SYSTEM

### Custom Theme Tokens (globals.css):
```css
@theme {
  --color-brand-50 to --color-brand-950  /* Blue palette */
  --color-gold-400 to --color-gold-600   /* Gold accents */
  --color-surface-*                       /* Dark mode surfaces */
  --color-text-*                          /* Text colors */
  --color-status-tersedia: #22c55e       /* Green */
  --color-status-dipesan: #f59e0b        /* Amber */
  --color-status-terjual: #ef4444        /* Red */
  --color-gray-150: #eef0f3              /* Custom gray */
}
```

### Custom Utilities:
- `.glass` / `.glass-strong` — Glassmorphism effects
- `.gradient-brand` / `.gradient-gold` — Background gradients
- `.text-gradient-brand` / `.text-gradient-gold` — Text gradients
- `.shimmer` — Loading shimmer animation
- `.content-visibility-card` — Performance optimization for product cards

### Font:
- Inter (Google Fonts), CSS variable `--font-sans`

---

## 13. CONFIGURATION FILES

### next.config.ts:
```typescript
const nextConfig: NextConfig = {
  basePath: '/lelang',
  serverExternalPackages: ["exceljs"],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
```

### Root Layout — Fetch Patching:
```javascript
// Monkey-patches window.fetch to prepend '/lelang' to all '/api/' calls
// This is necessary because basePath doesn't apply to client-side fetch calls
if (typeof input === 'string' && input.startsWith('/api/')) {
  input = '/lelang' + input;
}
```

### vercel.json:
```json
{ "regions": ["sin1"] }
```

---

## 14. TIMEZONE HANDLING

All dates use **WIB (Waktu Indonesia Barat / UTC+7)**:
```typescript
// Convert Date to WIB date key
const getWibDateKey = (date: Date): string => {
  const wibTime = date.getTime() + (7 * 60 * 60 * 1000);
  const wibDate = new Date(wibTime);
  // Format as YYYY-MM-DD
};

// Parse WIB date string to UTC Date
function parseWibStartOfDay(dateStr: string): Date {
  // Creates UTC date at 00:00:00 WIB (which is 17:00:00 UTC previous day)
  const date = new Date(Date.UTC(year, month, day, 0, 0, 0));
  date.setUTCHours(date.getUTCHours() - 7);
  return date;
}
```

---

## 15. CODE PATTERNS & CONVENTIONS

1. **Server Components** (default) for data fetching → serialize with `JSON.parse(JSON.stringify())` → pass to **Client Components** (suffix `*Client.tsx`)
2. **Prisma `$transaction`** for atomic multi-step operations (checkout, lifecycle changes)
3. **Audit logging** after every important mutation via `logActivity()`
4. **`revalidatePath()`** for cache invalidation after mutations
5. **`force-dynamic` + `revalidate = 0`** on public pages for real-time data
6. **IDR currency formatting**: `new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`
7. **All API responses** follow format: `{ success: boolean, data?: any, message?: string }`
8. **Error messages** are in Indonesian (Bahasa Indonesia)
9. **SKU validation**: Must be numeric digits only
10. **Image hosting**: Supabase Storage, URLs stored as `String[]` in database

---

## 16. SUPABASE INTEGRATION

### Client-side (src/utils/supabase/client.ts):
```typescript
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
```

### Server-side (src/utils/supabase/server.ts):
```typescript
import { createServerClient } from "@supabase/ssr";
// Uses cookies() for SSR authentication
```

### Usage:
1. **Image Upload**: Items and physical items upload images to Supabase Storage
2. **Realtime**: POS Kasir subscribes to `auction_items` table changes via Supabase Realtime channels to detect concurrent sales

---

## 17. NPM SCRIPTS

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "db:migrate": "prisma migrate dev",
  "db:reset": "prisma migrate reset"
}
```

---

## 18. DEPENDENCIES

### Production:
- `@prisma/client` ^6.9.0
- `@supabase/ssr` ^0.12.0, `@supabase/supabase-js` ^2.108.1
- `bcryptjs` ^3.0.3
- `browser-image-compression` ^2.0.2
- `date-fns` ^4.4.0
- `embla-carousel-react` ^8.6.0
- `exceljs` ^4.4.0
- `html5-qrcode` ^2.3.8
- `jose` ^6.2.3
- `lucide-react` ^1.17.0
- `next` ^15.3.3
- `qrcode.react` ^4.2.0
- `react` ^19.1.0, `react-dom` ^19.1.0
- `react-barcode` ^1.6.1
- `recharts` ^3.8.1

### Dev:
- `prisma` ^6.9.0
- `tailwindcss` ^4.1.0
- `typescript` ^5.8.3
- `tsx` ^4.19.0
- `eslint` ^9.0.0, `eslint-config-next` ^15.3.3

---

## 19. IMPORTANT NOTES FOR AI ASSISTANT

1. **Bahasa Indonesia**: All user-facing text, error messages, and UI labels are in Indonesian
2. **Branch hardcode**: Currently hardcoded to filter by "Pasuruan" branch in many places
3. **Base path `/lelang`**: All routes are prefixed. Fetch calls from client need this prefix (handled by monkey-patch in root layout)
4. **Large client components**: Some files are 30-60KB (ItemsTableClient, UnifiedGudangClient, KasirPOSClient) — these are all-in-one per feature
5. **Decimal handling**: Prisma uses `Decimal` type which requires `JSON.parse(JSON.stringify())` serialization for client components
6. **Supabase for storage only**: Auth is custom JWT, NOT Supabase Auth
7. **Thermal receipt printing**: POS checkout auto-triggers `window.print()` with 80mm thermal printer CSS
8. **No Supabase Auth**: Authentication is entirely custom using jose JWT + bcryptjs, stored in httpOnly cookies. Supabase is only used for storage and realtime.
