import express from "express";
import { registerCompany } from "../controller/company.controller.js";
const router = express.Router();
router.post("/register", registerCompany);
export default router;