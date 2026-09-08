"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const database_js_1 = require("./config/database.js");
const routes_js_1 = __importDefault(require("./routes.js"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express_1.default.json());
app.use("/api", routes_js_1.default);
(0, database_js_1.connectDatabase)().then(() => app.listen(port, () => console.log(`CarNote API running on http://localhost:${port}`))).catch((error) => { console.error("Could not connect to MongoDB. Set MONGODB_URI in server/.env and make sure MongoDB is running.", error); process.exit(1); });
