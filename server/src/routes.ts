import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { AuthService, CarService, ExpenseService } from "./services.js";
import { UserRepository, CarRepository, ExpenseRepository } from "./repositories.js";
import { isDatabaseReady } from "./config/database.js";

const router = express.Router();
const authService = new AuthService(new UserRepository());
const carService = new CarService(new CarRepository());
const expenseService = new ExpenseService(new ExpenseRepository());
const secret = process.env.JWT_SECRET ?? "carnote-development-secret";
type AuthRequest = Request & { userId?: string };
function auth(request: AuthRequest, response: Response, next: NextFunction) { const token = request.headers.authorization?.replace("Bearer ", ""); if (!token) return response.status(401).json({ message: "Token requerido" }); try { request.userId = (jwt.verify(token, secret) as { userId: string }).userId; next(); } catch { return response.status(401).json({ message: "Token inválido" }); } }
function handleError(response: Response, cause: unknown) { return response.status(400).json({ message: cause instanceof Error ? cause.message : "Solicitud inválida" }); }
router.get("/health", (_request, response) => response.json({ status: isDatabaseReady() ? "ok" : "degraded", database: isDatabaseReady() ? "connected" : "disconnected", service: "carnote-api" }));
router.post("/auth/register", async (request, response) => { try { return response.status(201).json(await authService.register(request.body)); } catch (cause) { return handleError(response, cause); } });
router.post("/auth/login", async (request, response) => { try { return response.json(await authService.login(request.body)); } catch (cause) { return response.status(401).json({ message: cause instanceof Error ? cause.message : "Credenciales inválidas" }); } });
router.post("/auth/google", async (request, response) => { try { return response.json(await authService.google(request.body)); } catch (cause) { return handleError(response, cause); } });
const users = new UserRepository();
router.get("/users", auth, async (_request, response) => response.json(await users.list()));
router.put("/users/:id", auth, async (request, response) => response.json(await users.update(String(request.params.id), request.body)));
router.delete("/users/:id", auth, async (request, response) => { await users.remove(String(request.params.id)); return response.status(204).send(); });
router.get("/cars", auth, async (request: AuthRequest, response) => response.json(await carService.list(request.userId!)));
router.post("/cars", auth, async (request: AuthRequest, response) => response.status(201).json(await carService.create(request.userId!, request.body)));
router.put("/cars/:id", auth, async (request: AuthRequest, response) => response.json(await carService.update(String(request.params.id), request.userId!, request.body)));
router.delete("/cars/:id", auth, async (request: AuthRequest, response) => { await carService.remove(String(request.params.id), request.userId!); return response.status(204).send(); });
router.get("/expenses", auth, async (request: AuthRequest, response) => response.json(await expenseService.list(request.userId!)));
router.post("/expenses", auth, async (request: AuthRequest, response) => response.status(201).json(await expenseService.create(request.userId!, request.body)));
router.put("/expenses/:id", auth, async (request: AuthRequest, response) => response.json(await expenseService.update(String(request.params.id), request.userId!, request.body)));
router.delete("/expenses/:id", auth, async (request: AuthRequest, response) => { await expenseService.remove(String(request.params.id), request.userId!); return response.status(204).send(); });
export default router;
