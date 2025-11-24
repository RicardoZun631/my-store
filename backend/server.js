import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(
  express.json({
    limit: "10mb", // allow base64 images
  })
);

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper to handle async route errors
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// -------- ROUTES --------

// GET /products - all products
app.get(
  "/products",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      "SELECT id, name, price, description, category, TO_BASE64(image) AS image FROM products"
    );
    res.json(rows);
  })
);

// GET /products/:id - single product
app.get(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, name, price, description, category, TO_BASE64(image) AS image FROM products WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  })
);

// POST /products - create product
app.post(
  "/products",
  asyncHandler(async (req, res) => {
    const { name, price, description, category, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    let imageBuffer = null;
    if (image) {
      // image is expected to be a base64 string (no data: prefix)
      try {
        imageBuffer = Buffer.from(image, "base64");
      } catch (err) {
        console.error("Error decoding base64 image:", err.message);
      }
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)",
      [name, price, description || "", category || "", imageBuffer]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query(
      "SELECT id, name, price, description, category, TO_BASE64(image) AS image FROM products WHERE id = ?",
      [insertedId]
    );

    res.status(201).json(rows[0]);
  })
);

// PUT /products/:id - update product
app.put(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, image } = req.body;

    // Check if exists
    const [existing] = await pool.query(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageBuffer = null;
    if (image) {
      try {
        imageBuffer = Buffer.from(image, "base64");
      } catch (err) {
        console.error("Error decoding base64 image:", err.message);
      }
    }

    await pool.query(
      `
      UPDATE products 
      SET name = ?, price = ?, description = ?, category = ?, 
          image = COALESCE(?, image)
      WHERE id = ?
    `,
      [name, price, description || "", category || "", imageBuffer, id]
    );

    const [rows] = await pool.query(
      "SELECT id, name, price, description, category, TO_BASE64(image) AS image FROM products WHERE id = ?",
      [id]
    );
    res.json(rows[0]);
  })
);

// DELETE /products/:id - delete product
app.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted" });
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("API error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
