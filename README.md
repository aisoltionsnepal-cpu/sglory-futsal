# S-Glory Futsal - Record Management System

## Deploy on Vercel (Free, No Credit Card)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project**
3. Import repo: `aisoltionsnepal-cpu/sglory-futsal`

### Step 2: Create Free Database (Supabase)
1. Go to [supabase.com](https://supabase.com) → Sign up free
2. Create new project → Note the **Connection string** (Transaction mode)
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

### Step 3: Add Environment Variable in Vercel
- `DATABASE_URL` = your Supabase connection string
- `JWT_SECRET` = any random string (e.g., `my-secret-key-123`)

### Step 4: Deploy
Vercel auto-deploys on push.

## Default Login
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sales | sales123 |

## Tech Stack
- Frontend: React + Tailwind CSS
- Backend: Vercel Serverless Functions (Node.js)
- Database: PostgreSQL (Supabase Free)
- Auth: JWT
