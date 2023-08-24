/* import { delUserByID, delUserByName } from "../lib/deletes";
import { Request, Response } from "express";

export const deleteUserByID = (req: Request, res: Response) => {
  return delUserByID(+req.body.id);
}; */

/* export const deleteUserByName = (req: Request, res: Response) => {
  if (!req.body.name)
    return res.status(400).json({ msg: "Name field not found", body: req.body });
  if(!)
  return res.status(200).json({
    msg: "User deleted succesfully",
    deleted: delUserByName(req.body.name),
  });
}; */
