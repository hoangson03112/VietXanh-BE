import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import blogRoutes from "./routes/blogRoutes";
import productRoutes from "./routes/productRoutes";
import contactRoutes from "./routes/contactRoutes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);

// Error handler
app.use(errorHandler);

export default app;
