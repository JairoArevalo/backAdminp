var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



//Rutas
//Metodo get de busqueda general
//Ingresa por url el termino de la busqueda


app.get('/todo/:busqueda', (req, res, next)=>{
    //capturamos el parámetro de la busqueda o el termino a buscar
    var busqueda = req.params.busqueda;
    //Se convierte en una expresion regular
    var expresionBusqueda = new RegExp( busqueda, 'i');
    //Arreglo de promesas
    Promise.all( [ BuscarHospitales(busqueda, expresionBusqueda), 
                  BuscarMedicos(busqueda, expresionBusqueda), BuscarUsuarios(busqueda, expresionBusqueda) ])
                  .then( (respuestas)=>{
                    res.status(200).json({
                        ok: true,
                        hospitales: respuestas[0],
                        medicos: respuestas[1],
                        usuarios: respuestas[2],
                        mensaje: 'Peticion get busqueda realizada correctamente'
                    });
                  } )
    
    
    //Se llama a la funcion debido que retorna una promesa asincrona


});

///Busqueda por colecciones 

app.get('/coleccion/:tabla/:busqueda', (req, res)=>{

    var busqueda = req.params.busqueda;
    var expresionBusqueda = new RegExp( busqueda, 'i');
    var tabla = req.params.tabla;
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = BuscarUsuarios(busqueda,expresionBusqueda);
            break;
        case 'medicos':
            promesa = BuscarMedicos(busqueda,expresionBusqueda);
            break;
        case 'hospitales':
            promesa = BuscarHospitales(busqueda,expresionBusqueda);
            break;
    
        default:
            return res.status(400).json({
                ok:false,
                mensaje:'Tipos de busqueda usuarios medicos y hospitales',
                error: 'Tipo de tabla coleccion no valido'
            })

    }
    promesa.then( data =>{
        return res.status(200).json({
            ok:true,
            [tabla]: data
        })
    })
} )


//Funcion asincrona para buscar un hospital, retorna una promesa con los hospitales
//hospitales que coinciden con el termino de busqueda enviado por la url
function BuscarHospitales(busqueda, expresionBusqueda) {
    return new Promise( (resolve, reject)=>{

        Hospital.find( { nombre:expresionBusqueda }).populate('usuario', 'nombre email role')
        .exec( (err, hospitales)=>{
            if (err) {
                reject('Error al cargar hospitales', err);
            }else{
                resolve(hospitales);
            }
        } )


    } )

}

//Funcion asincrona para buscar un medicos, retorna una promesa con los medicos
//medicos que coinciden con el termino de busqueda enviado por la url
function BuscarMedicos(busqueda, expresionBusqueda) {
    return new Promise( (resolve, reject)=>{

        Medico.find( { nombre:expresionBusqueda })
        .populate('usuario', 'nombre email role')
        .populate('hospital')
        .exec((err, medicos)=>{
            if (err) {
                reject('Error al cargar medicos', err);
            }else{
                resolve(medicos);
            }
        } )


    } )

}

//Funcion asincrona para buscar un usuarios, retorna una promesa con los usuarios
//usuarios que coinciden con el termino de busqueda enviado por la url
function BuscarUsuarios(busqueda, expresionBusqueda) {
    return new Promise( (resolve, reject)=>{

        Usuario.find( {},'nombre email role' ).or( [{nombre: expresionBusqueda}, {email: expresionBusqueda}])
        .exec( (err, usuarios)=>{
            if (err) {
                reject('Error al cargar usuarios', err)
            }else{
                resolve(usuarios)
            }
        } )


    } )

}

module.exports = app;