    /**
     * @fileoverview Provides the methods to access the user session
     *               session been stored into cookies with encode
     * @version
     * @author 
     * @modifier 
     * @desc Usage Example:
     *       var sessionManager = require('./session');
     *       var logs = { Type: traceModule.TraceType.Info, Action: xxx, ClientIP: xxx, Data: xxx, Message: xxx }
     *       var traceInstance = new traceModule();
     *       traceInstance.trackLog(logs);
     */
'use strict';

    /**
     * @requires querystring
     */
var parse = require('querystring').parse;
var global = require('./../../globalVars');

    /**
     * @description Generate the new session object
     * @return {string} The session id
     * @private
     */
function genSID() {
    var time = new Date().getTime() + '';
    var id = 'xcsesn_' + (time).substring(time.length - 6) + '_' + (Math.round(Math.random() * 1000000));
    return id;
}

    /**
     * @description Provides the functions to access the session object, like: get values, set values, delete values, destory, etc
     * @param {object} sdata The session data
     * @param {object} response The response
     * @private
     */
var sessionContext = function (sdata, response) {
    this.id = sdata && sdata.id ? sdata.id : '';
    this.data = sdata;

    this.poke = function () {
        if (!this.data) {
            this.data = { id: genSID() };
        }
        this.data.timestamp = new Date();
    };

    this.destory = function () {
        this.data = null;
    };

    this.del = function (key) {
        delete this.data[key];
        this.poke();
    }

    this.set = function (key, value) {
        this.data[key] = value;
        this.poke();
    };

    this.get = function (key) {
        this.poke();
        return this.data[key];
    };
}

    /**
     * @description Start the session
     * @param {object} request 
     * @param {object} response
     * @param {function (req, res)} process The call back function
     * @public
     */
exports.startSession = function (request, response, callback) {
    var expire_time = global.Session_Timeout ? global.Session_Timeout * 60 * 1000 : 20 * 60 * 1000;
    var sdata = null;
    var cookies = parse(request.headers.cookie, '; ');
    // consider there are multi id/data from cookies since the previous post request pull-in.
    if (cookies && cookies['xcs.data'] && cookies['xcs.data'].length > 0) {
        if ('object' === typeof cookies['xcs.data']) {
            var list = cookies['xcs.data'];
            for (var i = 0; i < list.length; i++) {
                try {
                    var tmp = list[i] && list[i].length > 0 ? JSON.parse(decodeURI(list[i])) : null;
                    if (!tmp) continue;
                    if (!sdata) sdata = tmp;
                    else {
                        if (sdata.timestamp < tmp.timestamp) sdata = tmp;
                    }
                } catch (err) {
                    console.log('ERROR: [session] - exception raised while build the session from request. error: ' + err);
                    continue;
                }
            }
        } else {
            sdata = JSON.parse(decodeURI(cookies['xcs.data']));
        }
        if (!sdata || !sdata.timestamp || new Date() - sdata.timestamp > expire_time) {
            sdata = { id: sdata && sdata.id && sdata.id.length > 0 ? sdata.id : genSID(), timestamp: new Date() };
        }
    } else {
        sdata = { id: genSID(), timestamp: new Date() };
    }
    callback.call(new sessionContext(sdata, response), request, response);
};

exports.syncSession = function (request, response) {
    if (request.sessionContext) {
        if (request.sessionContext.data && request.sessionContext.data.timestamp)
            request.sessionContext.data.timestamp = new Date();
        response.setHeader('Set-Cookie', ['xcs.data=' + encodeURI(JSON.stringify(request.sessionContext.data))]);
    }
};