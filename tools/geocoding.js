/**
 * Created by DELL on 2/2/2017.
 */
var { createUuid } = require('./tools')
var { Locations } = require('../models/index')

const PI = 3.141592
let radians = function(angle){
  return angle / (180 / PI)
}

const MAX_DIST = 5
let dist = function(from, to) {
  return 6371 * Math.acos( Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.cos(radians(to.lng) - radians(from.lng)) + Math.sin(radians(from.lat)) * Math.sin(radians(to.lat)) );
}
let getOrAddLocation = (loc) =>
  new Promise(
    (resolve, reject) =>
      // Locations.find({where: {lng : loc.lng, lat : loc.lat}})
        Locations.findAll({})
        .then((locations) => {
            let createNew = true
            let lngStr = loc.lng.toString()
            let latStr = loc.lat.toString()
            var minDistance = locations ? dist(locations[0], loc) : MAX_DIST;
            var candiIndex = 0;
            for(i = 0; locations && i < locations.length; i++){
              let origLng = locations[i].lng;
              let origLat = locations[i].lat;
              var distance = dist(loc, locations[i]);
              if(distance < minDistance){
                minDistance = distance;
                candiIndex = i;
              }
            }
            if(minDistance < MAX_DIST){
              createNew = false;
            }
            if(createNew == true){
              loc.id = createUuid()
              Locations.create(loc)
                .then((result) => resolve(result))
                .catch((err) => reject(err))
            }
            else{
              var newLoc = {}
              newLoc.lng = loc.lng
              newLoc.lat = loc.lat
              if(loc.arabicName)
                newLoc.arabicName = loc.arabicName
              if(loc.englishName)
                newLoc.englishName = loc.englishName
              var location = locations[candiIndex]
              if(minDistance == 0)
                location.update(newLoc)
                .then((location) => resolve(location))
                .catch((err) => reject(err))
              else
                resolve(location)
            }
        })
        .catch((err) => reject(err))
  )

let getOrAddLocations = (from, to) =>
  new Promise(
    (resolve, reject) => {
      let results = []
      getOrAddLocation(from)
        .then((locFrom) => {
          results[0] = locFrom;
          getOrAddLocation(to)
            .then((locTo) => {
              results[1] = locTo
              resolve(results)
            })
            .catch((err) => reject([err.message]))
        })
        .catch((err) => reject([err.message]))
    }
  )
module.exports = {getOrAddLocations}