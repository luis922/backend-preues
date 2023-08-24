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
      });
    } catch (error) {
      return res.status(500).json({
        msg: "Couldn't create user",
        err: error,
      });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  {
    try {
      const user = await db.user.findUnique({
        where: {
          name: req.body.name,
        },
        select: {
          id: true,
          name: true,
          password: true,
        },
      });

      if (user == null) {
        return res.status(404).json({ msg: "User not found" });
      } else {
        if (await bcrypt.compare(req.body.password, user.password)) {
          //Comparación de contraseñas
          return res.status(200).json({
            msg: "Succes, sesion started",
            id: user.id,
            name: user.name,
            token: createToken(user.id, user.name),
          });
        } else {
          return res.status(500).json({ msg: "Wrong password" });
        }
      }
    } catch (error: any) {
      return res.status(500).json(error);
    }
  }
};
