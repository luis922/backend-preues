import { db } from "../db.connection";

export async function findUserbyName(name: string) {
  try {
    const user = await db.user.findUnique({
      where: {
        name: name,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    console.log(user);
  } catch (error) {
    console.log(error);
  }
}

//ensayo
export async function essayExist(nombre: string) {
  try {
    var essay = await db.predefined_essay.findUnique({
      where: { name: nombre },
    });
  } catch (error) {
    console.log({
      cod: 0, //para identificar fallo de la búsqueda
      msg: "Catch: No se pudo encontrar el ensayo: " + nombre,
      err: error,
    });
    return false;
  }

  if (essay) {
    return true;
  }
  return false;
}

export async function customEssayExist(nombre: string) {
  try {
    var essay = await db.essay_to_do.findUnique({
      where: { name: nombre },
    });
  } catch (error) {
    console.log({
      cod: 0, //para identificar fallo de la búsqueda
      msg: "Catch: No se pudo encontrar el ensayo: " + nombre,
      err: error,
    });
    return false;
  }

  if (essay) {
    return true;
  }
  return false;
}

async function existEssaytoDo(id: number) {
  try {
    var essay = await db.essay_to_do.findUnique({
      where: { id: id },
    });
  } catch (err) {
    console.log(
      "No se pudo realizar la búsqueda, el error fue el siguiente: " + err
    );
    return false;
  }
  if (essay) {
    return true;
  }
  return false;
}

async function existTOQ(id: number) {
  //exist type_of_question
  try {
    var essay = await db.type_of_question.findMany({
      where: { essayToDoId: id },
    });
  } catch (err) {
    console.log(
      "No se pudo realizar la búsqueda, el error fue el siguiente: " + err
    );
    return false;
  }
  /* console.log(essay);
  console.log(essay.length); */
  if (essay.length > 0) {
    return true;
  }
  return false;
}

export async function findAllTypeOfQuestionRelations(essayId: number) {
  if (await existTOQ(essayId)) {
    try {
      var relations = await db.type_of_question.findMany({
        where: { essayToDoId: essayId },
      });
      return relations;
    } catch (err) {
      return {
        msg: "No se encontró ninguna relación",
        error: err,
      };
    }
  } else {
    return "no existe relacion con la essay Id: " + essayId;
  }
}

async function testFunction() {
  console.log(await findAllTypeOfQuestionRelations(3));
}
/* testFunction(); */
