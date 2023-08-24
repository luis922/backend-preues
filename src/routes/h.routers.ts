import express from "express";

export const homeRouter = express.Router();

homeRouter.get("/home", (req, res) => {
  res.send("HOMEPAGE/HISTORIAL/ETC");
});
