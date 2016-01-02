

var indexMgr = angular.module('indexApp', []);
indexMgr.inject = ['$http', '$scope'];
indexMgr.controller('indexController', function ($scope, $http) {
    $scope.tab = 1;

    $scope.selectTab = function (setTab) {
        $scope.tab = setTab;
        if ($scope.tab === 1) {
            $('#iframe_content').prop('src', 'post.html');
        }
        else if ($scope.tab === 2) {
            $('#iframe_content').prop('src', 'moments.html');
        }
        else if ($scope.tab === 3) {
            $('#iframe_content').prop('src', 'chat.html');
        }
    };

    $scope.isSelected = function (checkTab) {
        return $scope.tab === checkTab;
    };
});