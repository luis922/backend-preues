import express from "express";
import dotenv from "dotenv";
import authUser from "./routes/authUser";
import essays from "./routes/essays";
import userUpkeep from "./routes/userUpkeep";

dotenv.config();
const app = express();
app.use(express.json());
const port = 3000;

app.use(authUser);
app.use(userUpkeep);
app.use(essays); //genera null en consola aaaaaaaaaa

app.listen(port, () => {
  console.log("Escuchando puerto: " + port);
});
