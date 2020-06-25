//librerias
var express = require('express');
var app = express();

//Modelo db o esquema importado de models

var Medico = require('../models/medico');

//Middleware para las validaciones un usuario debe estar autentificado para realizar
//las opciones del crud

var middelwareAuth = require('../middleware/auth');

//Rutas

//Se especifica el tipo get, la ruta y los parametros,
// funcion find gracias a la libreria mongoos para realizar la consulta a mongodb

app.get('/',  ( req, res, next )=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, '_id nombre img usuario hospital').populate('usuario', 'nombre email role')
    .skip(desde)
    .limit(10)
    .populate('hospital').exec( (err, medicos)=>{
        //Accion que realiza si hay un error en la base de datos al realizar la peticion
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error en cargar medicos db',
                errors: err
            })
        } 
        //La respuesta que se obtiene si la peticion es correcta mas contador
        Medico.count({}, (err, counter)=>{

            res.status(200).json({
                ok: true,
                medicos:medicos,
                total:counter,
                mensaje: 'get de medicoes',
            });
            
        } )

    });
})

//post de medicos crear un medico

app.post('/', middelwareAuth.verificaToken ,(req, res)=>{
    //leer el body enviado por el metodo post
    var body = req.body;
    //Crear variable modelo para recibir la info 
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    //guardar la info proveniente 
    medico.save( ( err, medicoGuardado )=>{
        //Manejo del error
        if (err) {
            return res.status(400).json({
                ok:false,
                errors: err,
                mensaje:'Error al guardar medico en db'
            })
        } 
        //respuesta al recurso creado
        res.status(201).json({
            ok: true,
            body:medico,
            usuarioAdmin: req.usuario,
            mensaje: 'Post de medicoes, recurso creado',
        });

    });

    
} );

//Metodo put para editar
//Recibe el id del medico a editar

app.put('/:id', middelwareAuth.verificaToken ,( req, res )=>{
    //Recibo el id del usuario que quiero editar
    var id = req.params.id;
    var body = req.body;
    //Valido si existe algun usuario con ese id

    Medico.findById( id, ( err, medico )=>{
        //Ocurrio un error 
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al tratar de editar el medico',
                errors: err
            })
        } 
        //No encontro al usuario con ese id
        if (!medico) {
            return res.status(400).json({
                ok:false,
                mensaje:'El medico con el id no existe' +id +'No encontrado' ,
                errors: err
            });
        }

        //Se encontro al usuario, retorno para edicion

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.id = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado)=>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar el medico',
                    errors: err
                })
            } 
            
            res.status(200).json({
                ok: true,
                medico:medicoGuardado,
                usuarioAdmin: req.usuario,
                mensaje: 'Put de usuarios editar usuario',
            });

        });
    });
});


////Eliminar un medico metodo delete por id

app.delete( '/:id', middelwareAuth.verificaToken, ( req, res )=>{
    var id = req.params.id;

    Medico.findByIdAndRemove(id, ( err, medicoBorrado )=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al eliminar medico',
                errors: err
            })
        } 

        if (!medicoBorrado) {
            return res.status(400).json({
                ok:false,
                mensaje:'Error al eliminar usuario, el usuario no existe',
                errors: err
            })
        } 
        
        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuarioAdmin: req.usuario,
            mensaje: 'Delete de medico, medico eliminado',
        });

    } )
})


module.exports = app;