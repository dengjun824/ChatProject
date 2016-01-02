/**
 * @fileoverview Provides the methods to handle the log and error for each http request.
 *               All functions, vars are static for usage
 * @version 
 * @author 
 * @modifier 
 * @desc Usage Example:
 *       var eventHandler = require('./eventHandler');
 *       eventHandler.handleRequest(request);
 */
'use strict';

/* the public module reference */

//var trace = require('./../../mongo/trace');
var commonUtil = require('./../utilities/commonUtil');

/**
 * @description eventHandler module, provide the handleRequest and handleException functions
 * @constructor
 */
function eventHandler() {
}

//if one request url do not need to be traced, add it to exceptURLs
eventHandler.exceptURLs = [
'/login.html',
'/usercheck',
'/favicon.ico'
];

/**
 * @description Handle the http request
 * @param {object} req The http request
 * @static
 */
eventHandler.handleRequest = function (req) {
    if (req.url.indexOf('/js/') >= 0 ||
        req.url.indexOf('/angularjs/') >= 0 ||
        req.url.indexOf('/css/') >= 0 ||
        req.url.indexOf('/images/') >= 0 ||
        req.url.indexOf('/fonts/') >= 0 ||
        req.url.indexOf('/socket.io/') >= 0) {
        return;
    } else if (eventHandler.exceptURLs.indexOf(req.url) >= 0) {
        return;
    } else {
        var ignore = false;
        if (req.url.indexOf('/searchinmongo') == 0 ||
            req.url.indexOf('/addinmongo') == 0 ||
            req.url.indexOf('/removeinmongo') == 0) {
            //ignore to trace log for access InternalLogs/InternalErrors/DllExceptions/IDSLogs
            if (req.body && req.body.Collection && req.body.Collection.length > 0) {
                if (req.body.Collection == 'InternalLogs' ||
                    req.body.Collection == 'InternalErrors' ||
                    req.body.Collection == 'DllExceptions' ||
                    req.body.Collection == 'IDSLogs' ||
                    req.body.Collection == 'Logs')
                    ignore = true;
            }
        }
        if (!ignore) {
            //var eventTrace = new trace();
            //var log = {
            //    Type: trace.TraceType.Info,
            //    Action: req.url,
            //    ClientIP: commonUtil.getClientIp(req),
            //    Data: req.body ? JSON.stringify(req.body).replace('$', '') : null,
            //    Message: '[HTTP ' + req.method + '] http request arrived...'
            //};
            //eventTrace.trackLog(log);
        }
        console.log('INFO: [HTTP ' + req.method + '] - received request from URL[' + req.url + ']');
    }
};

/**
 * @description Handle the http errors
 * @param {object} err The http error
 * @param {object} req The http request
 * @param {function(err)} callback The call back function reference
 * @static
 */
eventHandler.handleException = function (err, req, callback) {
    //var eventTrace = new trace();
    //var error = {
    //    Type: trace.TraceType.Exception,
    //    Action: req.url,
    //    ClientIP: commonUtil.getClientIp(req),
    //    Data: req.body ? JSON.stringify(req.body).replace('$', '') : null,
    //    Exception: err
    //};
    //eventTrace.trackError(error);
    console.log("ERROR: [HTTP " + req.method + "] - xChanger has detected an exception: " + err);
    if (callback) callback(err);
};

module.exports = eventHandler;