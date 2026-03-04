import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const plainPassword = "123456";
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(plainPassword, salt);

const users = [
  {
    name: "Teena",
    email: "teena@test.com",
    password: hashedPassword,
    phone: "9876543210"
  }
];

await User.deleteMany();
await User.insertMany(users);

console.log("Users seeded");
process.exit();