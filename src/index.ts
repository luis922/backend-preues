import express from "express";
import dotenv from "dotenv";
import authUser from "./routes/authUser";
import essays from "./routes/essays";
import userUpkeep from "./routes/userUpkeep";
import stats from "./routes/statistics";

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(authUser);
app.use(userUpkeep);
app.use(essays);
app.use(stats);

app.listen(port, () => {
  console.log("Escuchando puerto: " + port);
});
