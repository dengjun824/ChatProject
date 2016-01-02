

var loginMgr = angular.module('loginApp', []);
loginMgr.inject = ['$scope', '$http'];
loginMgr.controller('loginController', function ($scope, $http) {
    $scope.postLogin = function () {
        $scope.handlingTip = {
            message: 'Logining......',
            isVisible: true
        };

        var config = {
            url: '/logincheck',
            method: 'post',
            data: {
                account: $scope.login.account,
                password: $scope.login.password
            }
        };

        $scope.spinner.show();

        $http(config).success(function (data, status, headers, config) {
            //hide tip message
            $scope.handlingTip.isVisible = false;
            if (data && data == 'true') {
                window.location.href = 'index.html';
            } else {
                $scope.handlingTip = {
                    message: 'Login failed, it might be the Account and Password are not matched!',
                    isVisible: true
                };
            }
            //       
            $scope.spinner.clear();
        }).error(function (data, status, headers, config) {
            $scope.handlingTip = {
                message: 'Error raised while submit the user login request, please try again!',
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

    $scope.goRegister = function () {
        window.location.href = 'register.html';
    };
});


