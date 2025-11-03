import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { connectDB } from "./config/db";
import app from "./app";

const PORT = Number(process.env.PORT) || 4000;

if (!process.env.MONGODB_URI) {
  console.error("❌ Thiếu MONGODB_URI trong file .env");
  process.exit(1);
}

async function start(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Lỗi khi kết nối DB:", err);
    process.exit(1);
  }
}

void start();
