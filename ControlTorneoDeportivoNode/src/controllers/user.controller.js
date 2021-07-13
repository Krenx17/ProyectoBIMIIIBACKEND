'use strict'

const User = require("../models/user.model");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../service/jwt");

function login(req, res){
    var params = req.body;

    User.findOne({usuario: params.usuario}, (err, obtainedUser)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if(obtainedUser){
            bcrypt.compare(params.password, obtainedUser.password,(err,correctPass)=>{
                if(correctPass){
                    if(params.getToken === "true"){
                        return res.status(200).send({token: jwt.createToken(obtainedUser)});
                    } else{
                        obtainedUser.password=undefined;
                        return res.status(200).send({ obtainedUser });
                    }
                }else{
                    return res.status(404).send({mesaje: "El usuario no se ha podido identificar"})
                }
            })
        }else{
            return res.status(404).send({mesaje: "El usuario no ha podido ingresar"})
        }
    })
}

function register(req, res){
    var userModel = User();
    var params = req.body

    if(params.usuario && params.password){
        User.find({$or: [
            {usuario: params.usuario}
        ]}).exec((err, UsersFind)=>{
            //Se verifica que no haya otro usuario con el mismo nombre
            if (UsersFind && UsersFind.length>=1){
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                return res.status(500).send({mesaje: "El usuario ya existen"})
            }else{
                userModel.usuario = params.usuario;
                userModel.name = params.name
                userModel.password = params.password;
                userModel.rol = "User";
                //Se encripta la contraseña
                bcrypt.hash(params.password, null, null, (err,encryptpass)=>{
                    userModel.password=encryptpass;
                    userModel.save((err,saveUser)=>{
                        if (err) return res.status(500).send({mesaje:"Error en la petición"});
                        //Se registra el usuario con exito
                        if(saveUser){
                            return res.status(200).send({mesaje: "El usuario se creo con exito"})
                        }
                    })
                })
            }
        })
    }else{
        return res.status(500).send({mesaje: "Hacen falta datos"})
    }
}

function editUser(req, res){
    var idUser = req.params.idUser;
    var params = req.body;

    delete params.password;
    //Se verifica si un Administrador o el usuario quiere editar su perfil
    if (req.user.rol === 'Admin' || req.user.sub === idUser){
        User.findById(idUser, (err, UserFind)=>{
            if (err) return res.status(500).send({mesaje: "Error en la petición"});
            //Se verifica si el usuario que se va a editar es Administrador o no
            if (UserFind.rol === 'Admin'){
                if (req.user.sub === UserFind._id){
                    User.find({$or: [
                        {usuario: params.usuario}
                    ]}).exec((err, UsersFind)=>{  
                        if (err) return res.status(500).send({mesaje:"Error en la petición"});
                        if (UsersFind && UsersFind.length>=1){
                            return res.status(500).send({mesaje: "Ya existe ese usuario"})
                        }else{
                            User.findByIdAndUpdate(idUser, params, {new:true}, (err, updateUser)=>{
                                if(err) return res.status(500).send({mesaje: "Error en la petición al actualizar"});
                                if(!updateUser) return res.status(500).send({mesaje: "No se pudo actualizar la empresa"});
                                return res.status(200).send({updateUser});
                            })
                        }
                    })
                }else{
                    return res.status(500).send({mesaje: "No puedes editar a otro Administrador"});
                }
            }else{
                //Se busca que no haya coincidencias con el nuevo nombre de usuario
                if (params.usuario){
                    User.find({$or: [
                        {usuario: params.usuario}
                    ]}).exec((err, UsersFind)=>{  
                        if (err) return res.status(500).send({mesaje:"Error en la petición"});
                        if (UsersFind && UsersFind.length>=1){
                            return res.status(500).send({mesaje: "Ya existe ese usuario"})
                        }else{
                            User.findByIdAndUpdate(idUser, params, {new:true}, (err, updateUser)=>{
                                if(err) return res.status(500).send({mesaje: "Error en la petición al actualizar"});
                                if(!updateUser) return res.status(500).send({mesaje: "No se pudo actualizar la empresa"});
                                return res.status(200).send({updateUser});
                            })
                        }
                    })
                }else{
                    User.findByIdAndUpdate(idUser, params, {new:true}, (err, updateUser)=>{
                        if(err) return res.status(500).send({mesaje: "Error en la petición al actualizar"});
                        if(!updateUser) return res.status(500).send({mesaje: "No se pudo actualizar la empresa"});
                        return res.status(200).send({updateUser});
                    })
                }
            }
        })
    }else{
        return res.status(500).send({mesaje: "No posees los permisos necesarios"});
    }
}

