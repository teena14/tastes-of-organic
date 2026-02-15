import express from "express";
import productRoutes from "./routes/product.routes.js";
import cors from "cors";
import wishlistRoutes from "./routes/wishlist.routes.js";



const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);

export default app;
