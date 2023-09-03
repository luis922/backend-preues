import { db } from "../db.connection";
import { essayExist, customEssayExist, existEssaytoDo } from "../lib/find";
import { Request, Response } from "express";
import { getIdfromToken } from "../lib/general";

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

export const createEssay = async (req: Request, res: Response) => {
  var newEssay;
  var relations;
  //definir bien el tema de los nombres
  if (!(await customEssayExist(req.body.name))) {
    try {
      newEssay = await db.essay_to_do.create({
        data: {
          name: req.body.name,
          userId: +req.body.userId,
          isCustom: +req.body.isCustom,
          numberOfQuestions: +req.body.numberOfQuestions,
        },
      });
      relations = await createTypeOfQuestionRelations(
        req.body.essayIDS,
        newEssay.id
      );
      return res
        .status(200)
        .json({ newEssay: newEssay, newRelations: relations });
    } catch (err) {
      return res.status(500).json({
        msg: "Couldn't create the new essay",
        error: err,
      });
    }
  } else {
    return res.status(500).json({
      msg: "Couldn't create the new essay because name already exist",
    });
  }
};

async function createTypeOfQuestionRelations(
  predefinedEssayIDS: Array<string>,
  newEssayID: number
) {
  var newRelation;
  try {
    for (var i = 0; i < predefinedEssayIDS.length; i++) {
      newRelation = await db.type_of_question.create({
        data: {
          essayToDoId: newEssayID,
          predifinedEssayId: +predefinedEssayIDS[i],
        },
      });
    }

    const resultado = await db.type_of_question.findMany({
      where: { essayToDoId: newEssayID },
    });
    return resultado;
  } catch (err) {
    return { msg: "Couldn't create relation", error: err };
  }
}

async function createTypeOfQuestionRelation(
  predifinedEssayId: string,
  newEssayID: number
) {
  //programar verificacion de si predefined essay exist
  try {
    var newRelation = await db.type_of_question.create({
      data: {
        essayToDoId: newEssayID,
        predifinedEssayId: +predifinedEssayId,
      },
    });
  } catch (err) {
    return { msg: "Couldn't create relation", error: err };
  }

  return newRelation;
}

export const submitAnswers = async (req: Request, res: Response) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Acces denied");
  const userID = getIdfromToken(token);
  console.log("token OK");
  if (!existEssaytoDo(+req.body.essayId))
    return res.status(404).send("Essay doesn't exist");
  console.log("essay ID OK");

  try {
    var subAnswer;
    for (let i = 0; i < req.body.answersIDS.length; i++) {
      subAnswer = await db.chosen_answer.create({
        data: {
          userId: +userID,
          answerId: +req.body.answersIDS[i],
          essayToDoId: +req.body.essayId,
          essayTime: req.body.essayTime,
        },
      });
      console.log("indice i: " + i);
      console.log({
        userId: +userID,
        answerId: +req.body.answersIDS[i],
        essayToDoId: +req.body.essayId,
        essayTime: req.body.essayTime,
      });
    }
    const resultado = await db.chosen_answer.findMany({
      where: {
        AND: [{ essayToDoId: +req.body.essayId }, { userId: +userID }],
      },
    });
    return res.status(200).json(resultado);
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't submit answer",
      error: err,
    });
  }
};

/* async function testFunction() {
  console.log(await createTypeOfQuestionRelations(["1", "2", "3"], 26));
} */
/* testFunction(); */
