const error = require("console");
const e = require("express");
const { query } = require("express");
const express = require("express");
const mysql = require("mysql");
const app = express();
const util = require("util");

const port = process.env.PORT ? process.abort.env.PORT : 3000;
app.use(express.json());

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "where-is-my-book",
});

const queryPromisify = util.promisify(conexion.query).bind(conexion);

conexion.connect((error) => {
  if (error) {
    throw error;
  }
  console.log("coneccion a la base de datos establecida");
});

app.post("/categoria", async (req, res) => {
  try {
    const nombreEnMayusc = req.body.nombre.split(" ").join("").toUpperCase();
    if (!req.body.nombre) {
      throw new Error("no ingresaste el nombre");
    }
    if (nombreEnMayusc.length <= 3) {
      throw new Error("el nombre es demasiado corto");
    }
    const queryDeChekeoNombreRepetido =
      "select * from categoria where nombre = ?";
    const chekeoNombreRepetido = await queryPromisify(
      queryDeChekeoNombreRepetido,
      [nombreEnMayusc]
    );

    if (chekeoNombreRepetido.length > 0) {
      throw new Error("La categoria ya existe");
    }
    const query = "insert into categoria (nombre) values (?)";
    const respuesta = await queryPromisify(query, [nombreEnMayusc]);
    res.status(200).send({ Respuesta: "categoria guardada correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ error: error.message });
  }
});

app.get("/categoria", async (req, res) => {
  try {
    const query = "select * from categoria";
    const respuesta = await queryPromisify(query);
    res.status(200).send({ respuesta: respuesta });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ Error: error.message });
  }
});

app.get("/categoria/:id", async (req, res) => {
  try {
    const queryValidacionExistencia = "select * from categoria";
    const validacionCategoria = await queryPromisify(queryValidacionExistencia);
    const existeCategoria = validacionCategoria.find(
      (elemento) => elemento.id == req.params.id
    );    
    if (!existeCategoria) {
      throw new Error("no existe la categoria");
    }
    const query = "select * from categoria where id = ?";
    const respuesta = await queryPromisify(query, [req.params.id]);
    res.status(200).send({ Respuesta: respuesta });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ error: error.message });
  }
});

app.delete("/categoria/:id", async (req, res) => {
  try {
    const queryExisteCategoria = "select * from categoria where id = ?";
    const respuestaExisteCategoria = await queryPromisify(
      queryExisteCategoria,
      [req.params.id]
    );
    if (respuestaExisteCategoria.length == 0) {
      throw new Error("La categoria no existe");
    }
    const queryHayElementos = "select * from libros where categoria_id = ?";
    const respuestaQueryElementos = await queryPromisify(queryHayElementos, [
      req.params.id,
    ]);
    if (respuestaQueryElementos.length > 0) {
      throw new Error(
        "No se pudo eliminar la categoria porque tiene libros asociados, por favor remueva los libros antes de eliminar esta categoria"
      );
    }
    const queryDelete = "delete from categoria where id = ?";
    const respuestaQueryDelete = await queryPromisify(queryDelete, [
      req.params.id,
    ]);
    res.status(200).send({ Respuesta: "Se borro correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(413).send({ error: error.message });
  }
});

//TESTING GITHUB
//Use la misma variable que el ejemplo
const qy = util.promisify(conexion.query).bind(conexion); // permite el uso de asyn-await en la conexion mysql

app.post('/persona/', async(req, res)=>{
    try{
      //Verifico que vengan todos los campos completos
      if(!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.email){
        throw new Error ("No se envió alguno de los siguientes datos: Nombre, Apellido, Alias, Email");
      }
      //Verifico que la persona no este dada de alta previamente
      let query = 'SELECT id FROM persona WHERE email = ?';
      let respuesta = await qy(query, [req.body.email]);
      if(respuesta.length > 0){
        throw new Error('Persona ya existe en la base de datos');
      }
      //Se da de alta a la persona en la base de datos
      query = 'INSERT INTO persona (nombre, apellido, alias, email) VALUES (?, ?, ?, ?)';
      respuesta = await qy(query, [req.body.nombre, req.body.apellido, req.body.alias, req.body.email]);
      
      res.status(200).send("Persona agregada a la base de datos con exito");
      res.send({'respuesta': respuesta});
  
    }
    catch (error) {
      console.error(error.message);
      res.status(413).send({ error: error.message });
    }
  });

//GET 1
app.get('/persona', async (req, res)=>{
    try{
        const query = 'SELECT * FROM persona';
        const respuesta = await qy(query);
        
        res.status(200).send("Busqueda exitosa");
        res.send({'respuesta': respuesta});
    }
    catch (error) {
        console.error(error.message);
        res.status(413).send({ error: error.message });
      }
});
//GET 2
app.get('/persona/:id', async (req, res)=>{
    try{
        const query = 'SELECT * FROM persona WHERE id = ?';
        const respuesta = await qy(query, [req.params.id]);

        if(respuesta.length == 0){
            throw new Error('Persona no se encuentra en la base de datos');
        }
        res.status(200).send("Busqueda exitosa");
        res.send({'respuesta': respuesta});
    }
    catch (error) {
        console.error(error.message);
        res.status(413).send({ error: error.message });
    }
});

//PUT
app.put("/persona/:id", async (req, res) => {
    try {
      if (
        !req.body.nombre ||
        !req.body.apellido ||
        !req.body.alias ||
        !req.body.email
      ) {
        throw new Error("No se enviaron todos los datos");
      }
      const query = "select * from persona where id = ?";
      const respuesta = await qy(query, [req.params.id]);
      console.log(
        req.body.email,
        respuesta[0].email,
      );
      if (
        respuesta[0].email != req.body.email
      ) {
        throw new Error("No se puede modificar el email");
      }
      const queryActualizar = "UPDATE persona SET nombre = ?, apellido = ?, alias = ? where id = ?";
      const respuestaActualizada = await qy(queryActualizar, [
        req.body.nombre,
        req.body.apellido,
        req.body.alias,
        req.params.id,
      ]);
      res.status(200).send("Datos de la persona actualizados con exito");
      res.send({'respuesta': respuestaActualizada});

    } catch (error) {
      console.error(error.message);
      res.status(413).send({ error: error.message });
    }
  });

//DELETE
app.delete('/persona/:id', async(req, res)=>{
    try {
        let query = 'SELECT * FROM persona WHERE id = ?';

        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length == 0) {
            throw new Error("El nombre id ingresado no existe en la base de datos, no se puede borrar");
        };
        query = 'DELETE FROM persona WHERE id = ?';

        respuesta = await qy(query, [req.params.id]);
        res.status(200).send("Persona eliminada de la base de datos");
        res.send({'respuesta': respuesta});
    }
    catch (error) {
        console.error(error.message);
        res.status(413).send({ error: error.message });
    }
});

app.listen(port, () => console.log(`escuchando en el puerto ${port}`));