function deleteUser(req, res){
    var idUser = req.params.idUser;

    if (req.user.rol === 'Admin' || req.user.sub === idUser){
        User.findById(idUser, (err, UserFind)=>{
            if (err) return res.status(500).send({mesaje: "Error en la petición"});
            //Se verifica si el usuario que se va a eliminar es Administrador o no
            if (UserFind.rol === 'Admin'){
                return res.status(500).send({mesaje: "No posees los permisos necesarios para modificar esos datos"});
            }else{
                //Se elimina al Usuario
                User.findByIdAndDelete(idUser,(err, removedEmpresa)=>{
                    if(err) return res.status(500).send({mesaje:"Error en la petición al eliminar"});
                    if(!removedEmpresa) return res.status(500).send({mesaje:"Error al eliminar el usuario"});
                    return res.status(200).send({mesaje: "Se a logrado eliminar con exito"});
                })
            }
        })
    }else{
        return res.status(500).send({mesaje: "No posees los permisos necesarios"});
    }
}

function users(req, res){
    if (req.user.rol === "Admin"){
        User.find((err,obtainedUsers)=>{
            if(err) return res.status(500).send({mesaje: "Error al obtener usuarios"});
            if(!obtainedUsers) return res.status(500).send({mesaje: "Error al consultar usuarios"}); 
            return res.status(200).send({obtainedUsers});
        })
    }else{
        return res.status(500).send({mesaje: "No posees los permisos necesarios"});
    }
}

function admin(req,res){
    var userModel = User();
    var params = req.body

    //Indica que solo un Administrador puede usar esta función
    if (req.user.rol === "Admin"){
        if(params.usuario && params.password){
            User.find({$or: [
                {usuario: params.usuario}
            ]}).exec((err, UsersFind)=>{
                //Se verifica que no haya otro usuario con el mismo nombre
                if (UsersFind && UsersFind.length>=1){
                    if (err) return res.status(500).send({mesaje:"Error en la petición"});
                    return res.status(500).send({mesaje: "El usuario ya existen"})
                }else{
                    userModel.usuario = params.usuario;
                    userModel.name = params.name
                    userModel.password = params.password;
                    userModel.rol = "Admin";
                    //Se encripta la contraseña
                    bcrypt.hash(params.password, null, null, (err,encryptpass)=>{
                        userModel.password=encryptpass;
                        userModel.save((err,saveUser)=>{
                            if (err) return res.status(500).send({mesaje:"Error en la petición"});
                            //Se registra el usuario con exito
                            if(saveUser){
                                return res.status(200).send({mesaje: "El usuario se creo con exito"})
                            }
                        })
                    })
                }
            })
        }else{
            return res.status(500).send({mesaje: "Hacen falta datos"})
        }
    }else{
        return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
    }
}

function user(req, res){
    var idUser = req.params.idUser;

    User.findById(idUser, (err, obtainedUser) =>{
        if(err) return res.status(500).send({mesaje: "Error al obtener usuarios"});
        if(!obtainedUser) return res.status(500).send({mesaje: "Error al consultar usuario"});
        return res.status(200).send({obtainedUser})
    })
}

module.exports={
    login,
    register,
    editUser,
    deleteUser,
    users,
    user,
    admin
}