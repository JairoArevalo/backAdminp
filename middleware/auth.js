var jwt = require('jsonwebtoken');
//Obtenemos la semilla del token
var semilla = require('../config/config').SEMILLA;

////Verficar token
//leer el token del url, verificar si es válido y su expiracion
exports.verificaToken = function( req, res, next ){
    var token = req.query.token;

    jwt.verify( token,semilla, ( err, decoded )=>{
        if (err) {
            return res.status(401).json({
                ok:false,
                mensaje:'Error token no valido',
                errors: err
            })
        } 

        //informacion del usuario
        req.usuario = decoded.usuario;

        next();
    } )
}


