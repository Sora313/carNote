import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database.js";
import routes from "./routes.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());
app.use("/api", routes);
connectDatabase().then(() => app.listen(port, () => console.log(`CarNote API running on http://localhost:${port}`))).catch((error) => { console.error("Could not connect to MongoDB. Set MONGODB_URI in server/.env and make sure MongoDB is running.", error); process.exit(1); });
