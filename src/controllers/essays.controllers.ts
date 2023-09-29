import { db } from "../db.connection";
import * as find from "../lib/find";
import * as update from "../lib/updates";
import { Request, Response } from "express";
import * as gen from "../lib/general";

export const findEssayQuestions = async (req: Request, res: Response) => {
  //obtiene todas las preguntas de un ensayo
  const essayName = req.query.name as string; //type of topic of the question
  if (await find.essayExist(essayName)) {
    try {
      var ensayo = await db.predefined_essay.findUnique({
        where: { name: essayName },
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
        success: 0,
      });
    }

    return res.status(200).json(ensayo);
  }
  return res
    .status(404)
    .json({ msg: "Este ensayo no existe: " + essayName, success: 0 });
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
      success: 0,
    });
  }

  return res.status(200).json(ensayos);
};

export const createEssay = async (req: Request, res: Response) => {
  //crea un nuevo ensayo que puede ser o no custom
  var newEssay;
  var relations;
  //----------get user id---------------------
  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({ msg: "Acces denied", success: 0 });
  } //verifica que token exista

  const userID = gen.getIdfromToken(token);
  console.log("token OK");
  //------------------------------------------

  if (+req.body.isCustom == 1) {
    //Crear limite de ensayos custom
    if (await find.isNameRepeated(req.body.name, +userID)) {
      return res.status(500).json({
        msg: "Name of essay already chosen by the user",
        repeated: true,
        success: 0,
      });
    }
  }

  try {
    newEssay = await db.essay_to_do.create({
      data: {
        name: req.body.name,
        userId: +req.body.userId,
        isCustom: +req.body.isCustom,
        numberOfQuestions: +req.body.numberOfQuestions,
        selectedTime: +req.body.durationTime,
      },
    });
    relations = await createTypeOfQuestionRelations(
      req.body.essayIDS,
      newEssay.id
    );
    if (+req.body.isCustom == 0) {
      return res
        .status(200)
        .json({ newEssay: newEssay, newRelations: relations });
    } else {
      const questions = await asignQuestionsToCustomEssay(
        newEssay.id,
        req.body.essayIDS,
        +req.body.numberOfQuestions
      );
      return res.status(200).json({
        newEssay: newEssay,
        questions: questions,
        newRelations: relations,
      });
    }

    //sino retorna
    //llamado a funcion crear relacion preguntas ensayo custom se le envia ID ensayo y essaysID
    /* return res
      .status(200)
      .json({ newEssay: newEssay, newRelations: relations, essayQuestions: funcion de realacion });  */
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't create the new essay",
      error: err,
      success: 0,
    });
  }
  /* } else {
    return res.status(500).json({
      msg: "Couldn't create the new essay because name already exist",
    });
  } */
};

