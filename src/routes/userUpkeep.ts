import express from "express";
import * as userUpkeep from "../controllers/userUpkeep.controllers";
import { tokenValidation } from "../controllers/tokenValidation";

const upkRouter = express.Router();

/* upkRouter.delete("/delubyid", userUpkeep.deleteUserByID);
upkRouter.delete("/delubyname", userUpkeep.deleteUserByName); */
upkRouter.post("/recoverPassword/", userUpkeep.recoverPassword); //Recupera contraseña por correo
upkRouter.patch("/changePassword/", tokenValidation, userUpkeep.changePassword); //Cambia contraseña desde el perfil de ususario
upkRouter.get("/coins/", tokenValidation, userUpkeep.getCoins); ///Obtiene las monedas actuales del usuario
export default upkRouter;
