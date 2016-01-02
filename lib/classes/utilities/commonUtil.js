
'use strict';

var md5 = require('MD5');
function commonUtil() {
};

    /**
     * @description Get the request client IP address
     * @param {object} req The http request
     * @return {string} The client ip address
     * @static
     */
commonUtil.getClientIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
};

commonUtil.tryToConvertToJSONQuery = function (input) {
    var query = require('querystring');
    try {
        return query.parse(input);
    }
    catch (ex) {
        return input;
    }
};

commonUtil.tryToConvertToJSON = function (input) {
    try {
        return JSON.parse(input);
    }
    catch (ex) {
        return new commonUtil.tryToConvertToJSONQuery(input);
    }
};

commonUtil.tryToConvertToMD5 = function (input) {
    try {
        return md5(input);
    }
    catch (err) {
        return input;
    }
};

module.exports = commonUtil;