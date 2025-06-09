import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();
 const DB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to db");
  } catch (error) {
    console.error("error", error);
  }
};

export default DB;