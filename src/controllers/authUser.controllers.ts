import { db } from "../db.connection";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { createToken } from "../lib/general";

export const signup = async (req: Request, res: Response) => {
  {
    try {
      const newUser = await db.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, 10), //hashing password
        },
      });

      return res.status(201).json({
        msg: "User created",
        id: newUser.id,
        name: newUser.name,
        token: createToken(newUser.id, newUser.name),
        success: 1,
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Couldn't create user",
        err: error,
        success: 0,
      });
    }
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
          //incluir img perfil
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
            token: createToken(user.id, user.name),
            success: 1,
            coins: user.coins
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
