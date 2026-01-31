# Supabase Database Setup Instructions

## Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/neffazfirvrhttvupwec
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Migration SQL

Copy the ENTIRE contents of `/app/backend/migrations.sql` and paste it into the SQL Editor, then click **Run**.

This will create:
- ✅ `inventory` table (SKU, ASIN, product name, quantity, cost, price, status)
- ✅ `sales` table (SKU, product name, date, quantity sold, revenue)
- ✅ `uploads` table (filename, upload date, rows processed, status)
- ✅ `settings` table (low stock threshold, currency)
- ✅ Row Level Security (RLS) policies for per-user data isolation
- ✅ Indexes for performance
- ✅ Triggers for updated_at columns

## Step 3: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is **Enabled**
3. (Optional) Configure email templates under **Email Templates**

## Step 4: Verify Tables Created

After running the migration:
1. Go to **Table Editor** in Supabase dashboard
2. You should see 4 tables: `inventory`, `sales`, `uploads`, `settings`
3. Each table should have RLS enabled (green shield icon)

## Step 5: Test Connection

Once tables are created, return here and type "Tables created" so I can:
1. Restart the backend with Supabase integration
2. Test authentication and data operations
3. Verify the demo mode banner is removed
4. Run comprehensive end-to-end tests

## Quick Verification Command

After creating tables, you can verify by running this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('inventory', 'sales', 'uploads', 'settings');
```

This should return 4 rows with your table names.

---

**Current Status:**
- ✅ Backend configured with Supabase URL and anon key
- ✅ Frontend configured with Supabase credentials
- ⏳ Waiting for database tables to be created
- ⏳ Authentication setup pending verification
