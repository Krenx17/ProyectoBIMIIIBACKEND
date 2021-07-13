const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var tournament = Schema({
    image: String,
    torneo: {type: Schema.Types.ObjectId, ref: "tournaments"},
    nombre: String,
    puntos: Number,
    golesfavor: Number,
    golescontra: Number,
    diferenciagoles: Number,
    partidosjugados: Number
})

module.exports = mongoose.model("teams", tournament)