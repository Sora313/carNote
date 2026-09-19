import cors from "cors";
import express from "express";
import { ensureDatabaseConnection } from "./config/database.js";
import routes from "./routes.js";

const app = express();
const allowedOrigins = new Set([
  "http://localhost:3000",
  "https://car-note.vercel.app",
  "https://car-note-git-main-shiro-project.vercel.app",
]);
if (process.env.FRONTEND_URL) {
  for (const origin of process.env.FRONTEND_URL.split(",")) allowedOrigins.add(origin.trim());
}
app.use(cors({ origin: [...allowedOrigins] }));
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
