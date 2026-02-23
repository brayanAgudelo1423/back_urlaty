import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4001;
const PRODUCTS_PATH = join(__dirname, "data", "products.json");
const ALIADA_JOYERIA_PATH = join(__dirname, "data", "aliada-joyeria.json");
const ALIADA_GALLERIES_PATH = join(__dirname, "data", "aliada-galleries.json");
const UPLOADS_DIR = join(__dirname, "uploads");

const GALLERY_SECTIONS = ["cadena_cadenas", "cadena_dijes", "pulsera_balineria", "pulsera_herrajes", "pulsera_dijes"];

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "urlaty2025";

if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = (file.originalname && file.originalname.split(".").pop()) || "jpg";
    cb(null, `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function readProducts() {
  if (!existsSync(PRODUCTS_PATH)) return [];
  return JSON.parse(readFileSync(PRODUCTS_PATH, "utf-8"));
}

function writeProducts(products) {
  writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
}

function readAliadaJoyeria() {
  if (!existsSync(ALIADA_JOYERIA_PATH)) return [];
  return JSON.parse(readFileSync(ALIADA_JOYERIA_PATH, "utf-8"));
}

function writeAliadaJoyeria(products) {
  writeFileSync(ALIADA_JOYERIA_PATH, JSON.stringify(products, null, 2), "utf-8");
}

function readGalleries() {
  if (!existsSync(ALIADA_GALLERIES_PATH)) {
    return { cadena_cadenas: [], cadena_dijes: [], pulsera_balineria: [], pulsera_herrajes: [], pulsera_dijes: [] };
  }
  return JSON.parse(readFileSync(ALIADA_GALLERIES_PATH, "utf-8"));
}

function writeGalleries(obj) {
  writeFileSync(ALIADA_GALLERIES_PATH, JSON.stringify(obj, null, 2), "utf-8");
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }
  const token = authHeader.slice(7);
  const validToken = process.env.ADMIN_TOKEN || "urlaty-admin-token-default";
  if (token !== validToken) {
    return res.status(401).json({ error: "Token inválido" });
  }
  next();
}

function getBaseUrl(req) {
  const host = req.get("host") || `localhost:${PORT}`;
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${host}`;
}

// POST /api/upload — subir foto (admin). Devuelve { url }
app.post("/api/upload", authMiddleware, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Error subiendo archivo" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }
    const base = getBaseUrl(req);
    const url = `${base}/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    const token = process.env.ADMIN_TOKEN || "urlaty-admin-token-default";
    return res.json({ token });
  }
  res.status(401).json({ error: "Usuario o contraseña incorrectos" });
});

// GET /api/products
app.get("/api/products", (req, res) => {
  res.json(readProducts());
});

// PUT /api/products/:id
app.put("/api/products/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { description, image, price, name } = req.body;
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });
  if (description !== undefined) products[index].description = String(description);
  if (image !== undefined) products[index].image = String(image);
  if (price !== undefined) products[index].price = Number(price);
  if (name !== undefined) products[index].name = String(name).trim();
  writeProducts(products);
  res.json(products[index]);
});

// GET /api/aliada-joyeria/products
app.get("/api/aliada-joyeria/products", (req, res) => {
  res.json(readAliadaJoyeria());
});

const TIPOS = ["cadenas", "pulseras", "combos", "topos-aretes", "otros"];

// PUT /api/aliada-joyeria/products/:id
app.put("/api/aliada-joyeria/products/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { description, image, price, name, category, tipo } = req.body;
  const products = readAliadaJoyeria();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });
  if (description !== undefined) products[index].description = String(description);
  if (image !== undefined) products[index].image = String(image);
  if (price !== undefined) products[index].price = Number(price);
  if (name !== undefined) products[index].name = String(name).trim();
  if (category !== undefined && (category === "oro" || category === "plata")) products[index].category = category;
  if (tipo !== undefined && TIPOS.includes(String(tipo))) products[index].tipo = String(tipo);
  writeAliadaJoyeria(products);
  res.json(products[index]);
});

// GET /api/aliada-joyeria/galleries — todas las secciones (Personaliza cadena + Personaliza pulsera)
app.get("/api/aliada-joyeria/galleries", (req, res) => {
  res.json(readGalleries());
});

// PUT /api/aliada-joyeria/galleries/:section/:id — actualizar producto de una galería
app.put("/api/aliada-joyeria/galleries/:section/:id", authMiddleware, (req, res) => {
  const section = req.params.section;
  const id = Number(req.params.id);
  if (!GALLERY_SECTIONS.includes(section)) {
    return res.status(400).json({ error: "Sección no válida" });
  }
  const galleries = readGalleries();
  const list = galleries[section];
  if (!Array.isArray(list)) return res.status(404).json({ error: "Sección no encontrada" });
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });
  const { description, image, price, name } = req.body;
  if (name !== undefined) list[index].name = String(name).trim();
  if (description !== undefined) list[index].description = String(description);
  if (image !== undefined) list[index].image = String(image);
  if (price !== undefined) list[index].price = Number(price);
  writeGalleries(galleries);
  res.json(list[index]);
});

app.listen(PORT, () => {
  console.log("Back Urlaty escuchando en http://localhost:" + PORT);
});
