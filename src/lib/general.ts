import jwt from "jsonwebtoken";

export const createToken = (idu: number, nameu: string) => {
  return jwt.sign(
    { id: idu, name: nameu },
    process.env.TOKEN_SECRET || "tokensreplacementincaseTOKEN_SECRETisundifined"
  ); //{expiresin: "1h"} para que el token expire en 1 hora
};

export function getIdfromToken(token: string) {
  token = token.split(" ")[1]; // quita el bearer al token
  const payload = jwt.verify(
    token,
    process.env.TOKEN_SECRET || "tokensreplacementincaseisundifined"
  );
  console.log(payload);
  return (<any>payload).id;
}

/* console.log(
  getIdfromToken(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6InVzZXIxMjM0IiwiaWF0IjoxNjkzNzE3ODk1fQ.FqHGBOsW0WHCfDL3VMutdB_BC0zLSlYahuabXfu_F5A"
  )
); */
