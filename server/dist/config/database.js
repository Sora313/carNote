"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.isDatabaseReady = isDatabaseReady;
const mongoose_1 = __importDefault(require("mongoose"));
const defaultMongoUri = "mongodb://127.0.0.1:27017/carnote";
async function connectDatabase(uri = process.env.MONGODB_URI ?? defaultMongoUri) {
    await mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });
}
function isDatabaseReady() {
    return mongoose_1.default.connection.readyState === 1;
}
