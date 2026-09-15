import cors from "cors";
import express from "express";
import { ensureDatabaseConnection } from "./config/database.js";
import routes from "./routes.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());
app.use(async (_request, response, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    console.error("No se pudo conectar a MongoDB", error);
    response.status(503).json({ message: "Base de datos no disponible" });
  }
});
app.use("/api", routes);

export default app;
