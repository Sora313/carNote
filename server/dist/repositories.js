"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRepository = exports.CarRepository = exports.UserRepository = void 0;
const models_js_1 = require("./models.js");
class UserRepository {
    findByEmail(email) { return models_js_1.UserModel.findOne({ email }); }
    findById(id) { return models_js_1.UserModel.findById(id); }
    create(data) { return models_js_1.UserModel.create(data); }
    upsertGoogle(data) { return models_js_1.UserModel.findOneAndUpdate({ email: data.email }, { $set: data }, { new: true, upsert: true, returnDocument: "after" }); }
    list() { return models_js_1.UserModel.find().select("-passwordHash"); }
    update(id, data) { return models_js_1.UserModel.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash"); }
    remove(id) { return models_js_1.UserModel.findByIdAndDelete(id); }
}
exports.UserRepository = UserRepository;
class CarRepository {
    list(ownerId) { return models_js_1.CarModel.find({ ownerId }); }
    create(data) { return models_js_1.CarModel.create(data); }
    update(id, ownerId, data) { return models_js_1.CarModel.findOneAndUpdate({ _id: id, ownerId }, data, { new: true }); }
    remove(id, ownerId) { return models_js_1.CarModel.findOneAndDelete({ _id: id, ownerId }); }
}
exports.CarRepository = CarRepository;
class ExpenseRepository {
    list(ownerId) { return models_js_1.ExpenseModel.find({ ownerId }).populate("carId"); }
    create(data) { return models_js_1.ExpenseModel.create(data); }
    update(id, ownerId, data) { return models_js_1.ExpenseModel.findOneAndUpdate({ _id: id, ownerId }, data, { new: true }); }
    remove(id, ownerId) { return models_js_1.ExpenseModel.findOneAndDelete({ _id: id, ownerId }); }
}
exports.ExpenseRepository = ExpenseRepository;
