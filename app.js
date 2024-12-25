import express from "express";
import morgan from "morgan";
import { connectToMongo } from "./db.js";
import { config } from "dotenv";
import hotelRoutes from "./routes/hotel.js";
import authRoutes from "./routes/auth.js";
import guestRoutes from "./routes/guest.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8000;
await connectToMongo();

// middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/hotels", hotelRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/guest", guestRoutes);
app.use(express.static(path.join(__dirname, "./frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
