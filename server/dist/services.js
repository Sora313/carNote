"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = exports.CarService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET ?? "carnote-development-secret";
class AuthService {
    users;
    constructor(users) {
        this.users = users;
    }
    token(id) { return jsonwebtoken_1.default.sign({ userId: id }, secret, { expiresIn: "7d" }); }
    async register(input) { if (await this.users.findByEmail(input.email))
        throw new Error("El email ya está registrado"); const user = await this.users.create({ name: input.name, email: input.email, passwordHash: await bcryptjs_1.default.hash(input.password, 10) }); return { token: this.token(user.id), user: { id: user.id, name: user.name, email: user.email } }; }
    async login(input) { const user = await this.users.findByEmail(input.email); if (!user?.passwordHash || !(await bcryptjs_1.default.compare(input.password, user.passwordHash)))
        throw new Error("Credenciales inválidas"); return { token: this.token(user.id), user: { id: user.id, name: user.name, email: user.email } }; }
    async google(input) { const user = await this.users.upsertGoogle(input); return { token: this.token(user.id), user: { id: user.id, name: user.name, email: user.email } }; }
}
exports.AuthService = AuthService;
class CarService {
    cars;
    constructor(cars) {
        this.cars = cars;
    }
    list(ownerId) { return this.cars.list(ownerId); }
    create(ownerId, input) { return this.cars.create({ ...input, ownerId }); }
    update(id, ownerId, input) { return this.cars.update(id, ownerId, input); }
    remove(id, ownerId) { return this.cars.remove(id, ownerId); }
}
exports.CarService = CarService;
class ExpenseService {
    expenses;
    constructor(expenses) {
        this.expenses = expenses;
    }
    list(ownerId) { return this.expenses.list(ownerId); }
    create(ownerId, input) { return this.expenses.create({ ...input, ownerId }); }
    update(id, ownerId, input) { return this.expenses.update(id, ownerId, input); }
    remove(id, ownerId) { return this.expenses.remove(id, ownerId); }
}
exports.ExpenseService = ExpenseService;
