import * as fs from "node:fs";
import * as path from "path";

const result: string = path.join(__dirname, "./img/avatars"); //cambiar segun ubicacion del archivo
console.log(result);

function readfiles(directory: string) {
  console.log("entra");
  fs.readdirSync(directory).forEach((file) => {
    console.log(file);
  });
}
/*\Backendpt\img\avatars\avatar 1.jpg 
obtner dirname del archivo actual y modificar el stirng para que se pueda unir al directorio de la imagen
*/
readfiles(result);
