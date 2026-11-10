import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getIncome, addIncome, updateIncome, downloadIncome, getIncomeOverView, deleteIncome } from "../controllers/incomeController.js";

const incomeRouter = express.Router();

incomeRouter.post("/add", authMiddleware, addIncome);
incomeRouter.get("/get",authMiddleware, getIncome);
incomeRouter.put("/update/:id",authMiddleware,updateIncome);
incomeRouter.get("/downloadexcel",authMiddleware,downloadIncome);

incomeRouter.delete("/delete/:id",authMiddleware,deleteIncome);
incomeRouter.get("/overview",authMiddleware,getIncomeOverView);

export default incomeRouter;  