/**
 * @author Mino Togna
 */
var EventBus = require('../../event/event-bus')
var Events   = require('../../event/events')

var Sensors = require('./sensors')

// var all    = []
var active = {}

var TYPES = {
  MOSAIC            : 'MOSAIC'
  , CLASSIFY        : 'CLASSIFY'
  , CHANGE_DETECTION: 'CHANGE-DETECTION'
}

// var getAll = function () {
//   return all
// }

var getActive = function () {
  return active
}

var isActive = function (id) {
  return id === active.id
}

var activeModelChange = function (e, obj, params) {
  active = obj
  EventBus.dispatch(Events.SECTION.SEARCH.STATE.ACTIVE_CHANGED, null, active, params)
}

module.exports = {
  
  // getAll     : getAll
   getActive: getActive
  , isActive : isActive
  
  , getSensorGroups: function () {
    return Object.keys(Sensors)
  }
  , getSensors     : function (sensorGroup) {
    return Sensors[sensorGroup]
  }
  
  , TYPES: TYPES
}

EventBus.addEventListener(Events.SECTION.SEARCH.STATE.ACTIVE_CHANGE, activeModelChange)
