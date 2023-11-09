import { db } from "../db.connection";
import { Request, Response } from "express";
import * as gen from "../lib/general";
import * as find from "../lib/find";
import transporter from "../emailer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { getFullPaths } from "../lib/general";

export const signup = async (req: Request, res: Response) => {
  let avatarDir: string[] = getFullPaths([{ imgDir: "/img/avatars/avatar 3.jpg" }]);
  console.log(avatarDir);
  console.log("av 0 " + avatarDir[0]);
  try {
    const newUser = await db.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10), //hashing password
        dirAvatar: avatarDir[0],
      },
    });

    return res.status(201).json({
      msg: "User created",
      id: newUser.id,
      name: newUser.name,
      token: gen.createToken(newUser.id, newUser.name),
      success: 1,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Couldn't create user",
      err: error,
      success: 0,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  {
    try {
      const user = await db.user.findUnique({
        where: {
          email: req.body.email,
        },
        select: {
          id: true,
          name: true,
          password: true,
          email: true,
          coins: true,
          dirAvatar: true,
        },
      });

      if (user == null) {
        return res.status(404).json({ msg: "User not found", success: 0 });
      } else {
        if (await bcrypt.compare(req.body.password, user.password)) {
          //Comparación de contraseñas
          return res.status(200).json({
            msg: "Succes, sesion started",
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.dirAvatar,
            coins: user.coins,
            token: gen.createToken(user.id, user.name),
            success: 1,
          });
        } else {
          return res.status(500).json({ msg: "Wrong password", success: 0 });
        }
      }
    } catch (err) {
      return res.status(500).json({
        msg: "An error has ocurred, see error message. ",
        error: err,
        success: 0,
      });
    }
  }
};

export const recoverPassword = async (req: Request, res: Response) => {
  //Asigna una nueva contraseña random al usuario y se la envía por email
  //Verificar que correo exista

  try {
    const existEmail = await find.existEmail(req.body.email);
    if (!existEmail) {
      return res.status(404).json({
        msg: "Email: " + req.body.email + " doesn't exist",
        success: 0,
      });
    }

    const user = await db.user.findUnique({
      where: { email: req.body.email },
      select: {
        name: true,
        email: true,
      },
    });
    console.log(user);
    const newPassword = crypto.randomBytes(4).toString("hex");
    var changePassword = await db.user.update({
      where: { email: req.body.email },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    });

    console.log("newPassword: " + newPassword);

    const email = await transporter.sendMail({
      from: '"PreUesApp" <preuesapp@gmail.com>', // sender address '"Fred Foo 👻" <foo@example.com>'
      to: user?.email, // list of receivers
      subject: "Recuperar Contraseña", // Subject line
      text:
        " Estimado/a " +
        user?.name +
        " \n Parece que has olvidado tu contraseña de acceso a PreUesApp, es por esto que se te ha asignado la siguiente clave para que puedas incicar sesión: " +
        newPassword +
        "\n Una vez iniciada la sesión, debes ir a tu perfil de usuario y seleccionar la opción 'Cambiar contraseña', para poder crear una nueva clave.", // plain text body
      /* html: '<p style="text-align:justify">Estimado/a user?.name</p>       ', // html body */
    });
    return res.status(202).json({ msg: "Email sent successfully", success: 1 });
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't send the email",
      error: err,
      success: 0,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  /* recibe old password y new password */
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).send("Acces denied");
    } //verifica que token exista
    const userId = gen.getIdfromToken(token);
    console.log("token OK");

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: true,
      },
    }); // Obtiene user password

    if (user == null) {
      return res.status(404).json({ msg: "User not found", succes: 0 });
    }
    if (await bcrypt.compare(req.body.oldPassword, user.password)) {
      //Comparación de contraseñas
      const updatePassword = await db.user.update({
        where: { id: userId },
        data: {
          password: await bcrypt.hash(req.body.newPassword, 10),
        },
      });
      return res.status(200).json({ msg: "Password changed successfully", success: 1 });
    } else {
      return res.status(400).json({ error: "Invalid password", success: 0 });
    }
  } catch (err) {
    return res.status(400).json({
      msg: "An error has ocurred, see error message. ",
      error: err,
      success: 0,
    });
  }
};

export const getCoins = async (req: Request, res: Response) => {
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista

    const userID = gen.getIdfromToken(token);
    console.log("token OK");

    const userCoins = await db.user.findUnique({
      where: { id: userID },
      select: {
        coins: true,
      },
    });
    return res.status(200).json(userCoins);
  } catch (err) {
    return res.status(500).json({ msg: "Could'nt retrieve data", error: err, success: 0 });
  }
};

export const getAvatars = async (req: Request, res: Response) => {
  try {
    const avatars = await db.avatar.findMany({
      select: {
        imgDir: true,
      },
    });

    return res.status(200).json(gen.getFullPaths(avatars));
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getCurrentAvatar = async (req: Request, res: Response) => {
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista

    const userID = gen.getIdfromToken(token);
    console.log("token OK");

    const userAvatar = await db.user.findUnique({
      where: { id: userID },
      select: {
        dirAvatar: true,
      },
    });
    return res.status(200).json(userAvatar);
  } catch (err) {
    return res.status(500).json({ msg: "Could'nt retrieve data", error: err, success: 0 });
  }
};

export const changeAvatar = async (req: Request, res: Response) => {
  try {
    const newAvatar = req.query.dirAvatar as string;
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista

    const userID = gen.getIdfromToken(token);
    console.log("token OK");

    const userAvatar = await db.user.update({
      where: { id: userID },
      data: {
        dirAvatar: newAvatar,
      },
    });
    return res.status(200).json(userAvatar);
  } catch (err) {
    return res.status(500).json({ msg: "Could'nt retrieve data", error: err, success: 0 });
  }
};
