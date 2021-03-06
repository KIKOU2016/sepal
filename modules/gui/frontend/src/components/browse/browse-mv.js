/**
 * @author Mino Togna
 */

var EventBus     = require( '../event/event-bus' )
var Events       = require( '../event/events' )
var Loader       = require( '../loader/loader' )
var View         = require( './browse-v' )
var Model        = require( './browse-m' )
var FileDownload = require( '../file-download/file-download' )

var show = function ( e, type ) {
    
    if ( type == 'browse' ) {
        View.init()
        loadDir( -1, '/' )
    }
    
}

var loadDir = function ( parentLevel, name ) {
    var path   = Model.absolutePath( parentLevel, name )
    var level  = parentLevel + 1
    var params = {
        url      : '/api/user/files'
        , data   : { path: path }
        , success: function ( response ) {
            // console.log( response )
            Model.setLevel( level, name, response )
            View.addDir( Model.getLevel( level ) )
        }
    }
    EventBus.dispatch( Events.AJAX.REQUEST, null, params )
}

var navItemClick = function ( evt, parentLevel, file ) {
    //child.name
    if ( file.isDirectory === true ) {
        loadDir( parentLevel, file.name )
    } else {
        View.removeDir( parentLevel + 1 )
    }
    
}

var downloadItem = function ( evt, absPath ) {
    FileDownload.download( '/api/user/files/download', { path: absPath } )
}

var deleteItem = function ( evt, parent , child ) {
    var absPath = Model.absolutePath( parent.level , child.name )
    absPath = encodeURIComponent( absPath )
    
    var params = {
        url         : '/api/user/files/'+absPath
        , beforeSend: function (  ) {
            Loader.show()
        }
        , success   : function ( response ) {
            Loader.hide()
            loadDir( parent.level -1, parent.name )
        }
    }
 
    EventBus.dispatch( Events.AJAX.DELETE, null, params )
}

EventBus.addEventListener( Events.SECTION.SHOW, show )
EventBus.addEventListener( Events.SECTION.BROWSE.NAV_ITEM_CLICK, navItemClick )
EventBus.addEventListener( Events.SECTION.BROWSE.DOWNLOAD_ITEM, downloadItem )
EventBus.addEventListener( Events.SECTION.BROWSE.DELETE_ITEM, deleteItem )