//inicilizar la libreria

var mongoos = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

//Crear un esquema para las colecciones de mongodb :: en este caso es el esquema de 
//un usuario y algunas validaciones ((primer esquema { nombre, email::validacion unica,  
// password :: campo requerido, img, role:: configuracion por defecto 'USER_ROLE'}))
//En las siguientes modelos de esquema es necesario realizar algunas referencias sobre su creacion 
// por google o Json web token JWT 
var Schema = mongoos.Schema;


//Validacion de roles 2do esquema realizado

var rolesValidos ={
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type:String, required: [true, 'El nombre es requerido'] },
    email: {type: String, unique:true , required: [true, 'El correo es requerido' ] },
    password:{type: String,  required: [true, 'La contraseña es requerida' ] },
    img: { type:String, required:false },
    role: { type:String, required:true, default: 'USER_ROLE', enum:rolesValidos}

});

//Plugin importado para imprimir validaciones al realizar la peticion
usuarioSchema.plugin( uniqueValidator, {message:'{PATH} debe ser unico'} );

//Se realiza la exportacion del modelo para su posterior uso

module.exports = mongoos.model('Usuario', usuarioSchema);