
var socketManager = function (sockets, callback) {
    sockets.on('momentDataRequest', function (params) {
        var mongoCommon = require('./../mongo/mongoCommon');
        var mongo = new mongoCommon();
        var collection = 'postMessage';
        var queryFilter = {
            collection: collection,
            limit: -1,
            sorts: { postDate: -1 }
        };
        mongo.selectData(queryFilter, function (result) {
            sockets.emit('momentDataResponse', result.content);
        });
    });

    var client = {
        color: getColor(),
        name: ''
    };
    sockets.on('sendMessage', function (params) {
        //client.name = params.author;
        var mongoCommon = require('./../mongo/mongoCommon');
        var mongo = new mongoCommon();
        var collection = 'chat';
        var input = {
            from: client.name,
            date: new Date(),
            message: params.message
        };
        var returnData = {
            color: client.color,
            author: client.name,
            message: input.message,
            time: getTime()
        };
        mongo.saveData(collection, input, function (saveResult) {
            if (saveResult.status) {
                sockets.emit('receiveMessage', returnData);
                sockets.broadcast.emit('receiveMessage', returnData);
            }
        });
    });

    sockets.on('disconnect', function () {
        var obj = {
            time: getTime(),
            color: client.color,
            author: 'System',
            text: client.name,
            type: 'disconnect'
        };
        if (client.name) {
            sockets.emit('systemMessage', obj);
            sockets.broadcast.emit('systemMessage', obj);
        }
    });

    sockets.on('joinChat', function (params) {
        client.name = params;
        var obj = {
            time: getTime(),
            color: client.color,
            author: 'System',
            text: params,
            type: 'welcome'
        };
        sockets.emit('systemMessage', obj);
        sockets.broadcast.emit('systemMessage', obj);
    });

    if (callback) callback();
};

var getColor = function () {
    var colors = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'pink', 'red', 'green',
                  'orange', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue'];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
}

var getTime = function () {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

exports.startSocket = socketManager;