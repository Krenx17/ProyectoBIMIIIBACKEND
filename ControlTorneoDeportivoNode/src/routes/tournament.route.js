'use strict'

const express = require('express');
const tournamentController = require('../controllers/tournament.controller')
var authentication = require('../middlewares/authenticated')

var tournament = express.Router();
tournament.post('/creartorneo', authentication.ensureAuth, tournamentController.createtorneo);
tournament.put('/edittorneo/:idTorneo', authentication.ensureAuth, tournamentController.edittorneo)
tournament.delete('/deletetorneo/:idTorneo', authentication.ensureAuth, tournamentController.deletetorneo)
tournament.get('/torneo/:idTorneo', authentication.ensureAuth, tournamentController.torneo)
tournament.get('/torneos', authentication.ensureAuth, tournamentController.torneos)

module.exports = tournament;