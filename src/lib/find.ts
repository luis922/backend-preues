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
    var essay = await db.essay.findUnique({
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

findUserbyName("user3");
