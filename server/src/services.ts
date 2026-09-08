import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CarRepository, ExpenseRepository, UserRepository } from "./repositories.js";

const secret = process.env.JWT_SECRET ?? "carnote-development-secret";
export class AuthService {
  constructor(private readonly users: UserRepository) {}
  private token(id: string) { return jwt.sign({ userId: id }, secret, { expiresIn: "7d" }); }
  async register(input: { name: string; email: string; password: string }) { if (await this.users.findByEmail(input.email)) throw new Error("El email ya está registrado"); const user = await this.users.create({ name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 10) }); return { token: this.token(user.id), user: { id: user.id, name: user.name, email: user.email } }; }
  async login(input: { email: string; password: string }) { const user = await this.users.findByEmail(input.email); if (!user?.passwordHash || !(await bcrypt.compare(input.password, user.passwordHash))) throw new Error("Credenciales inválidas"); return { token: this.token(user.id), user: { id: user.id, name: user.name, email: user.email } }; }
  async google(input: { googleId: string; name: string; email: string }) { const user = await this.users.upsertGoogle(input); return { token: this.token(user.id), user: { id: user.id, name: user.name, email: user.email } }; }
}
export class CarService { constructor(private readonly cars: CarRepository) {} list(ownerId: string) { return this.cars.list(ownerId); } create(ownerId: string, input: Record<string, unknown>) { return this.cars.create({ ...input, ownerId }); } update(id: string, ownerId: string, input: Record<string, unknown>) { return this.cars.update(id, ownerId, input); } remove(id: string, ownerId: string) { return this.cars.remove(id, ownerId); } }
export class ExpenseService { constructor(private readonly expenses: ExpenseRepository) {} list(ownerId: string) { return this.expenses.list(ownerId); } create(ownerId: string, input: Record<string, unknown>) { return this.expenses.create({ ...input, ownerId }); } update(id: string, ownerId: string, input: Record<string, unknown>) { return this.expenses.update(id, ownerId, input); } remove(id: string, ownerId: string) { return this.expenses.remove(id, ownerId); } }
