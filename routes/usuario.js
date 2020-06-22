var express = require('express');
var bcrypt = require('bcryptjs');
var middelwareAuth = require('../middleware/auth')
var app = express();
//importar esquema de usuario definido en models
var Usuario = require('../models/usuario');

//Rutas

//Se especifica el tipo get, la ruta y los parametros,
// funcion find gracias a la libreria mongoos para realizar la consulta a mongodb


app.get('/', (req, res, next)=>{
    Usuario.find({}, 'nombre email img role').exec( (err, usuarios)=>{
        //Accion que realiza si hay un error en la base de datos al realizar la peticion
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error en cargar usuarios db',
                errors: err
            })
        } 
        //La respuesta que se obtiene si la peticion es correcta
        res.status(200).json({
            ok: true,
            usuarios:usuarios,
            mensaje: 'get de usuarios',
        });
        
    });

    
});


//Peticiones que necesitan autentificacion







//Crear un nuevo usuario metodo post ::
//Trabajar enviando la peticion en el body como : x-www-form-urlencoded
//usamos la libreria bodyparser que nos permite tomar directamente la informacion enviada y
// evitarnos ese trabajo

app.post('/', middelwareAuth.verificaToken ,(req, res)=>{
    //leer el body enviado por el metodo post
    var body = req.body;
    //Crear variable modelo para recibir la info 
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    //guardar la info proveniente 
    usuario.save( ( err, usuarioGuardado )=>{
        //Manejo del error
        if (err) {
            return res.status(400).json({
                ok:false,
                errors: err,
                mensaje:'Error al guardar usuarios en db'
            })
        } 
        //respuesta al recurso creado
        res.status(201).json({
            ok: true,
            body:usuario,
            usuarioAdmin: req.usuario,
            mensaje: 'Post de usuarios recurso creado',
        });

    });

    
} );







//Actualizar un usuario
//Recibe obligatorio el id pasado por el url

app.put('/:id', middelwareAuth.verificaToken ,( req, res )=>{
    //Recibo el id del usuario que quiero editar
    var id = req.params.id;
    var body = req.body;
    //Valido si existe algun usuario con ese id

    Usuario.findById( id, ( err, usuario )=>{
        //Ocurrio un error 
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al tratar de editar al usuario',
                errors: err
            })
        } 
        //No encontro al usuario con ese id
        if (!usuario) {
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario con el id no existe' +id +'No encontrado' ,
                errors: err
            });
        }

        //Se encontro al usuario, retorno para edicion

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado)=>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar al usuario',
                    errors: err
                })
            } 
            usuarioGuardado.password = ':)'
            res.status(200).json({
                ok: true,
                usuario:usuarioGuardado,
                usuarioAdmin: req.usuario,
                mensaje: 'Put de usuarios editar usuario',
            });

        });
    });
});

////Eliminar un usuario metodo delete por id

app.delete( '/:id',middelwareAuth.verificaToken, ( req, res )=>{
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, ( err, usuarioBorrado )=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al eliminar usuario',
                errors: err
            })
        } 

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok:false,
                mensaje:'Error al eliminar usuario, el usuario no existe',
                errors: err
            })
        } 
        
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioAdmin: req.usuario,
            mensaje: 'Delete de usuarios, usuario eliminado',
        });

    } )
})




module.exports = app;