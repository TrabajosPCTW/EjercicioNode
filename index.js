const axios = require("axios").default;
var fs = require("file-system");
var url = require("url");
var http = require("http");
const { SlowBuffer } = require("buffer");
const { info } = require("console");

const urlProv =
  "https://gist.githubusercontent.com/josejbocanegra/d3b26f97573a823a9d0df4ec68fef45f/raw/66440575649e007a9770bcd480badcbbc6a41ba7/proveedores.json";

const urlCli =
  "https://gist.githubusercontent.com/josejbocanegra/986182ce2dd3e6246adcf960f9cda061/raw/f013c156f37c34117c0d4ba9779b15d427fb8dcd/clientes.json";

const pathClientes = "./cli.html";
const pathIndex = "./index.html";
const pathProveedores = "./prov.html";

cargarProveedores();
cargarClientes();

http.createServer((req, res) => procesar(req, res)).listen(8080);

function procesar(req, res) {
  let rUrl = url.parse(req.url);
  let file = "x";
  if (rUrl.path == "/api/proveedores") {
    file = pathProveedores;
  } else if (rUrl.path == "/api/clientes") {
    file = pathClientes;
  }
  fs.readFile(file, function (error, data) {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("404 Not Found");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return res.end();
  });
}

function cargarClientes() {
  axios.get(urlCli).then((response) => {
    let clientes = [];
    response.data.forEach((object) => {
      let obj = {
        id: object.idCliente,
        ncomp: object.NombreCompania,
        ncont: object.NombreContacto,
      };
      clientes.push(obj);
    });

    fs.readFile(pathIndex, function (error, data) {
      if (error) {
        console.log(err, "Not found");
      } else {
        let file = data.toString();
        file = rellenar("clientes", file, clientes);
        fs.writeFile(pathClientes, file, (error) => {
          if (error) console.log("Error de escritura");
        });
      }
    });
  });
}

function cargarProveedores() {
  axios.get(urlProv).then((response) => {
    let proveedores = [];
    response.data.forEach((object) => {
      let obj = {
        id: object.idproveedor,
        ncomp: object.nombrecompania,
        ncont: object.nombrecontacto,
      };
      proveedores.push(obj);
    });

    fs.readFile(pathIndex, function (error, data) {
      if (error) {
        console.log(err, "Not found");
      } else {
        let file = data.toString();
        file = rellenar("proveedores", file, proveedores);
        fs.writeFile(pathProveedores, file, (error) => {
          if (error) console.log("Error de escritura");
        });
      }
    });
  });
}

function rellenar(nombre, texto, lista) {
  let retorno = texto.replace(/{{nombre}}/g, nombre);
  let htmlFilas = "";
  lista.forEach((object) => {
    htmlFilas =
      htmlFilas +
      "<tr><td>" +
      object["id"] +
      "</td><td>" +
      object["ncomp"] +
      "</td><td>" +
      object["ncont"] +
      "</td></tr>";
  });
  retorno = retorno.replace("{{filas}}", htmlFilas);
  return retorno;
}
