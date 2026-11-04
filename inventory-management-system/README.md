# Inventory Management System

A full-stack inventory dashboard built with React, Vite, Node.js and Express.

## Requirements
- Node.js 18+ (20+ recommended)
- npm

## Run locally

```bash
npm install
npm install --prefix client
npm install --prefix server
npm run dev
```

Open:
- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

The Express server stores products in `server/data/products.json`. The file is created automatically on first run. This is suitable for a local development/demo application; use a database such as PostgreSQL for a multi-user production deployment.

## API
- `GET /api/products` — list products (supports `search` and `category`)
- `GET /api/products/stats` — inventory statistics
- `POST /api/products` — create product
- `PUT /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product
- `PATCH /api/products/:id/quantity` — adjust stock by `+1` or `-1`

## Production build
```bash
npm run build
npm start
```
The API runs on port 5000. Configure a reverse proxy to serve the built frontend and route `/api` to the backend, or serve `client/dist` from your hosting platform.
