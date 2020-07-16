var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
//Obtenemos la semilla del token
var semilla = require('../config/config').SEMILLA;
//google clientID
var CLIENT_ID = require('../config/config').CLIENT_ID;
var app = express();
//importar esquema de usuario definido en models
var Usuario = require('../models/usuario');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
var mdAuth = require('../middleware/auth');
//Metodo de login auth normal

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
            menu: obtenerMenu(usuarioDb.role),
            token: token,
            expiredIn: 14000,
            mensaje:'Metodo login post ok, login user'
            
        })//Res.status

    }); //Usuario.findOne()

});//app.post


//Auth con google
    async function verify(token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        return {
            nombre:payload.name,
            email:payload.email,
            img:payload.picture,
            perfil: payload.profile,
            google: true
        }
    }
    verify().catch(console.error);



app.post('/google', async (req, res)=>{

    let token = req.body.token;
    let userGoogle = await verify(token).catch((err)=>{
        return res.status(403).json({
            ok:false,
            mensaje:'Token invalido'
        });
    })


    Usuario.findOne( { email:userGoogle.email }, (err, usuarioDB)=>{ 
        if (err) {
            res.status(500).json({
                ok:false,
                err: 'Error en db'
            })
        }

        if (usuarioDB) {
            if (usuarioDB.google ===  false) {
                return res.status(400).json({
                    ok:false,
                    mensaje:'Este correo ya tiene una cuenta y una contraseña'
                })
            }else{
                usuarioDB.password = ':)';
                var token = jwt.sign({ usuario:usuarioDB }, semilla, {expiresIn: 14000});
                res.status(200).json({
                    ok:true,
                    usuario: usuarioDB,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role) ,
                    mensaje:'Metodo login post google ok, login user'
        
                })//Res.status
            }
        }else{
            //El usuario no existe hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = userGoogle.nombre;
            usuario.email = userGoogle.email;
            usuario.img = userGoogle.img;
            usuario.google = true;
            usuario.password =':)';

            usuario.save((err, usuarioDB)=>{
                var token = jwt.sign({ usuario:usuarioDB }, semilla, {expiresIn: 14000})
                
                res.status(200).json({
                    ok:true,
                    usuario: usuarioDB,
                    id: usuarioDB.id,
                    menu: obtenerMenu(usuarioDB.rol),
                    token: token,
                    expiredIn: 14000,
                    mensaje:'Metodo login post ok, login user'
                    
                })//Res.status
            })
        }
        
    } )

    // res.status(200).json({
    //     ok:true,
    //     userGoogle:userGoogle,
    //     mensaje:'Metodo login post google ok, login user'
        
    // })//Res.status
})


//Obtener menú del ususario logueado


function obtenerMenu(ROLE) {
    menu =[
        {
          titulo:'Menu Principal',
          icono:'mdi mdi-gauge',
          submenu:[
            { titulo:'Dashboard', url:'/dashboard'},
            { titulo:'Progress', url:'/progress'},
            { titulo:'Graficas', url:'/graficas1'},
            { titulo:'Promesas', url:'/promesas'},
            { titulo:'Rxjs', url:'/rxjs'}
            
          ]
      
        },
        {
          titulo:'Mantenimiento',
          icono:'mdi mdi-folder-lock-open',
          submenu:[
            // {titulo: 'Usuarios', url:'/usuarios' },
            {titulo: 'Medicos', url:'/medicos' },
            {titulo: 'Hospitales', url:'/hospitales' }
          ]
        }
    
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({titulo: 'Usuarios', url:'/usuarios' })
    }

    return menu
}

//Renovar el token

app.get('/renuevaToken', mdAuth.verificaToken ,( req, res )=>{
    
    var token = jwt.sign({ usuario:req.usuario }, semilla, {expiresIn: 14000})
    
    res.status(200).json({
         ok:true,
         token:token
     })
})

module.exports = app;