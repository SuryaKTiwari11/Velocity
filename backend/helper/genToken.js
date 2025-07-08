import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
const key = process.env.JWT_SECRET;

configDotenv();
export const genToken = (userID, companyCode, companyId, res) => {
  const token = jwt.sign(
    { userID, companyCode, companyId },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  if (res)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

  return token;
};

export const genInviteToken = (userID, companyCode, companyId) => {
  return jwt.sign({ userID, companyCode, companyId }, key, {
    expiresIn: "1d",
  });
};
