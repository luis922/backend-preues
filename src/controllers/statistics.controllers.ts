import { db } from "../db.connection";
import * as find from "../lib/find";
import * as update from "../lib/updates";
import { Request, Response } from "express";
import * as gen from "../lib/general";

export const getScores = async (req: Request, res: Response) => {
  try {
    const token = req.header("authorization");
    if (!token) {
      return res.status(401).json({ msg: "Acces denied", success: 0 });
    } //verifica que token exista
    const userId = gen.getIdfromToken(token);
    console.log("token OK");

    const essayName = req.query.name as string;
    console.log(essayName);
    const essays = await db.essay_to_do.findMany({
      where: { name: essayName, AND: { userId: userId } },
      select: {
        id: true,
        createdAt: true,
        score: true,
      },
    });
    return res.status(200).json(essays);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Couldn't obtain the scores", error: err, succes: 0 });
  }
};
