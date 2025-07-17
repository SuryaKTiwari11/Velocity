import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();
const key = process.env.JWT_SECRET;

export const genToken = (userID, companyCode, companyId, res) => {
  const token = jwt.sign({ userID, companyCode, companyId }, key, {
    expiresIn: "1d",
  });
  if (res)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  return token;
};
