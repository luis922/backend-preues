import express from "express";
import * as essay from "../controllers/essays.controllers";

const router = express.Router();
//aqui se genera un null al correr el servidor
router.get("/essayQuestions", essay.findEssayQuestions); //obtiene todas las preguntas de un ensayo
router.get("/allQuestions", essay.findAllEssaysQuestions); //obtiene todas las preguntas de todos los ensayos

export default router;
