"use strict"

const express = require("express");
const userController = require("../controllers/user.controller")
var authentication = require("../middlewares/authenticated");

var user = express.Router();
user.post("/login", userController.login)
user.post("/register", userController.register);
user.post("/admin", authentication.ensureAuth, userController.admin);
user.put("/edituser/:idUser", authentication.ensureAuth, userController.editUser);
user.delete("/deleteuser/:idUser", authentication.ensureAuth, userController.deleteUser);
user.get("/userid/:idUser", authentication.ensureAuth, userController.user)
user.get("/users", authentication.ensureAuth, userController.users);

module.exports = user;