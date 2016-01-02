


'use strict';

var fs = require('fs');
var path = require('path');
var mime = require('mime');
var url = require('url');

var eventHandler = require('./../classes/handlers/eventHandler');
var sessionManager = require('./session');

var postObject = [];
var getObject = [];

function processGetRequest(request, response) {
    eventHandler.handleRequest(request);

    var filePath = url.parse(request.url).pathname;
    if (getObject[filePath]) {
        getObject[filePath](request, response);
    }
    else {
        if (path.extname(filePath).length > 1) {
            renderPage(request, response, null);
        } else {
            console.log('ERROR: [mainFunctions.processGetRequest()] - This request route[' + request.url + '] not been defined!');
            sendHttpError(400, request, response);
        }
    }
};

function processPostRequest(request, response, body) {
    if (body) {
        request.body = body;
    }
    eventHandler.handleRequest(request);
    if (postObject[request.url]) {
        postObject[request.url](request, response);
    }
    else {
        sendHttpError(400, request, response);
    }
};

function sendHttpError(errCode, request, response) {
    sessionManager.syncSession(request, response);
    response.statusCode = errCode;
    response.end();
};

function renderHtml(request, response, html) {
    sessionManager.syncSession(request, response);
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(html ? html : '');
};

function renderData(request, response, data) {
    sessionManager.syncSession(request, response);
    response.writeHead('200', { 'Content-Type': 'application/json' });
    response.end(data ? ('object' == typeof data ? JSON.stringify(data) : data) : '');
};

function renderPage(request, response, data) {
    try {
        var filePath = url.parse(request.url).pathname;
        if (filePath.indexOf('.html') > 0) {
            filePath = 'public/views' + filePath;
        }
        else if (filePath == '/') {
            filePath = 'public/index.html';
        }
        else {
            filePath = 'public' + filePath;
        }
        var abstractPath = './' + filePath;
        fs.exists(abstractPath, function (exists) {
            if (exists) {
                var content = fs.readFileSync(abstractPath);
                if (content) {
                    var contentType = mime.lookup(path.basename(filePath));
                    if (contentType == 'text/html') {
                        sessionManager.syncSession(request, response);
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.write(parsePageContent(content, data));
                    } else {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.write(content);
                    }
                    response.end();
                } else {
                    sendHttpError(404, request, response);
                }
            } else {
                sendHttpError(404, request, response);
            }
        });
    }
    catch (err) {
        console.log('ERROR: [mainFunctions.renderPage] - exception raised while render page: ' + err);
        eventHandler.handleException(err, request, function (error) {
            sendHttpError(404, request, response);
        });
    }
};

//if html file include <%= %> tag, replace it with the value from 'data' param
function parsePageContent(content, data) {
    var str = content.toString();
    if (data) {
        try {
            if ('string' === typeof data) data = JSON.parse(data);
            for (var key in data) {
                var reg = new RegExp('\\<\\%\\s*=\\s*' + key + '\\s*\\%\\>', 'img');
                str = str.replace(reg, data[key].toString());
            }
        } catch (err) {
            console.log('ERROR: [mainFunctions.parsePageContent] - exception raised while parse the page content before render: ' + err);
        }
    }
    return str;
};

function serverManager(request, response) {
    try {
        if (request.method == 'GET') {
            processGetRequest(request, response);
        }
        else if (request.method == 'POST') {
            var body = '';
            request.on('data', function (data) {
                body += data;
            });
            request.on('end', function () {
                var common = require('./../classes/utilities/commonUtil');
                processPostRequest(request, response, (body.length > 0 ? common.tryToConvertToJSON(body) : null));
            });
        } else {
            sendHttpError(400, request, response);
        }
    }
    catch (err) {
        eventHandler.handleException(err, request, function (error) {
            sendHttpError(404, request, response);
        });
    }
};


function addToPost(route, callback) {
    postObject[route] = callback;
};

function addToGet(route, callback) {
    getObject[route] = callback;
};

exports.manager = serverManager;
exports.post = addToPost;
exports.get = addToGet;
exports.render = renderPage;
exports.renderHtml = renderHtml;
exports.renderData = renderData;
