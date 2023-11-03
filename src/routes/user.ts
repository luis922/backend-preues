import express from "express";
import * as user from "../controllers/user.controllers";
import { tokenValidation } from "../controllers/tokenValidation";

const router = express.Router();

router.post("/signup", user.signup);
router.post("/login", user.login);
router.post("/recoverPassword/", user.recoverPassword); //Recupera contraseña por correo
router.patch("/changePassword/", tokenValidation, user.changePassword); //Cambia contraseña desde el perfil de ususario
router.get("/coins/", tokenValidation, user.getCoins); ///Obtiene las monedas actuales del usuario

export default router;
