'use strict'

const Tournament = require("../models/tournament.model");
const Team = require('../models/team.model')
const Match = require('../models/match.model')

function createtorneo(req, res){
    var tournamentModel = Tournament();
    var params = req.body;

    if (params.nombre === " "){
        res,status(500),send({mesaje: "Debes ponerle un nombre al torneo"})
    }else{
        tournamentModel.nombre = params.nombre;
        tournamentModel.creador = req.user.sub;
        tournamentModel.equipos = []
        tournamentModel.cantequipos = 0;
        tournamentModel.jornadas = 0;
        tournamentModel.save((err,savetorneo)=>{
            if (err) return res.status(500).send({mesaje:"Error en la petición"});
            //Se crea el torneo con exito
            if(savetorneo){
                return res.status(200).send({savetorneo})
            }
        })
    }
}

function edittorneo(req, res){
    var idTorneo = req.params.idTorneo;
    var params = req.body;

    delete params.creador, params.equipos, params.cantequipos, params.jornadas;
    //Se buscar el torneo a editar
    Tournament.findById(idTorneo, (err, torneo)=>{
        if (err) return res.status(500).send({mesaje: "Error en la petición"});
        if (!torneo) return res.status(500).send({mesaje: "No existe ese torneo"});
        //Se verifica si lo va a editar un Administrador o el creador
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Tournament.findByIdAndUpdate(idTorneo, params, {new:true}, (err, updateTorneo)=>{
                if (err) return res.status(500).send({mesaje: "Error en la petición al actualizar"});
                if (!updateTorneo) return res.status(500).send({mesaje: "No se pudo el torneo"});
                return res.status(200).send({updateTorneo});
            })
        }else{
            return res.status(500).send({mesaje: "No posees los permisos necesarios"});
        }
    })
}

function deletetorneo(req, res){
    var idTorneo = req.params.idTorneo;

    Tournament.findById(idTorneo, (err, torneo)=>{
        if(err) return res.status(500).send({mesaje:"Error en la petición al eliminar"});
        //Se busca el torneo y se verifica si un Administrador o el creador de este lo va a eliminar
        console.log(torneo.creador)
        if (req.user.rol === 'Admin' || req.user.sub == torneo.creador){
            Tournament.findByIdAndDelete(idTorneo, (err, deletedtorneo)=>{
                if(err) return res.status(500).send({mesaje:"Error en la petición al eliminar"});
                if(!deletedtorneo) return res.status(500).send({mesaje:"Error al eliminar el torneo"});
                Team.deleteMany({torneo: idTorneo}, (err, equipos)=>{
                    Match.deleteMany({torneo: idTorneo}, (err, partidos)=>{
                        return res.status(200).send({mesaje: "Se a logrado eliminar con exito"});
                    })
                })
            })
        }else{
            return res.status(500).send({mesaje: "No posees los permisos necesarios"});
        }
    })
}

function torneo(req, res){
    var idTorneo = req.params.idTorneo;

    Tournament.findById(idTorneo, (err, torneo) =>{
        if(err) return res.status(500).send({mesaje:"Error en la petición al eliminar"});
        if(!torneo) return res.status(500).send({mesaje:"Error al eliminar el torneo"});
        return res.status(200).send({ torneo });
    })
}

function torneos(req, res){
    if (req.user.rol === 'Admin'){
        //Muestra todos los torneos por ser Administrador
        Tournament.find((err, torneos)=>{
            return res.status(200).send({torneos})
        })
    }else{
        //Busca los torneos creados por el usuario
        Tournament.find({$or:[
            {creador: req.user.sub}
        ]}).exec((err, torneos)=>{
            if (torneos && torneos.length>=1){
                return res.status(200).send({torneos})
            }else{
                return res.status(200).send({mesaje: 'No has creado ningún torneo aún'})
            }
        })
    }
}

module.exports = {
    createtorneo,
    edittorneo,
    deletetorneo,
    torneo,
    torneos
}