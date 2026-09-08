# S-Glory Futsal - Record Management System

A professional web application for managing futsal inventory and sales records.

## Features

- **Role-based Access**: Admin and Sales roles
- **Inventory Management**: Admin can add, edit, delete, and restock items
- **Sales Recording**: Sales staff can record transactions (no edit/delete)
- **Reports & Analytics**: Detailed sales insights with date filtering
- **Real-time Dashboard**: Overview of today's sales activity

## Items Tracked

| Item | Brand | Price/Piece | Pack Size |
|------|-------|-------------|-----------|
| Cigarette | Shikhar | Rs. 20 | 20 pcs |
| Cigarette | Surya | Rs. 25 | 20 pcs |
| Cigarette | Naulo | Rs. 12 | 20 pcs |
| Water | Regular | Rs. 25 | 12 pcs |
| Energy Drink | Xtreme | Rs. 150 | 24 pcs |
| Energy Drink | Redbull | Rs. 150 | 24 pcs |

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Render Free)
- **Auth**: JWT (JSON Web Tokens)

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sales | sales123 |

## Deployment on Render (100% Free)

### Step 1: Push to GitHub
Code is already pushed to your repo.

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New Blueprint** and connect your repo
3. Render will auto-detect `render.yaml` and create:
   - PostgreSQL database (free)
   - Backend API (free)
   - Frontend static site (free)
4. Click **Apply** to deploy

### Step 3: Done!
- Backend URL: `https://sglory-futsal-api.onrender.com`
- Frontend URL: `https://sglory-futsal-frontend.onrender.com`

The database auto-seeds with default users and inventory on first run.

## Local Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up PostgreSQL connection in backend/.env
# DATABASE_URL=postgresql://user:password@localhost:5432/sglory_futsal

# Start backend (auto-seeds database)
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/sglory_futsal
JWT_SECRET=your_secret_key
```
