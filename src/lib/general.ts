import jwt from "jsonwebtoken";
import { db } from "../db.connection";

export const createToken = (idu: number, nameu: string) => {
  return jwt.sign(
    { id: idu, name: nameu },
    process.env.TOKEN_SECRET || "tokensreplacementincaseTOKEN_SECRETisundifined"
  ); //{expiresin: "1h"} para que el token expire en 1 hora
};

export function getIdfromToken(token: string) {
  token = token.split(" ")[1]; // quita el bearer al token
  const payload = jwt.verify(
    token,
    process.env.TOKEN_SECRET || "tokensreplacementincaseisundifined"
  );

  return (<any>payload).id;
}

export function getRandomQuestionsIndex(
  numero: number,
  questionsLenght: number
) {
  //obtiene un numero de indices seleccionados de manera aleatoria y sin repetición para elegir preguntas
  let randomIndex = Math.floor(Math.random() * questionsLenght); //
  let indexArray: number[] = [];
  let index = 0;
  if (numero > questionsLenght) {
    console.log("Se esta solictando mas preguntas de las que existen");
    return indexArray;
  }

  while (index < numero) {
    if (!indexArray.includes(randomIndex)) {
      //si el indice rambom no se encuentra en el array
      indexArray.push(randomIndex); //se agrega al array
      index++;
    }
    randomIndex = Math.floor(Math.random() * questionsLenght); //selecciona un nuevo indice
  }
  return indexArray;
}

export function getRandomQuestions(numero: number, questions: Array<any>) {
  //obtiene un numero defindo por la variable "numero" de preguntas seleccionadas de manera aleatoria y sin repetición
  let indexArray: number[] = getRandomQuestionsIndex(numero, questions.length);
  let selectedQuestions: any[] = [];
  for (let index = 0; index < indexArray.length; index++) {
    selectedQuestions.push(questions[indexArray[index]]);
  }
  return selectedQuestions;
}

export async function countCorrectQuestions(essayId: number) {
  try {
    const respuestas = await db.chosen_answer.findMany({
      where: { essayToDoId: essayId },
      select: {
        answerId: true,
        answer: {
          select: {
            isCorrect: true,
          },
        },
      },
    });
    let isAnswerCorrect;
    let correctAnsers = 0;
    for (let i = 0; i < respuestas.length; i++) {
      isAnswerCorrect = respuestas[i].answer.isCorrect;
      if (isAnswerCorrect == 1) correctAnsers++;
    }

    return correctAnsers;
  } catch (err) {
    console.log("No se pudo contar las respuestas correctas");
    return -1;
  }
}

export function getFormatedTime(timeInSeconds: number) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor(
    (timeInSeconds / 3600 - Math.floor(timeInSeconds / 3600)) * 60
  );
  const seconds = Math.floor(
    ((timeInSeconds / 3600 - Math.floor(timeInSeconds / 3600)) * 60 - minutes) *
      60
  );

  let hora = hours.toString();
  let minutos = minutes.toString();
  let segundos = seconds.toString();

  if (hours < 10) hora = "0" + hora;
  if (minutes < 10) minutos = "0" + minutos;
  if (seconds < 10) segundos = "0" + segundos;

  /* if (hours == 0 && minutes == 0) return segundos + "s";
  if (hours == 0) return minutos + ":" + segundos; */
  return hora + ":" + minutos + ":" + segundos;
}

