import { delUserByID, delUserByName } from "../lib/deletes";
import { Request, Response } from "express";
import { db } from "../db.connection";
import transporter from "../emailer";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const recoverPassword = async (req: Request, res: Response) => {
  //Asigna una nueva contraseña random al usuario y se la envía por email
  //Verificar que correo exista
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
  try {
    const email = await transporter.sendMail({
      from: '"PreuesApp" <preuesapp@gmail.com>', // sender address '"Fred Foo 👻" <foo@example.com>'
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
    return res.status(200).json({ msg: "email sent succesfully" });
  } catch (err) {
    return res.status(500).json({
      msg: "Couldn't send the email",
      error: err,
    });
  }
};
