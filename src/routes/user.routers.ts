import express from "express"; //servidor base de datos
import type { Request, Response } from "express";
import { db } from "../db.connection"; //conexión a base de datos
import bcrypt from "bcrypt"; //encryptar datos
import jwt from "jsonwebtoken";

export const userRouter = express.Router();

userRouter.get("/", async (req: Request, res: Response) => {
  try {
    const User = await db.user.findMany();
    console.log(User);
    return res.json(User);
  } catch (error) {
    return res.json(error);
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const newUser = await db.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10), //hashing password
      },
    });

    const token: string = jwt.sign(
      newUser.name,
      process.env.TOKEN_SECRET || "tokensreplacementincaseisundifined"
    );

    return res.header("auth-token", token).status(201).json(newUser); //no enviar password
  } catch (error) {
    return res.status(500).json({
      msg: "Couldn't create user",
      err: error,
    });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: {
        name: req.body.name,
      },
      select: {
        //indica los campos que se desean obtener
        name: true,
        password: true,
      },
    });
    if (user == null) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    } else {
      if (await bcrypt.compare(req.body.password, user.password)) {
        //validando contraseña
        //TOKEN
        const token: string = jwt.sign(
          user.name,
          process.env.TOKEN_SECRET || "tokensreplacementincaseisundifined"
        );

        return res
          .header("auth-token", token)
          .status(200)
          .json({ msg: "Succes" }); //id, name, y status ok
      } else {
        return res.status(500).json({ msg: "Failure" });
      }
    }
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json(error);
  }
});

//Change user name
userRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const upd = await db.user.update({
    where: {
      id: +id,
    },
    data: {
      name: req.body.name,
    },
  });
  return res.json(upd);
});

userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const upd = await db.user.update({
    where: {
      id: +id,
    },
    data: {
      name: req.body.name,
    },
  });
  return res.json(upd);
});

//Change user email
userRouter.patch("/email/:id", async (req, res) => {
  const upd = await db.user.update({
    where: {
      id: +req.params.id,
    },
    data: {
      email: req.body.email,
    },
  });
  return res.json(upd);
});

userRouter.put("/:id", async (req, res) => {
  const upd = await db.user.update({
    where: {
      id: +req.params.id,
    },
    data: {
      email: req.body.email,
    },
  });
  return res.json(upd);
});

//Change user password
userRouter.patch("/:id", async (req, res) => {
  const upd = await db.user.update({
    where: {
      id: +req.params.id,
    },
    data: {
      password: req.body.password,
    },
  });
  return res.json(upd);
});

userRouter.put("/:id", async (req, res) => {
  const upd = await db.user.update({
    where: {
      id: +req.params.id,
    },
    data: {
      password: req.body.password,
    },
  });
  return res.json(upd);
});

userRouter.delete("/:idu", async (req, res) => {
  try {
    const user = await db.user.delete({
      where: {
        id: +req.params.idu,
      },
    });
    return res.status(200).json(user);
  } catch (err: any) {
    return res.status(500).json({
      msg: "No se pudo borrar usuario",
      error: err,
    });
  }
});

/* userRouter.get("/", (req, res) => {
  res.send("Funciona");
}); */
