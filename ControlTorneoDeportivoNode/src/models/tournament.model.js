const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var tournament = Schema({
    nombre: String,
    creador: {type: Schema.Types.ObjectId, ref: "Users"},
    cantequipos: Number,
    partidosajugar: Number,
    jornadas: Number
})

module.exports = mongoose.model("tournaments", tournament)