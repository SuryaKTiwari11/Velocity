import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

configDotenv();
export const genToken = (userID, res) => {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
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
