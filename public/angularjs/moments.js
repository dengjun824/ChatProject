
var momentsMgr = angular.module('momentsApp', ['angular-socket']);
momentsMgr.config(function ($socketProvider) {
    $socketProvider.setConnectionUrl('http://localhost:1234');
});

momentsMgr.controller('momentsController', ['$scope', '$http', '$socket', function ($scope, $http, $socket) {
    $scope.content = {
        data: []
    };

    $scope.comments = {
        title: '',
        content: ''
    };

    $socket.on('momentDataResponse', function (data) {
        $scope.content.data.length = 0;
        if (data && data.length > 0 && angular.isArray(data)) {
            for (var i = 0; i < data.length ; i++) {
                $scope.content.data.push(data[i]);
            }
        }
    });

    $socket.emit("momentDataRequest", null);

    $scope.openComments = function (moment) {
        $scope.comments.title = moment.author;
        $scope.comments.id = moment._id;
        $(".modal").modal('show').on('show.bs.modal', function () {

        });
    };

    $scope.postComments = function () {
        var config = {
            url: '/savecomments',
            method: 'post',
            data: {
                id: $scope.comments.id,
                content: $scope.comments.content
            }
        };

        $http(config).success(function (data, status, headers, config) {
            $('.modal').modal('hide');
            window.location.reload();
            //$('#' + data).removeClass().addClass('arrow-up');
        }).error(function (data, status, headers, config) {
            alert('error');
        });
    };

    $scope.toggle = function (id) {
        $('#' + id).parent().children('.comments').collapse('toggle');
        if ($('#' + id).hasClass('arrow-down')) {
            $('#' + id).removeClass().addClass('arrow-up');
        }
        else {
            $('#' + id).removeClass().addClass('arrow-down');
        }
    };

    $('.comments').click(function () {

    });
}]);
