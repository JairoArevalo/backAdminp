//Modelo o esquema DB importado creado en models

var Hospital = require('../models/hospital');
//librerias
var express = require('express');
var app = express();

//Middleware para las validaciones un usuario debe estar autentificado para realizar
//las opciones del crud

var middelwareAuth = require('../middleware/auth');



//Rutas

//Se especifica el tipo get, la ruta y los parametros,
// funcion find gracias a la libreria mongoos para realizar la consulta a mongodb

app.get('/',  ( req, res, next )=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario').populate('usuario', 'nombre email role')
    .skip(desde).limit(20)
    .exec( (err, hospitales)=>{
        //Accion que realiza si hay un error en la base de datos al realizar la peticion
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error en cargar usuarios db',
                errors: err
            })
        } 
        //La respuesta que se obtiene si la peticion es correcta mas el conteo
        Hospital.count({}, (err, counter)=>{

            res.status(200).json({
                ok: true,
                hospitales:hospitales,
                total:counter,
                mensaje: 'get de hospitales',
            });
        } )

        
    });
} )




//Peticiones que necesitan autentificacion


//Crear un nuevo hospital metodo post ::
//Trabajar enviando la peticion en el body como : x-www-form-urlencoded
//usamos la libreria bodyparser que nos permite tomar directamente la informacion enviada y
// evitarnos ese trabajo

app.post('/', middelwareAuth.verificaToken ,(req, res)=>{
    //leer el body enviado por el metodo post
    var body = req.body;
    //Crear variable modelo para recibir la info 
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });
    //guardar la info proveniente 
    hospital.save( ( err, hospitalGuardado )=>{
        //Manejo del error
        if (err) {
            return res.status(400).json({
                ok:false,
                errors: err,
                mensaje:'Error al guardar hospital en db'
            })
        } 
        //respuesta al recurso creado
        res.status(201).json({
            ok: true,
            body:hospital,
            usuarioAdmin: req.usuario,
            mensaje: 'Post de hospitales, recurso creado',
        });

    });

    
} );

//Metodo put para editar
//Recibe el id del hospital a editar

app.put('/:id', middelwareAuth.verificaToken ,( req, res )=>{
    //Recibo el id del usuario que quiero editar
    var id = req.params.id;
    var body = req.body;
    //Valido si existe algun usuario con ese id

    Hospital.findById( id, ( err, hospital )=>{
        //Ocurrio un error 
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al tratar de editar el hospital',
                errors: err
            })
        } 
        //No encontro al usuario con ese id
        if (!hospital) {
            return res.status(400).json({
                ok:false,
                mensaje:'El hospital con el id no existe' +id +'No encontrado' ,
                errors: err
            });
        }

        //Se encontro al usuario, retorno para edicion

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.id = req.usuario._id;

        hospital.save( (err, hospitalGuardado)=>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar el hospital',
                    errors: err
                })
            } 
            
            res.status(200).json({
                ok: true,
                hospital:hospitalGuardado,
                usuarioAdmin: req.usuario,
                mensaje: 'Put de usuarios editar usuario',
            });

        });
    });
});


////Eliminar un hospital metodo delete por id

app.delete( '/:id', middelwareAuth.verificaToken, ( req, res )=>{
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, ( err, hospitalBorrado )=>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al eliminar hospital',
                errors: err
            })
        } 

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok:false,
                mensaje:'Error al eliminar usuario, el usuario no existe',
                errors: err
            })
        } 
        
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuarioAdmin: req.usuario,
            mensaje: 'Delete de hospital, hospital eliminado',
        });

    } )
})

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id).populate('usuario', 'nombre img email').exec((err, hospital) => {
    if (err) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar hospital',
            errors: err
        });
    }
    if (!hospital) {
        return res.status(400).json({
        ok: false,
        mensaje: 'El hospital con el id ' + id + 'no existe',
        errors: { message: 'No existe un hospital con ese ID' }
        });
    }
    res.status(200).json({
        ok: true,
        hospital: hospital
    });

    })

})


module.exports = app;