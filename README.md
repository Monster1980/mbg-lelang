# PT MBG — Katalog Barang Lelang & Bekas

Platform katalog O2O (Online-to-Offline) untuk PT MBG. Pengguna dapat melihat barang bekas dan lelang secara online, lalu membeli langsung di toko fisik.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: PostgreSQL
- **ORM**: [Prisma 6](https://www.prisma.io/)
- **Language**: TypeScript 5

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and configure your database URL
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Generate Prisma Client
npx prisma generate

# 4. Push schema to database (development)
npx prisma db push

# 5. Seed the database with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:migrate` | Run database migrations |

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema (models, enums)
│   └── seed.ts             # Database seed data
├── src/
│   ├── app/
│   │   ├── globals.css     # Global styles & Tailwind theme
│   │   ├── layout.tsx      # Root layout (SEO, fonts)
│   │   └── page.tsx        # Landing page
│   └── lib/
│       └── prisma.ts       # Prisma client singleton
├── .env.example            # Environment template
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS / Tailwind plugin
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

## Database Schema

### Enums
- **Grade**: `A` | `B` | `C` — Item condition grade
- **Status**: `Tersedia` | `Dipesan` | `Terjual` — Availability status

### Models
- **AuctionItem** — Catalog items with SKU, images, pricing, grading, and WhatsApp contact
- **SalesTransaction** — Cashier-logged sales records linked to auction items

## License

Private — PT MBG Internal Use
