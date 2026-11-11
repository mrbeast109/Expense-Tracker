import express from "express";

import { getDashboardOverview } from "../controllers/dashboardController.js";
import authmiddleware from "../middleware/auth.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/",authmiddleware,getDashboardOverview);

export default dashboardRouter;