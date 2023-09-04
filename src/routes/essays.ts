import express from "express";
import * as essay from "../controllers/essays.controllers";
import { tokenValidation } from "../controllers/tokenValidation";

const router = express.Router();
//aqui se genera un null al correr el servidor
router.get("/essayQuestions", essay.findEssayQuestions); //obtiene todas las preguntas de un ensayo
router.get("/allQuestions", essay.findAllEssaysQuestions); //obtiene todas las preguntas de todos los ensayos
router.post("/newEssay", tokenValidation, essay.createEssay);
router.post("/submitAnswers", tokenValidation, essay.submitAnswers);
router.get("/submittedEssay", tokenValidation, essay.getSubmittedEssay);
router.get("/history", tokenValidation, essay.getHistory);

export default router;
