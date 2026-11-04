import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../data");
const dataFile = path.join(dataDir, "products.json");

const seed = [
  { id: "P101", name: "MacBook Air M2", category: "Electronics", price: 89900, quantity: 7 },
  { id: "P102", name: "Everyday Cotton Tee", category: "Clothing", price: 799, quantity: 3 },
  { id: "P103", name: "Hardcover Notebook", category: "Other", price: 249, quantity: 0 },
  { id: "P104", name: "Wireless Headphones", category: "Electronics", price: 5499, quantity: 12 },
  { id: "P105", name: "Organic Coffee Beans", category: "Food", price: 650, quantity: 4 }
];

export async function readProducts() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid inventory data.");
    return parsed;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeProducts(seed);
    return structuredClone(seed);
  }
}

export async function writeProducts(products) {
  await fs.mkdir(dataDir, { recursive: true });
  const temporary = `${dataFile}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(products, null, 2), "utf8");
  await fs.rename(temporary, dataFile);
}
