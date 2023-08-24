import express from "express";
import { userRouter } from "./routes/user.routers";
import { homeRouter } from "./routes/h.routers";
import dotenv from "dotenv";
import { tokenValidation } from "./controllers/tokenValidation";
import authUser from "./routes/authUser";
import essays from "./routes/essays";
//import userUpkeep from "./routes/userUpkeep";

dotenv.config();
const app = express();
app.use(express.json());

app.use(authUser);
//app.use(userUpkeep);
/* app.use("/user", userRouter); */
app.use(essays); //genera null en consola
app.use("/", tokenValidation, homeRouter);

app.listen(3000, () => {
  console.log("Escuchando puerto 3000");
});
