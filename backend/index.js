import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import DB from "./library/db.js";
import employeeRoutes from "./routes/employee.routes.js";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/api/employees", employeeRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  DB();
});
