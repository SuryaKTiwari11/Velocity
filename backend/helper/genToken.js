import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

configDotenv();
export const genToken = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

