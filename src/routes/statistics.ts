import express from "express";
import * as stats from "../controllers/statistics.controllers";
import { tokenValidation } from "../controllers/tokenValidation";

const router = express.Router();

router.get("/scores/", tokenValidation, stats.getScores); //obtiene todos los puntajes de un tipo de ensayo no custom

export default router;
