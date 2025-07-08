import express from "express";
import {
  getData,
  getUsersByCity,
  getStats,
  getCities,
} from "../controller/map.controller.js";

const router = express.Router();

router.get("/data", getData);
router.get("/users-by-city", getUsersByCity);
router.get("/stats", getStats);
router.get("/cities", getCities);

export default router;
