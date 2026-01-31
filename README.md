# FBASense - Smart Inventory App for Amazon Sellers

A modern web application that helps Amazon FBA/FBM sellers turn messy Excel/CSV files into clear inventory insights.

## 🎯 Features

- **Dashboard**: Real-time KPIs, charts, and inventory overview
- **Inventory Management**: Complete SKU tracking with search and filtering
- **Low Stock Alerts**: Automatic threshold-based warnings
- **Sales Analytics**: Date-range filtered sales reports with trends
- **Profit Analysis**: Cost vs revenue breakdown with margins
- **File Upload**: Drag-and-drop CSV/Excel import with validation
- **Export Center**: Download data as Excel or CSV
- **Settings**: Configurable thresholds and preferences

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and Yarn
- Supabase account (optional for demo mode)

### Installation

1. **Clone and install dependencies**:
```bash
cd /app/backend
yarn install

cd /app/frontend
yarn install
```

2. **Configure environment variables**:

**Backend** (`/app/backend/.env`):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CORS_ORIGINS=*
PORT=8001
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Set up Supabase database**:

- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and run the SQL from `/app/backend/migrations.sql`
- Enable Email/Password authentication in Authentication settings

4. **Start the application**:
```bash
# Backend (from /app/backend)
node server.js

# Frontend (from /app/frontend)
yarn start
```

## 🎭 Demo Mode

The app runs in **demo mode** if Supabase credentials are not configured:

- ✅ View all screens and sample data
- ✅ Navigate the full UI
- ❌ Upload/Save/Export disabled
- A banner will indicate demo mode is active

This allows you to explore the app before setting up Supabase.

## 📦 Supabase Setup Steps

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `fbasense` (or your choice)
   - Database Password: (generate strong password)
   - Region: (choose closest to you)
5. Wait 2-3 minutes for project setup

### 2. Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Run Database Migrations

1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents of `/app/backend/migrations.sql`
3. Paste and click **Run**
4. Verify tables created: `inventory`, `sales`, `uploads`, `settings`

### 4. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates (optional)

### 5. Update Environment Variables

**Local Development**:
- Update `/app/backend/.env` with your Supabase credentials
- Update `/app/frontend/.env` with your Supabase credentials
- Restart backend and frontend servers

**Vercel Deployment**:
1. Go to your Vercel project settings
2. Add environment variables:
   - `REACT_APP_BACKEND_URL`
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Redeploy

## 📤 File Upload Format

### Inventory CSV/XLSX

Required columns:
- `SKU` (text)
- `Product Name` (text)
- `Quantity` (number)
- `Cost` (number)
- `Price` (number)

Optional:
- `ASIN` (text)

Example:
```csv
SKU,ASIN,Product Name,Quantity,Cost,Price
AMZ-001,B08X6H9R2L,Premium Wireless Headphones,150,45.00,89.99
AMZ-002,B09Y3F2K8M,Smart Watch Pro,8,120.00,249.99
```

### Sales CSV/XLSX

Required columns:
- `SKU` (text)
- `Product Name` (text)
- `Date` (YYYY-MM-DD)
- `Quantity Sold` (number)
- `Revenue` (number)

Example:
```csv
SKU,Product Name,Date,Quantity Sold,Revenue
AMZ-001,Premium Wireless Headphones,2025-01-15,12,1079.88
AMZ-002,Smart Watch Pro,2025-01-14,5,1249.95
```

## 🛠️ Tech Stack

**Frontend**:
- React 19
- React Router v7
- Tailwind CSS
- Shadcn UI
- Recharts
- Papaparse & XLSX

**Backend**:
- Node.js
- Express
- Supabase (PostgreSQL)
- Multer (file uploads)

**Design System**:
- Fonts: Manrope (headings), Public Sans (body), JetBrains Mono (data)
- Colors: Deep Indigo primary, Signal Orange accent
- Theme: Swiss Logistics (clean & minimal)

## 📚 API Endpoints

All endpoints prefixed with `/api`:

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Inventory
- `GET /api/inventory` - List all items
- `POST /api/inventory` - Create items
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Sales
- `GET /api/sales` - List all sales
- `POST /api/sales` - Create sales records

### Uploads
- `GET /api/uploads` - Upload history
- `POST /api/upload` - Upload CSV/XLSX

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings

### System
- `GET /api/health` - Health check
- `GET /api/demo-status` - Check demo mode

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Per-user data isolation
- JWT-based authentication via Supabase
- CORS configured for production domains

## 🚦 Production Deployment

### Backend (Node.js)

**Option 1: Render/Railway/Fly.io**
1. Connect your Git repository
2. Set build command: `yarn install`
3. Set start command: `node server.js`
4. Add environment variables from `.env.example`

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
EXPOSE 8001
CMD ["node", "server.js"]
```

### Frontend (React)

**Vercel (Recommended)**:
1. Connect your Git repository
2. Set framework preset: Create React App
3. Root directory: `frontend`
4. Build command: `yarn build`
5. Output directory: `build`
6. Add environment variables

**Netlify**:
- Same steps as Vercel
- Add `_redirects` file: `/* /index.html 200`

## 👥 User Roles (V1)

V1 supports single-user accounts:
- Each user has isolated data
- No admin panel needed
- Ready for multi-tenant expansion

## 🚀 Roadmap (Post V1)

- [ ] Amazon API integration
- [ ] Automated inventory sync
- [ ] Multi-user teams
- [ ] Advanced forecasting
- [ ] Mobile app
- [ ] Retail shop support

## ❓ Troubleshooting

### "Supabase not configured" banner
- Check `.env` files have correct credentials
- Verify Supabase project is active
- Restart backend and frontend servers

### File upload fails
- Check file format (CSV or XLSX only)
- Verify required columns exist
- Check for empty rows or invalid data

### Cannot log in
- Verify Supabase Auth is enabled
- Check email/password in Supabase dashboard
- Try creating new account

### Data not showing
- Upload sample data via Upload page
- Check browser console for errors
- Verify API endpoints are accessible

## 📝 License

MIT License - feel free to use for your business!

## 🚀 Support

For issues or questions:
1. Check this README
2. Review Supabase setup steps
3. Check browser console for errors

---

**Built for Amazon sellers who want clarity over complexity.**
