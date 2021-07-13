const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var matchSchema = Schema({
    torneo: {type: Schema.Types.ObjectId, ref: 'tournaments'},
    equipo1: {type: Schema.Types.ObjectId, ref: 'teams'},
    goles1: Number,
    equipo2: {type: Schema.Types.ObjectId, ref: 'teams'},
    goles2: Number,
    jugado: String
})

module.exports = mongoose.model("matchs", matchSchema)