'use strict'

const Tournament = require('../models/tournament.model')
const Team = require('../models/team.model')
const Match = require('../models/match.model')

function match(req, res){
    var idTorneo = req.params.idTorneo;
    var params = req.body
    var matchModel = Match()
    
    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Match.find({$or:[
                {equipo1: params.equipo1,
                equipo2: params.equipo2}
            ]}).exec((err, part) =>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if (part.length>1){
                    return res.status(500).send({mesaje:"Ya existe ese partido"});
                }else{
                    Match.find({$or:[
                        {equipo1: params.equipo2,
                        equipo2: params.equipo1}
                    ]}).exec((err, part2) =>{
                        if (err) return res.status(500).send({mesaje:"Error en la petición"});
                        if (part.length>1){
                            return res.status(500).send({mesaje:"Ya existe ese partido"});
                        }else{
                            matchModel.torneo = idTorneo
                            matchModel.equipo1 = params.equipo1
                            matchModel.goles1 = 0
                            matchModel.equipo2 = params.equipo2
                            matchModel.goles2 = 0
                            matchModel.jugado = 'No'
                            matchModel.save((err, partido) =>{
                                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                                if(!partido) return res.status(500).send({mesaje: "Error al consultar el partido"}); 
                                return res.status(200).send(partido);
                            })
                        }
                    })
                }
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function editematch(req, res){
    var idTorneo = req.params.idTorneo;
    var idPartido = req.params.idPartido;
    var params = req.body

    var goles1 = 0, 
        goles2 = 0,
        golcon1 = 0,
        golcon2 = 0,
        difgol1 = 0,
        difgol2 = 0, 
        puntos1 = 0, 
        puntos2 = 0,
        partju1 = 0,
        partju2 = 0

    delete params.equipo1, params.equipo2;
    console.log(idPartido)
    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Match.findById(idPartido, (err, partfind) =>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if (partfind.jugado === 'No'){
                    Match.findByIdAndUpdate(idPartido, {$set: {
                        goles1: params.goles1,
                        goles12: params.goles2, 
                        jugado: 'Si'}}, (err, partido1)=>{
                        if (err) return res.status(500).send({mesaje:"Error en la petición"});
                        Match.findById(idPartido, (err, partido) =>{
                            if (err) return res.status(500).send({mesaje:"Error en la petición"});
                            Team.findById(partido.equipo1, (err, eq1) =>{
                                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                                Team.findById(partido.equipo2, (err, eq2) =>{
                                    if (err) return res.status(500).send({mesaje:"Error en la petición"});
                                    //Se setean los datos para el equipo uno
                                    goles1 = params.goles1 + eq1.golesfavor
                                    golcon1 = params.goles2 + eq1.golescontra
                                    difgol1 = goles1 - golcon1
                                    partju1 = 1 + eq1.partidosjugados

                                    //Se setean los datos para el equipo dos
                                    goles2 = params.goles2 + eq2.golesfavor
                                    golcon2 = params.goles1 + eq2.golescontra
                                    difgol2 = goles2 - golcon2
                                    partju2 = 1 + eq2.partidosjugados

                                    //Se determina el puntaje de cada equipo por el partido
                                    if (params.goles1 > params.goles2){
                                        puntos1 = 3 + eq1.puntos
                                        puntos2 = 0 + eq2.puntos
                                    }else{
                                        if (params.goles1 < params.goles2){
                                            puntos1 = 0 + eq1.puntos
                                            puntos2 = 3 + eq2.puntos
                                        }else{
                                            puntos1 = 1 + eq1.puntos
                                            puntos2 = 1 + eq2.puntos
                                        }
                                    }

                                    //Se actualizan los equipos
                                    Team.findByIdAndUpdate(partido.equipo1, {$set: {
                                        puntos: puntos1,
                                        golesfavor: goles1,
                                        golescontra: golcon1,
                                        diferenciagoles: difgol1,
                                        partidosjugados: partju1
                                    }}, (err, part1) =>{
                                        if (err) return res.status(500).send({mesaje: "Error al buscar el torneo1"});
                                        if (!part1) return res.status(500).send({mesaje: "Error al obtener el torneo"});
                                        Team.findByIdAndUpdate(partido.equipo2, {$set: {
                                            puntos: puntos2,
                                            golesfavor: goles2,
                                            golescontra: golcon2,
                                            diferenciagoles: difgol2,
                                            partidosjugados: partju2
                                        }}, (err, part2) =>{
                                            if (err) return res.status(500).send({mesaje: "Error al buscar el torneo"});
                                            if (!part2) return res.status(500).send({mesaje: "Error al obtener el torneo"}); 
                                            return res.status(200).send({part1, part2})
                                        }) 
                                    })
                                })
                            })
                        })
                    })
                }else{
                    return res.status(200).send({mesaje: 'El partido ya fue jugado'})
                }
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function deletematch(req, res){
    var idTorneo = req.params.idTorneo;
    var idPartido = req.params.idPartido;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            var partidosporcrear = torneo.partidosajugar+1
                Tournament.findByIdAndUpdate(idTorneo, {$set:{
                    partidosajugar: partidosporcrear
                }}, (err, torneoactual)=>{
                    if (err) return res.status(500).send({mesaje: "Error al buscar el torneo"});
                    Match.findByIdAndDelete(idPartido, (err, partido)=>{
                        if (err) return res.status(500).send({mesaje:"Error en la petición"});
                        if(!partido) return res.status(500).send({mesaje: "Error al consultar el partido"}); 
                        return res.status(200).send(partido);
                    })
                })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function partido(req, res){
    var idTorneo = req.params.idTorneo;
    var idPartido = req.params.idPartido;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Match.findById(idPartido, (err, partido)=>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if(!partido) return res.status(500).send({mesaje: "Error al consultar el partido"}); 
                return res.status(200).send({partido});
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

function matchs(req, res){
    var idTorneo = req.params.idTorneo;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje:"Error en la petición"});
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Match.find({$or: [
                {torneo: idTorneo}
            ]}).exec((err, partidos)=>{
                if (err) return res.status(500).send({mesaje:"Error en la petición"});
                if(!partidos) return res.status(500).send({mesaje: "Error al consultar el partido"}); 
                return res.status(200).send({partidos});
            })
        }else{
            return res.status(500).send({mesaje: "No tienes los permisos necesarios"})
        }
    })
}

module.exports = {
    match,
    editematch,
    deletematch,
    partido,
    matchs
}