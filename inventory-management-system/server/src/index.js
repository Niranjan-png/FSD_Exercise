import express from "express";
import cors from "cors";
import { readProducts, writeProducts } from "./store.js";

const app = express();
const PORT = process.env.PORT || 5000;
const categories = ["Electronics", "Clothing", "Food", "Other"];

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function validateProduct(body) {
  const product = {
    id: String(body.id ?? "").trim(),
    name: String(body.name ?? "").trim(),
    category: String(body.category ?? ""),
    price: Number(body.price),
    quantity: Number(body.quantity)
  };

  if (!product.id || product.id.length > 40) return "Product ID is required (max 40 characters).";
  if (!product.name || product.name.length > 100) return "Product name is required (max 100 characters).";
  if (!categories.includes(product.category)) return "Choose a valid category.";
  if (!Number.isFinite(product.price) || product.price < 0) return "Price must be a valid non-negative number.";
  if (!Number.isInteger(product.quantity) || product.quantity < 0) return "Quantity must be a whole number of zero or more.";
  return product;
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/products", asyncRoute(async (req, res) => {
  const products = await readProducts();
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const category = String(req.query.category ?? "all");
  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search) || product.id.toLowerCase().includes(search);
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });
  res.json(filtered);
}));

app.get("/api/products/stats", asyncRoute(async (_req, res) => {
  const products = await readProducts();
  res.json({
    totalProducts: products.length,
    totalValue: products.reduce((sum, product) => sum + product.price * product.quantity, 0),
    lowStock: products.filter((product) => product.quantity > 0 && product.quantity < 5).length,
    outOfStock: products.filter((product) => product.quantity === 0).length
  });
}));

app.post("/api/products", asyncRoute(async (req, res) => {
  const candidate = validateProduct(req.body);
  if (typeof candidate === "string") return res.status(400).json({ message: candidate });
  const products = await readProducts();
  if (products.some((product) => product.id.toLowerCase() === candidate.id.toLowerCase())) {
    return res.status(409).json({ message: "That product ID is already in use." });
  }
  products.push(candidate);
  await writeProducts(products);
  res.status(201).json(candidate);
}));

app.put("/api/products/:id", asyncRoute(async (req, res) => {
  const candidate = validateProduct(req.body);
  if (typeof candidate === "string") return res.status(400).json({ message: candidate });
  const products = await readProducts();
  const index = products.findIndex((product) => product.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Product not found." });
  if (products.some((product) => product.id.toLowerCase() === candidate.id.toLowerCase() && product.id !== req.params.id)) {
    return res.status(409).json({ message: "That product ID is already in use." });
  }
  products[index] = candidate;
  await writeProducts(products);
  res.json(candidate);
}));

app.delete("/api/products/:id", asyncRoute(async (req, res) => {
  const products = await readProducts();
  const next = products.filter((product) => product.id !== req.params.id);
  if (next.length === products.length) return res.status(404).json({ message: "Product not found." });
  await writeProducts(next);
  res.status(204).end();
}));

app.patch("/api/products/:id/quantity", asyncRoute(async (req, res) => {
  const change = Number(req.body.change);
  if (![1, -1].includes(change)) return res.status(400).json({ message: "Quantity change must be +1 or -1." });
  const products = await readProducts();
  const product = products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  if (product.quantity + change < 0) return res.status(400).json({ message: "Stock cannot be negative." });
  product.quantity += change;
  await writeProducts(products);
  res.json(product);
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(PORT, () => console.log(`Inventory API running at http://localhost:${PORT}`));
