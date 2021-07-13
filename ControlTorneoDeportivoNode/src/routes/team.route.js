'use strict'
const express = require('express')
const teamController = require('../controllers/team.controller')
var authentication = require('../middlewares/authenticated')

var team = express.Router()

team.post('/createequipo/:idTorneo', authentication.ensureAuth, teamController.createequipo);
team.put('/editequipo/:idTorneo/:idEquipo', authentication.ensureAuth, teamController.editequipo);
team.delete('/deleteequipo/:idTorneo/:idEquipo', authentication.ensureAuth, teamController.deleteequipo);
team.get('/equipo/:idTorneo/:idEquipo', authentication.ensureAuth, teamController.equipo);
team.get('/equipos/:idTorneo', authentication.ensureAuth, teamController.equipos);


module.exports = team;