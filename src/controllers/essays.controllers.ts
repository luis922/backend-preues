import { db } from "../db.connection";
import { essayExist } from "../lib/find";
import { Request, Response } from "express";

export const findEssayQuestions = async (req: Request, res: Response) => {
  //obtiene todas las preguntas de un ensayo
  if (await essayExist(req.body.name)) {
    try {
      var ensayo = await db.predefined_essay.findUnique({
        where: { name: req.body.name },
        select: {
          id: true,
          name: true,
          type: true,
          questions: {
            select: {
              id: true,
              subject: true,
              question: true,
              videoLink: true,
              answers: {
                select: {
                  id: true,
                  label: true,
                  isCorrect: true,
                },
              },
            },
          },
        },
      });
    } catch (err) {
      return res.status(404).json({
        msg: "No se pudo realizar la búsqueda, verifique el mensaje de error",
        error: err,
      });
    }

    return res.status(200).json(ensayo);
  }
  return res.status(404).json("Este ensayo no existe: " + req.body.name);
};

export const findAllEssaysQuestions = async (req: Request, res: Response) => {
  //obtiene todas las preguntas de todos los ensayos
  try {
    var ensayos = await db.predefined_essay.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        questions: {
          select: {
            id: true,
            subject: true,
            question: true,
            videoLink: true,
            answers: {
              select: {
                id: true,
                label: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    return res.status(404).json({
      msg: "No se pudo realizar la búsqueda, verifique el mensaje de error",
      error: err,
    });
  }

  return res.status(200).json(ensayos);
};
