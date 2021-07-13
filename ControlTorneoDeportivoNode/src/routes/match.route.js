'use strict'
const express = require('express')
const matchController = require('../controllers/match.controller')
var authentication = require('../middlewares/authenticated')

var match = express.Router()

match.post('/match/:idTorneo', authentication.ensureAuth, matchController.match);
match.put('/editmatch/:idTorneo/:idPartido', authentication.ensureAuth, matchController.editematch);
match.delete('/deletematch/:idTorneo/:idPartido', authentication.ensureAuth, matchController.deletematch);
match.get('/partido/:idTorneo/:idPartido', authentication.ensureAuth, matchController.partido);
match.get('/matchs/:idTorneo', authentication.ensureAuth, matchController.matchs);

module.exports = match;