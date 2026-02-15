import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const users = [
  {
    name: "Teena",
    email: "teena@test.com",
    password: "123456",
    phone: "9876543210"
  }
];

await User.deleteMany();
await User.insertMany(users);

console.log("Users seeded");
process.exit();