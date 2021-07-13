'use strict'

const Tournament = require("../models/tournament.model");
const Team = require('../models/team.model')
const Match = require('../models/match.model')


function createequipo(req, res){
    var idTorneo = req.params.idTorneo;
    var teamModel = Team()
    var params = req.body;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje: "Error al buscar el torneo"});
        if (!torneo) return res.status(500).send({mesaje: "Error al obtener el torneo"});
        //Se verfica que no hayan más de 10 equipos en cada torneo
        if (torneo.cantequipos<=9){
            //Se verifica que solo el creador del torneo o un Administrador vaya a agregar equipos
            if (req.user.rol === 'Admin' || torneo.creador == req.user.sub){
                teamModel.torneo = idTorneo;
                teamModel.nombre = params.nombre;
                teamModel.puntos = 0
                teamModel.golesfavor = 0
                teamModel.golescontra = 0
                teamModel.diferenciagoles = 0 
                teamModel.partidosjugados = 0
                teamModel.save((err, equipo) =>{
                    if (err) return res.status(500).send({mesaje:"Error en la petición"});
                    //Se crea el torneo con exito
                    if(equipo){
                        var equipos = torneo.cantequipos+1;
                        var jornadasu = equipos-1
                        var partidos = (equipos/2)*jornadasu
                        //Se actualiza la catidad de equipos en el torneo
                        Tournament.findByIdAndUpdate(idTorneo, {$set:{
                            cantequipos: equipos, 
                            jornadas: jornadasu, 
                            partidosajugar: partidos
                        }}, (err, torneoactual)=>{
                            if (err) return res.status(500).send({mesaje: "Error al buscar el torneo"});
                            if (!torneoactual) return res.status(500).send({mesaje: "Error al obtener el torneo"});
                            return res.status(200).send({mesaje: "Ya se creo el Torneo, ahora debes ingresar los equipos"})
                        })
                    }
                })
            }else{
                return res.status(500).send({mesaje: "No posees los permisos necesarios"});
            }
        }else{
            return res.status(200).send({mesaje: "Ya tienes el máximo de equipos por torneo"})
        }
    })
}

function editequipo(req, res){
    var idTorneo = req.params.idTorneo;
    var idEquipo = req.params.idEquipo;
    var params = req.body;

    delete params.torneo
    
    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.sub == torneo.creador || req.user.rol === 'Admin'){
            Team.findByIdAndUpdate(idEquipo, params, {new:true}, (err, equipo)=>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if(!equipo) return res.status(500).send({mesaje: "Error al consultar equipos"}); 
                return res.status(200).send({equipo});
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function deleteequipo(req, res){
    var idTorneo = req.params.idTorneo;
    var idEquipo = req.params.idEquipo;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Team.findByIdAndDelete(idEquipo, (err, equipofind)=>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if(!equipofind) return res.status(500).send({mesaje: "Error al consultar equipos"});
                Match.deleteMany({equipo1: idEquipo}, (err, eq1)=>{
                    Match.deleteMany({equipo2: idEquipo}, (err, eq2)=>{
                        return res.status(200).send(equipofind);
                    })
                })
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function equipo(req, res){
    var idTorneo = req.params.idTorneo;
    var idEquipo = req.params.idEquipo;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub === torneo.creador){
            Team.findById(idEquipo, (err, equipo)=>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if(!equipo) return res.status(500).send({mesaje: "Error al consultar equipos"});
                return res.status(200).send({ equipo })
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function equipos(req, res){
    var idTorneo = req.params.idTorneo;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.sub == torneo.creador || req.user.rol === 'Admin'){
            Team.find({$or: [
                {torneo: idTorneo}
            ]}).exec((err, equipos)=>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if(!equipos) return res.status(500).send({mesaje: "Error al consultar equipos"}); 
                return res.status(200).send({equipos});
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
    
}

module.exports = {
    createequipo,
    editequipo,
    deleteequipo,
    equipo,
    equipos
}