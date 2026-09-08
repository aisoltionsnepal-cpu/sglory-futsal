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
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens)

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sales | sales123 |

## Deployment

### Render (Recommended)

1. Push this repo to GitHub
2. Create a MongoDB Atlas cluster and get connection string
3. Connect your GitHub repo to Render
4. Set environment variable `MONGODB_URI` with your MongoDB connection string
5. Deploy both services (backend + frontend)

### Local Development

```bash
# Install dependencies
npm run install:all

# Set up MongoDB connection in backend/.env

# Seed database with default data
npm run seed

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sglory-futsal
JWT_SECRET=your_secret_key
```
