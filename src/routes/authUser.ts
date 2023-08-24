import express from "express";
import * as user from "../controllers/authUser.controllers";

const router = express.Router();

router.post("/signup", user.signup);
router.post("/login", user.login);

export default router;
