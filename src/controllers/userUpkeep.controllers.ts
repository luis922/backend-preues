import { delUserByID, delUserByName } from "../lib/deletes";
import { Request, Response } from "express";
import * as gen from "../lib/general";
import { db } from "../db.connection";
import transporter from "../emailer";
import crypto from "crypto";
import bcrypt from "bcrypt";
import * as find from "../lib/find";

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
        " \n Parece que has olvidado tu contraseña de acceso a PreuesApp, es por esto que se te ha asignado la siguiente clave de acceso para que puedas incicar sesión: " +
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
      return res
        .status(200)
        .json({ msg: "Password changed successfully", success: 1 });
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
