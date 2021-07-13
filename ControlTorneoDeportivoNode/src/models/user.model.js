const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = Schema({
    usuario: String,
    name: String,
    password: String,
    rol: String
});

module.exports = mongoose.model("users", UserSchema)