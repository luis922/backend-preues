import jwt from "jsonwebtoken";

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
  console.log(payload);
  return (<any>payload).id;
}

export function getRandomQuestionsIndex(
  numero: number,
  questionsLenght: number
) {
  //obtiene un numero de indices seleccionados de manera aleatoria y sin repetición
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
async function testFunction() {
  console.log(getRandomQuestions(10, [1, 2, 3, 4, 5, 6]));
}

/* testFunction(); */
