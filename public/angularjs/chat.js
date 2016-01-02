

var chatMgr = angular.module('chatApp', ['angular-socket']);
chatMgr.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://16.155.250.48:1234');
});

chatMgr.controller('chatController', ['$scope', '$http', '$socket', function ($scope, $http, $socket) {
    $scope.postChatMes = function () {
        if (!$scope.chatMessage) {
            return;
        }
        var params = {
            //author: $('#userAccount').val(),
            message: $scope.chatMessage
        };

        $socket.emit('sendMessage', params);
        $scope.chatMessage.val('');
    };

    //receive other user message
    $socket.on('receiveMessage', function (json) {
        var p = '<p><span style="color:' + json.color + ';">' + json.author + '</span> @ ' + json.time + ' : ' + json.message + '</p>';
        $('#chatContent').append(p);
    });

    //receive system message
    $socket.on('systemMessage', function (json) {
        var p = '';
        if (json.type === 'welcome') {
            p = '<p style="background:' + json.color + '">system @ ' + json.time + ' : ' + json.text + ' Join the Dialog</p>';
        } else if (json.type === 'disconnect') {
            p = '<p style="background:' + json.color + '">system @ ' + json.time + ' : ' + json.text + ' Leave the Dialog</p>';
        }
        $('#chatContent').append(p);
    });

    $socket.emit('joinChat', $('#userAccount').val());
}]);
