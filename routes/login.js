var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
//Obtenemos la semilla del token
var semilla = require('../config/config').SEMILLA;
var app = express();
//importar esquema de usuario definido en models
var Usuario = require('../models/usuario');

//Metodo de login

app.post('/', (req, res)=>{
    var body = req.body;

    //Verificar si existe el usuario con el correo 

    Usuario.findOne( {email: body.email}, (err, usuarioDb)=>{
        //Verificar el error

        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario ops',
                error:err
            })
        }//if error

        //VErificar si  existe el usuario en db por el correo

        if (!usuarioDb) {
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario no se encuentra registrado'
            })
        }// if verificar si esta el usuario en DB


        //Verificar contraseña
        if (! bcrypt.compareSync( body.password, usuarioDb.password )) {
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario no tiene credenciales validas'
            })
        }

        //Crear token JWT libreria npm install jsonwebtoken
        //Recibe como parametro la data que va ir dentro del token payload
        usuarioDb.password = ':)';
        var token = jwt.sign({ usuario:usuarioDb }, semilla, {expiresIn: 14000})

   
   
        res.status(200).json({
            ok:true,
            usuario: usuarioDb,
            id: usuarioDb.id,
            token: token,
            expiredIn: 14000,
            mensaje:'Metodo login post ok, login user'
            
        })//Res.status

    }); //Usuario.findOne()

});//app.post


module.exports = app;