async function asignQuestionsToCustomEssay(
  essayId: number,
  predefinedEssayIDS: Array<string>,
  numberOfQuestions: number
) {
  /*Crea relacion ensayo preguntas en tabla intermedia custom_essay_questions */
  try {
    let questions: any[] = [];
    let newRelation;
    for (let index = 0; index < predefinedEssayIDS.length; index++) {
      //recorre los id de los tipos de preguntas
      questions = await find.getPredefinedEssayQuestions(
        +predefinedEssayIDS[index]
      ); //obtiene todas las preguntas de un tipo
      if (questions.length == 0)
        return { msg: "Un error ha ocurrido al obtener las preguntas" };
      questions = gen.getRandomQuestions(
        numberOfQuestions / predefinedEssayIDS.length,
        questions[0].questions
      );
      //Obtiene un numero determinado de preguntas random
      //Division es entre numeros multiplos, resultado nunca debiese ser con decimales
      for (let index = 0; index < questions.length; index++) {
        newRelation = await db.custom_essay_question.create({
          data: {
            essayToDoId: essayId,
            questionId: questions[index].id,
          },
        });
      }
    }

    const resultado = await db.custom_essay_question.findMany({
      where: { essayToDoId: essayId },
      select: {
        selectedQuestion: {
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
    return resultado;
  } catch (err) {
    console.log("No se pudo crear la relación ensayo pregunta, error: " + err);
    return { msg: "No se pudo crear la relación ensayo pregunta", error: err };
  }
}

async function createTypeOfQuestionRelations(
  predefinedEssayIDS: Array<string>,
  newEssayID: number
) {
  //crea relacion entre la tabla essayToDo y predefined_essay
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

/* async function createTypeOfQuestionRelation(
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
} */

async function createCustomEssayQuestionRelation(
  answersIDS: Array<string>,
  essayId: number
) {
  let questionId;
  //Verifica que la respuesta exista al igual que la pregunta a la que pertenece
  for (let j = 0; j < answersIDS.length; j++) {
    if (await find.existAnswer(+answersIDS[j])) {
      questionId = await find.getQuestionIdFromAnswerId(+answersIDS[j]);
      if (questionId == -1) {
        return "Couldn't find the question to which the answer belongs";
      }
      const essayQuestion = await db.custom_essay_question.create({
        data: {
          essayToDoId: essayId,
          questionId: questionId,
        },
      });
    } else {
      return {
        msg: "Couldn't find answer with id: " + answersIDS[j],
        success: false,
      };
    }
  }
  return await db.custom_essay_question.findMany({
    where: { essayToDoId: essayId },
  });
}

export const submitAnswers = async (req: Request, res: Response) => {
  //Almacena las respuestas escogidas por el usuario
  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({ msg: "Acces denied", success: 0 });
  } //verifica que token exista

  const userID = gen.getIdfromToken(token);
  console.log("token OK");

  let existEssay = await find.existEssaytoDo(+req.body.essayId);
  if (!existEssay) {
    return res.status(404).json({
      msg: "Essay id: " + +req.body.essayId + " doesn't exist",
      success: 0,
    });
  } //verifica que ensayo exista
  console.log("essay ID OK");
  var relations;
  if (+req.body.isCustom == 0) {
    relations = await createCustomEssayQuestionRelation(
      //crea relación entre essaytoDo y question si es ensayo prefefinido
      req.body.answersIDS,
      +req.body.essayId
    );
  }

  var updatedTime = await update.updateEssayCompletionTime(
    //update essayTime
    +req.body.essayTime,
    +req.body.essayId
  );
  try {
    var subAnswer;
    for (let i = 0; i < req.body.answersIDS.length; i++) {
      subAnswer = await db.chosen_answer.create({
        data: {
          userId: +userID,
          answerId: +req.body.answersIDS[i],
          essayToDoId: +req.body.essayId,
        },
      });
    }
    const resultado = await db.chosen_answer.findMany({
      where: {
        AND: [{ essayToDoId: +req.body.essayId }, { userId: +userID }],
      },
    });

    let numCorrectAnswers = await gen.countCorrectQuestions(+req.body.essayId);
    await update.updateUserCoins(userID, numCorrectAnswers);
    await update.updateEssayScore(+req.body.essayId, numCorrectAnswers);

    if (+req.body.isCustom == 0) {
      return res.status(200).json({
        answers: resultado,
        QuestionEssayRelations: relations,
        essay: updatedTime,
      });
    } else {
      return res.status(200).json({
        answers: resultado,
        essay: updatedTime,
      });
    }
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't submit answer",
      error: err,
      success: 0,
    });
  }
};

export const getSubmittedEssay = async (req: Request, res: Response) => {
  //Obtiene todas las preguntas y respuestas del ensayo, mas información sobre este
  const essayId = req.query.id as string;
  try {
    const submittedEssay = await find.getSubmittedEssay(+essayId);
    if (submittedEssay == 0) {
      return res
        .status(404)
        .json({ msg: "Couldn't find the essay id: " + essayId, success: 0 });
    } //Indica si hubo problemas al buscar el ensayo

    const formatedEssay = await gen.formatSubmittedEssay(submittedEssay);

    return res.status(200).json(formatedEssay);
  } catch (err) {
    return res.status(404).json({
      msg: "Couldn't find the essay",
      error: err,
      success: 0,
    });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  //Obtiene todos los ensayos realizados por el usuario

  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({ msg: "Acces denied", success: 0 });
  } //verifica que token exista
  const userId = gen.getIdfromToken(token);
  console.log("token OK");

  /* const history = await db.chosen_answer.groupBy({
      by: "essayToDoId",
      where: { userId: +userId },
    }); */
  try {
    var history: any[] = [];
    //obtiene los id de los ensayos respondidos por el usuario
    const essaysDone = await db.chosen_answer.groupBy({
      by: "essayToDoId",
      where: { userId: +userId },
    });
    //obtiene la info los ensayos respondidos por el usuario en base a los id de la variable history
    for (let index = 0; index < essaysDone.length; index++) {
      history.push(
        await db.essay_to_do.findUnique({
          where: { id: essaysDone[index].essayToDoId },
          select: {
            id: true,
            name: true,
            score: true,
            createdAt: true,
            numberOfQuestions: true,
          },
        })
      );
    }

    return res.status(200).json({ historial: history });
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't retrieve history",
      error: err,
      success: 0,
    });
  }
};

export const getCustomEssays = async (req: Request, res: Response) => {
  //Obtiene todos los ensayos custom del usuario

  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({ msg: "Acces denied", success: 0 });
  } //verifica que token exista
  const userId = gen.getIdfromToken(token);
  console.log("token OK");

  try {
    const customEssays = await db.essay_to_do.findMany({
      where: { AND: [{ isCustom: 1 }, { userId: +userId }] },
      select: {
        id: true,
        name: true,
        selectedTime: true,
        numberOfQuestions: true,
        createdAt: true,
        isCustom: true,
      },
    });
    return res.status(200).json({ customEssays: customEssays });
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't retrieve custom essays",
      error: err,
      success: 0,
    });
  }
};

export const getCustomEssay = async (req: Request, res: Response) => {
  const essayId = req.query.essayId as string;

  if (!(await find.existEssaytoDo(+essayId))) {
    return res
      .status(404)
      .json({ msg: "Essay id: " + essayId + " doesn't exist", success: 0 });
  } //verifica que ensayo exista
  console.log("essay ID OK");

  try {
    const customEssay = await db.essay_to_do.findUnique({
      where: { id: +essayId },
      select: {
        id: true,
        name: true,
        selectedTime: true,
        numberOfQuestions: true,
        isCustom: true,
        questions: {
          select: {
            selectedQuestion: {
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
        },
      },
    });
    return res.status(200).json({ customEssay });
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't retrieve custom essay",
      error: err,
      success: 0,
    });
  }
};

export const physicalDeleteEssay = async (req: Request, res: Response) => {
  const essayId = req.query.essayId as string;

  if (!(await find.existEssaytoDo(+essayId))) {
    return res
      .status(404)
      .send({ msg: "Essay id: " + essayId + " doesn't exist", success: 0 });
  } //verifica que ensayo exista
  console.log("essay ID OK");

  try {
    const delEssay = await db.essay_to_do.delete({
      where: { id: +essayId },
    });
    return res.status(200).json({ deletedEssay: delEssay });
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't do a physical delete of custom essay id: " + essayId,
      error: err,
      success: 0,
    });
  }
};

/* async function testFunction() {
  console.log();
} */
/* testFunction(); */
