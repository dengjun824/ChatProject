

var registerMgr = angular.module('registerApp', []);
registerMgr.inject = ['$scope', '$http'];
registerMgr.controller('registerController', function ($scope, $http) {
    $scope.postRegister = function () {
        if ($scope.register.password != $scope.register.confirmpwd) {
            $scope.handlingTip = {
                message: 'Please Checked the Password',
                isVisible: true
            };
            return;
        }
        else {
            $scope.handlingTip = {
                message: 'Register......',
                isVisible: true
            };
        }
        var config = {
            url: '/registercheck',
            method: 'post',
            data: {
                account: $scope.register.account,
                password: $scope.register.password,
                email: $scope.register.email,
                tel: $scope.register.tel,
            }
        };

        $scope.spinner.show();

        $http(config).success(function (data, status, headers, config) {
            //hide tip message
            $scope.handlingTip.isVisible = false;
            /*save user input in cookie*/
            if (data && data == 'true') {
                window.location.href = 'index.html';
            }
            else if (data == 'exist') {
                $scope.handlingTip = {
                    message: 'Register failed, the account has already existed!',
                    isVisible: true
                };
            }
            else {
                $scope.handlingTip = {
                    message: 'Register failed, it might be the register is not ready',
                    isVisible: true
                };
            }
            //       
            $scope.spinner.clear();
        }).error(function (data, status, headers, config) {
            $scope.handlingTip = {
                message: 'Error raised while submit the user register request, please try again!',
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

    $scope.goLogin = function () {
        window.location.href = 'login.html';
    };
});