export async function formatSubmittedEssay(submittedEssay: any) {
  type answer = {
    id: number;
    label: string;
    isCorrect: number;
  };

  type question = {
    id: number;
    subject: string;
    question: string;
    videoLink: string;
    answers: answer[];
  };

  type essay = {
    id: number;
    name: string;
    selectedTime: string;
    totalTime: string;
    numberOfQuestions: number;
    createdAt: number;
    score: number;
    isCustom: number;
    numCorrectAnswers: number;
    coins: number;
    questions: question[];
    chosenAnswers: answer[];
  };

  let numCorrectAnswers = await countCorrectQuestions(submittedEssay.id);
  let ensayo: essay = {
    id: submittedEssay.id,
    name: submittedEssay.name,
    selectedTime: getFormatedTime(submittedEssay.selectedTime),
    totalTime: getFormatedTime(submittedEssay.totalTime),
    numberOfQuestions: submittedEssay.numberOfQuestions,
    createdAt: submittedEssay.createdAt,
    score: submittedEssay.score,
    isCustom: submittedEssay.isCustom,
    numCorrectAnswers: numCorrectAnswers,
    coins: numCorrectAnswers,
    questions: [],
    chosenAnswers: [],
  };
  //agrega las preguntas y sus alternativas al arreglo questions
  for (let i = 0; i < submittedEssay.questions.length; i++) {
    ensayo.questions?.push(submittedEssay.questions[i].selectedQuestion);
  }
  //agrega las respuespuestas escogidas al arreglo chosenAnswers
  for (let i = 0; i < submittedEssay.chosenAnswers.length; i++) {
    ensayo.chosenAnswers?.push(submittedEssay.chosenAnswers[i].answer);
  }
  return ensayo;
}

export function validateEssayName(
  essayName: string,
  reservedChars: Array<string>
) {
  //valida que el nombre no contenga los caracteres "(",")"
  for (var character of reservedChars) {
    let isInName = essayName.includes(character);
    if (isInName) {
      return true;
    }
  }
  return false;
}

export async function countCustomEssays(userId: number) {
  //Cuenta ensayos custom no borrados logicamente y que no son hijos de un ensayo original

  try {
    const customEssays = await db.essay_to_do.findMany({
      where: {
        userId: userId,
        AND: [{ isCustom: 1 }, { fatherEssay: 0 }, { isDeleted: 0 }],
      },
      select: { id: true, name: true },
    });
    return customEssays.length;
  } catch (err) {
    console.log("No se pudo contar ensayos customs, error: " + err);
    return -1;
  }
}

export function createCopyCustomEssayName(name: string, lastRecordedName: any) {
  //Crea un nuevo nombre para la copia del ensayo custom en base al nombre original

  if (lastRecordedName == null) return name + " (1)"; //Si es la primera copia de ensayo custom
  const index1 = lastRecordedName.indexOf("(");
  const index2 = lastRecordedName.indexOf(")");
  const number = lastRecordedName.substring(index1 + 1, index2);
  const newCount = +number + 1;
  const newName = name + " (" + newCount + ")";

  return newName;
}

export function getFormatedDate(essayDate: Date) {
  try {
    const formatedDate: string =
      ("0" + essayDate.getDate()).slice(-2) +
      "/" +
      ("0" + (essayDate.getMonth() + 1)).slice(-2) +
      "/" +
      essayDate.getFullYear();

    return formatedDate;
  } catch (err) {
    console.log(err);
    return "error ocurred in getFormatedDate function";
  }
}

export function formatGetScores(essayInfo: any) {
  type scores = {
    id: number;
    createdAt: string;
    score: number;
  };
  try {
    const formatedScores: scores[] = [];
    for (var info of essayInfo) {
      let score: scores = {
        id: info.id,
        createdAt: getFormatedDate(info.createdAt),
        score: info.score,
      };
      formatedScores.push(score);
    }
    return formatedScores;
  } catch (err) {
    return ["Couldn't format the info, error: " + err];
  }
}

export function calculateAverageScore(scores: any) {
  try {
    var averageScore = 0;
    for (var info of scores) {
      averageScore += info.score;
    }
    averageScore /= scores.length;
    return averageScore;
  } catch (err) {
    "Couldn't calculate average score, error: " + err;
    return -1;
  }
}

export function countCorrectAnswers(essaysInfo: any) {
  try {
    let totalCorrectAnswers: number = 0;
    let totalAnswers: number = 0;
    for (var info of essaysInfo) {
      totalCorrectAnswers += info.score;
      totalAnswers += info.numberOfQuestions;
    }

    return {
      questionsAnswered: totalAnswers,
      correctAnswers: totalCorrectAnswers / 10,
    };
  } catch (err) {
    console.log("Couln't count anwers, erro " + err);
    return -1;
  }
}

async function testFunction() {
  console.log(createCopyCustomEssayName("custom 1", "custom 1 (199)"));
}

/* testFunction(); */
