import express from "express";
import * as userUpkeep from "../controllers/userUpkeep.controllers";

const upkRouter = express.Router();

/* upkRouter.delete("/delubyid", userUpkeep.deleteUserByID);
upkRouter.delete("/delubyname", userUpkeep.deleteUserByName); */
upkRouter.post("/recoverPassword", userUpkeep.recoverPassword);
export default upkRouter;
