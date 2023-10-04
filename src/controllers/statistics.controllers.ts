import { db } from "../db.connection";
import * as find from "../lib/find";
import * as update from "../lib/updates";
import { Request, Response } from "express";
import * as gen from "../lib/general";

export const getScores = async (req: Request, res: Response) => {
  //Obtiene los puntajes y fechas de los ensayos realizados de un tema especifico
  //Entrada: name = nombre del tema / no para ensayos custom
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista
    const userId = gen.getIdfromToken(token);
    console.log("token OK");

    const essayName = req.query.name as string;

    var essays = await db.essay_to_do.findMany({
      where: { name: essayName, AND: [{ userId: userId }, { isCustom: 0 }] },
      select: {
        id: true,
        createdAt: true,
        score: true,
      },
    });

    return res.status(200).json(gen.formatGetScores(essays));
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Couldn't obtain the scores", error: err, succes: 0 });
  }
};

export const getAverageScores = async (req: Request, res: Response) => {
  /* Obtiene el promedio de puntajes de un tipo de ensayo no custom 
    Entrada: name = nombre del tema / no para ensayos custom*/
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista
    const userId = gen.getIdfromToken(token);
    console.log("token OK");

    const essayName = req.query.name as string;

    var essays = await db.essay_to_do.findMany({
      where: { name: essayName, AND: [{ userId: userId }, { isCustom: 0 }] },
      select: {
        id: true,
        score: true,
      },
    });

    return res
      .status(200)
      .json({ averageScore: gen.calculateAverageScore(essays) });
  } catch (err) {
    return res.status(500).json({
      msg: "An error has ocurred when trying to calculate average score",
      error: err,
      success: 0,
    });
  }
};

export const countTopicCorrectAnswers = async (req: Request, res: Response) => {
  /*obtiene número de preguntas respondidas correctamente de un tema
   Entrada: name = nombre del tema / no para ensayos custom*/
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista
    const userId = gen.getIdfromToken(token);
    console.log("token OK");

    const essayName = req.query.name as string;

    var essays = await db.essay_to_do.findMany({
      where: { name: essayName, AND: [{ userId: userId }, { isCustom: 0 }] },
      select: {
        id: true,
        score: true,
        numberOfQuestions: true,
      },
    });

    return res.status(200).json(gen.countCorrectAnswers(essays));
  } catch (err) {
    return res.status(500).json({
      msg: "An error has ocurred when trying to count the correct answer of a topic",
      error: err,
      success: 0,
    });
  }
};

export const countAllCorrectAnswers = async (req: Request, res: Response) => {
  /*obtiene número de preguntas respondidas correctamente en ensayos no custom
Entrada: no tiene*/
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista
    const userId = gen.getIdfromToken(token);
    console.log("token OK");

    var essays = await db.essay_to_do.findMany({
      where: { userId: userId, AND: { isCustom: 0 } },
      select: {
        id: true,
        score: true,
        numberOfQuestions: true,
      },
    });

    return res.status(200).json(gen.countCorrectAnswers(essays));
  } catch (err) {
    return res.status(500).json({
      msg: "An error has ocurred when trying to count all the correct answers of no custom essays",
      error: err,
      success: 0,
    });
  }
};
