'use strict'

//Variables globales
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

//Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cabeceras
app.use(cors());

//Importación de Rutas
const user_Routes = require('./src/routes/user.routes');
const tournament_Routes = require('./src/routes/tournament.route');
const team_Routes = require('./src/routes/team.route');
const match_Routes = require('./src/routes/match.route');

//Carga de Rutas
app.use('/api', user_Routes);
app.use('/api', tournament_Routes)
app.use('/api', team_Routes)
app.use('/api', match_Routes)


//Exportación de Rutas
module.exports = app;