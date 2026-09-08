"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const services_js_1 = require("./services.js");
const repositories_js_1 = require("./repositories.js");
const database_js_1 = require("./config/database.js");
const router = express_1.default.Router();
const authService = new services_js_1.AuthService(new repositories_js_1.UserRepository());
const carService = new services_js_1.CarService(new repositories_js_1.CarRepository());
const expenseService = new services_js_1.ExpenseService(new repositories_js_1.ExpenseRepository());
const secret = process.env.JWT_SECRET ?? "carnote-development-secret";
function auth(request, response, next) { const token = request.headers.authorization?.replace("Bearer ", ""); if (!token)
    return response.status(401).json({ message: "Token requerido" }); try {
    request.userId = jsonwebtoken_1.default.verify(token, secret).userId;
    next();
}
catch {
    return response.status(401).json({ message: "Token inválido" });
} }
function handleError(response, cause) { return response.status(400).json({ message: cause instanceof Error ? cause.message : "Solicitud inválida" }); }
router.get("/health", (_request, response) => response.json({ status: (0, database_js_1.isDatabaseReady)() ? "ok" : "degraded", database: (0, database_js_1.isDatabaseReady)() ? "connected" : "disconnected", service: "carnote-api" }));
router.post("/auth/register", async (request, response) => { try {
    return response.status(201).json(await authService.register(request.body));
}
catch (cause) {
    return handleError(response, cause);
} });
router.post("/auth/login", async (request, response) => { try {
    return response.json(await authService.login(request.body));
}
catch (cause) {
    return response.status(401).json({ message: cause instanceof Error ? cause.message : "Credenciales inválidas" });
} });
router.post("/auth/google", async (request, response) => { try {
    return response.json(await authService.google(request.body));
}
catch (cause) {
    return handleError(response, cause);
} });
const users = new repositories_js_1.UserRepository();
router.get("/users", auth, async (_request, response) => response.json(await users.list()));
router.put("/users/:id", auth, async (request, response) => response.json(await users.update(String(request.params.id), request.body)));
router.delete("/users/:id", auth, async (request, response) => { await users.remove(String(request.params.id)); return response.status(204).send(); });
router.get("/cars", auth, async (request, response) => response.json(await carService.list(request.userId)));
router.post("/cars", auth, async (request, response) => response.status(201).json(await carService.create(request.userId, request.body)));
router.put("/cars/:id", auth, async (request, response) => response.json(await carService.update(String(request.params.id), request.userId, request.body)));
router.delete("/cars/:id", auth, async (request, response) => { await carService.remove(String(request.params.id), request.userId); return response.status(204).send(); });
router.get("/expenses", auth, async (request, response) => response.json(await expenseService.list(request.userId)));
router.post("/expenses", auth, async (request, response) => response.status(201).json(await expenseService.create(request.userId, request.body)));
router.put("/expenses/:id", auth, async (request, response) => response.json(await expenseService.update(String(request.params.id), request.userId, request.body)));
router.delete("/expenses/:id", auth, async (request, response) => { await expenseService.remove(String(request.params.id), request.userId); return response.status(204).send(); });
exports.default = router;
