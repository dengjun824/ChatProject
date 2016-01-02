

var postMgr = angular.module('postApp', []);
postMgr.inject = ['$http', '$scope'];
postMgr.controller('postController', function ($scope, $http) {
    $scope.postInfo = function () {
        if (!$scope.postContent) {
            $scope.handlingTip = {
                message: 'Send failed, please enter the idea!',
                isVisible: true
            };
            return;
        }

        $scope.handlingTip = {
            message: 'Sending......',
            isVisible: true
        };

        var config = {
            url: '/savepostinfo',
            method: 'post',
            data: {
                content: $scope.postContent,
                postDate: new Date()
            }
        };

        $scope.spinner.show();

        $http(config).success(function (data, status, headers, config) {
            if (data && data == 'true') {
                $scope.handlingTip = {
                    message: 'Sending Success',
                    isVisible: true
                };
            }
            else {
                $scope.handlingTip = {
                    message: 'Send failed, please enter the idea!',
                    isVisible: true
                };
            }
            $scope.spinner.clear();
        }).error(function (data, status, headers, config) {
            $scope.handlingTip = {
                message: 'Send failed, it might be the service is down!',
                isVisible: true
            };
            $scope.spinner.clear();
        });
    };

    $scope.handlingTip = {
        message: '',
        isVisible: false
    };

    $scope.spinner = {
        show: function () {
            if (typeof (showSpin) == 'function')
                showSpin();
        },
        clear: function () {
            if (typeof (clearSpin) == 'function')
                clearSpin();
        }
    };

    $('#content').focus(function () {
        $scope.handlingTip = {
            message: '',
            isVisible: false
        };
    });
});