import express from "express";
import productRoutes from "./routes/product.routes.js";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);app.use(express.json());
// 🔑 THIS LINE MUST EXIST
app.use("/api/products", productRoutes);

export default app;
