var express = require('express');
var app = express();
var fileUpload = require('express-fileupload'); 
var fs = require('fs');
// default options //Es un middleware
app.use(fileUpload());
//Modelos para hacer el upload de la imagen
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


//Rutas
app.put('/:tipo/:id', (req, res, next)=>{
    var tipo = req.params.tipo;
    var id = req.params.id;
    
    if(!req.files){
        return res.status(400).json({
            ok:false,
            error:'No ha subido ningun archivo',

        })
    }
    //Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchiv = nombreCortado[nombreCortado.length -1];
    //Solo estas extenciones son permitidas y las colecciones permitidas

    var extencionesValidas = ['png', 'jpg', 'gif', 'jpge' ];
    var coleccionesValidas = ['medicos', 'hospitales','usuarios'];
    if (coleccionesValidas.indexOf(tipo)<0) {
        return res.status(400).json({
            ok:false,
            error:'Tipo de coleccion no valida',

        });
    }

    //Validacion de extenciones
    if (extencionesValidas.indexOf(extensionArchiv) <0) {
        return res.status(400).json({
            ok:false,
            error:'Tipo de archivo no valido debe ser png jpg gif o jpge',

        });
    }

    //Generar un nombre de archivo unico
    var nombreUnico = `${ id }-${ new Date().getMilliseconds() }.${extensionArchiv}`;

    //Mover el archivo del temporal al path 
    var path = `./uploads/${tipo}/${nombreUnico}`

    archivo.mv( path, err =>{
        if (err) {
            res.status(500).json({
                ok:false,
                error:'Error al mover el archivo',err
            })
        }


        SubirTipo(tipo, id, nombreUnico, res);

    } )

    
});



function SubirTipo(tipo, id, nombreArchivo, res) {
    if (tipo == 'usuarios') {
        Usuario.findById( id, (err, usuario)=>{
            if (!usuario) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'no se encuentra el usuario: '+err
                })
            }
            if (err) {
                return res.status(500).json({
                    ok:false,
                    mensaje:'Ha ocurriodo un error: '+err
                })
            }
            
            const pathViejo = `C:/Angular/AngularAd/BackendAdmin/uploads/usuarios/${usuario.img}`;
           
            
            
            //Verifica si existe una imagen previa del usuario o hospital
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado)=>{
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        err: 'Ha ocurrido un error : '+err
                    })
                }
                usuarioActualizado.password =':)'
                return res.status(200).json({
                    ok:true,
                    mensaje:'Imagen actualizada movido',
                    usuario: usuarioActualizado
                    
                })
            } )
        })
    }
    if (tipo === 'medicos') {
        Medico.findById( id, (err, medico)=>{
            if (!medico) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'no se encuentra el usuario: '+err
                })
            }
            if (err) {
                return res.status(500).json({
                    ok:false,
                    mensaje:'Ha ocurriodo un error: '+err
                })
            }
            const pathViejo = `C:/Angular/AngularAd/BackendAdmin/uploads/medicos/${medico.img}`;
            
            //Verifica si existe una imagen previa del usuario o hospital
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
           
            }
            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado)=>{
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        err: 'Ha ocurrido un error : '+err
                    })
                }
                
                return res.status(200).json({
                    ok:true,
                    mensaje:'Imagen actualizada movido',
                    medico: medicoActualizado
                })
            } )
        })
    }
    if (tipo === 'hospitales') {
        Hospital.findById( id, (err, hospital)=>{
            if (!hospital) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'no se encuentra el usuario: '+err
                })
            }
            if (err) {
                return res.status(500).json({
                    ok:false,
                    mensaje:'Ha ocurriodo un error: '+err
                })
            }

            var pathAnterior= `C:/Angular/AngularAd/BackendAdmin/uploads/hospitales/${hospital.img}`;
           
            //Verifica si existe una imagen previa del usuario o hospital
            if (fs.existsSync(pathAnterior)) {
                fs.unlinkSync(pathAnterior);
           
            }
            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado)=>{
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        err: 'Ha ocurrido un error : '+err
                    })
                }
                
                return res.status(200).json({
                    ok:true,
                    mensaje:'Imagen actualizada movido',
                    hospital: hospitalActualizado
                })
            } )
        })
    }
}

module.exports = app;