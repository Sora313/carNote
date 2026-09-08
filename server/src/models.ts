import { Schema, model, type HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<{ name: string; email: string; passwordHash?: string; googleId?: string }>;
export type CarDocument = HydratedDocument<{ name: string; plate: string; model: string; ownerId: string }>;
export type ExpenseDocument = HydratedDocument<{ name: string; type: string; amount: number; frequency: string; carId: string; ownerId: string; date: Date; status: "Pagado" | "Pendiente" }>;

export const UserModel = model("User", new Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, passwordHash: String, googleId: String }, { timestamps: true }));
export const CarModel = model("Car", new Schema({ name: { type: String, required: true }, plate: { type: String, required: true, uppercase: true }, model: { type: String, required: true }, ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true } }, { timestamps: true }));
export const ExpenseModel = model("Expense", new Schema({ name: { type: String, required: true }, type: { type: String, required: true }, amount: { type: Number, required: true, min: 0 }, frequency: { type: String, enum: ["Una vez", "Semanal", "Mensual", "Anual", "Cada 6 meses"], required: true }, carId: { type: Schema.Types.ObjectId, ref: "Car", required: true }, ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, date: { type: Date, default: Date.now }, status: { type: String, enum: ["Pagado", "Pendiente"], default: "Pendiente" } }, { timestamps: true }));
