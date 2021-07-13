'use strict'

const mongoose = require("mongoose");
const app = require("./app");
const User = require("./src/models/user.model");
const bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/controldeportivo", {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
    //Se conecta con la base de datos
    app.listen(3000,function (){
        var userModel = new User();

        //Se verifica si ya existe un usuario ADMIN 
        User.find({$or: [
            {usuario: "ADMIN"}
        ]}).exec((err, UserFind)=>{
            if(err) console.log("Error en la petición");
            if (UserFind && UserFind.length>=1){
                console.log("Ya existe un administrador");
            }else {
                userModel.usuario = "ADMIN";
                userModel.password = "123456"
                userModel.rol = "Admin";
                bcrypt.hash("123456", null, null, (err,encryptpass)=>{
                    userModel.password=encryptpass;
                    userModel.save((err,saveUser)=>{
                        if(saveUser){
                            console.log("El usuario admin a sido creado con exito")
                        }
                    })
                })
            }
        })
    })
}).catch(err=>console.log(err));