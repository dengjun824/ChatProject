console.log('app begin');
var http = require('http');
var cluster = require('cluster');
var os = require('os');
var global = require('./globalVars');
var Chatserver = require('./lib/webserver/serverFunctions');
var sessionFactory = require('./lib/webserver/session');
//
if (false) { //cluster.isMaster

    //* create socket.io on MASTER level with the port /global.Sockets_Port/
    var io = require('socket.io')();
    io.on('connection', function (socket) {
        if (socket) {
            var socketsManager = require('./lib/webserver/socketsManager');
            socketsManager.startSocket(socket, function () {
                console.log('DEBUG: [app.cluster.socket] - the master started the Socket manager.');
            });
        } else {
            console.log('ERROR: [app.cluster.socket] - the socket.io not been connected from client to server.')
        }
    });
    io.listen(global.Sockets_Port);

    //* create workers as cpu numbers
    console.log('DEBUG: [app.cluster.master] - the master been started...');
    var numCPUs = os ? os.cpus().length : 1;
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        worker.on('error', function (err) {
            console.log('ERROR: [app.cluster.master] - the worker[' + worker.id + '] get error.' + err);
        });
    }
    cluster.on('exit', function (worker, code, signal) {
        //restart the worker again once the worker died
        console.log('ERROR: [app.cluster.master] - one worker[wid: ' + worker.id + '] died with the signal: ' + signal || code);
        cluster.fork();
    });

} else {
    //console.log('DEBUG: [app.cluster.worker] - the worker[' + cluster.worker.id + '] been started...');
    console.log('DEBUG: app has been started...');

    var io = require('socket.io')();
    io.on('connection', function (socket) {
        if (socket) {
            var socketsManager = require('./lib/webserver/socketsManager');
            socketsManager.startSocket(socket, function () {
                console.log('DEBUG: [app.cluster.socket] - the master started the Socket manager.');
            });
        } else {
            console.log('ERROR: [app.cluster.socket] - the socket.io not been connected from client to server.')
        }
    });
    //* socket port
    io.listen(global.Sockets_Port);

    //* Create server and listen the request
    var server = http.createServer(function (request, response) {
        sessionFactory.startSession(request, response, function () {
            request.sessionContext = this;
            Chatserver.manager(request, response);
        });
    });

    //* routing the request
    var routes = require('./lib/webserver/routes/routes');
    routes.Routes(Chatserver);

    server.listen(global.NodePort, function () {http://wow.178.com/201411/210324441164.html
        console.log('DEBUG: Server listening on port ' + global.NodePort.toString());
    });
}