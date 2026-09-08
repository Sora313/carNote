import { CarModel, ExpenseModel, UserModel } from "./models.js";

export class UserRepository {
  findByEmail(email: string) { return UserModel.findOne({ email }); }
  findById(id: string) { return UserModel.findById(id); }
  create(data: Record<string, unknown>) { return UserModel.create(data); }
  upsertGoogle(data: { email: string; name: string; googleId: string }) { return UserModel.findOneAndUpdate({ email: data.email }, { $set: data }, { new: true, upsert: true, returnDocument: "after" }); }
  list() { return UserModel.find().select("-passwordHash"); }
  update(id: string, data: Record<string, unknown>) { return UserModel.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash"); }
  remove(id: string) { return UserModel.findByIdAndDelete(id); }
}

export class CarRepository {
  list(ownerId: string) { return CarModel.find({ ownerId }); }
  create(data: Record<string, unknown>) { return CarModel.create(data); }
  update(id: string, ownerId: string, data: Record<string, unknown>) { return CarModel.findOneAndUpdate({ _id: id, ownerId }, data, { new: true }); }
  remove(id: string, ownerId: string) { return CarModel.findOneAndDelete({ _id: id, ownerId }); }
}

export class ExpenseRepository {
  list(ownerId: string) { return ExpenseModel.find({ ownerId }).populate("carId"); }
  create(data: Record<string, unknown>) { return ExpenseModel.create(data); }
  update(id: string, ownerId: string, data: Record<string, unknown>) { return ExpenseModel.findOneAndUpdate({ _id: id, ownerId }, data, { new: true }); }
  remove(id: string, ownerId: string) { return ExpenseModel.findOneAndDelete({ _id: id, ownerId }); }
}
