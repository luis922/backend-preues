import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const tokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Acces denied");

  const payload = jwt.verify(
    token,
    process.env.TOKEN_SECRET || "tokensreplacementincaseisundifined"
  );
  console.log(payload);

  next();
};
