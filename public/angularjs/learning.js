//function MyController($scope, $timeout) {
//    var updateClock = function () {
//        $scope.clock = new Date();
//        $timeout(function () {
//            updateClock();
//        }, 1000);
//    }
//    updateClock();
//}


//demo 1
/*
angular.module("myApp", []).controller('MyController', function ($scope, $parse, $interpolate) {
    $scope.clock = { now: new Date() };
    var updateClock = function () {
        $scope.clock.now = new Date();
    };
    setInterval(function () {
        $scope.$apply(updateClock);
    }, 1000);
    updateClock();

    $scope.$watch('expr', function (newVal, oldVal, scope) {
        if (newVal !== oldVal) {
            var parseFun = $parse(newVal);
            $scope.parseValue = parseFun(scope);
        }
    });

    $scope.$watch('emailBody', function (body) {
        if (body) {
            var template = $interpolate(body);
            $scope.previewText = template({ to: $scope.to });
        }
    });
});
*/

//demo 2
/*
angular.module('myApp', [])
.run(function ($rootScope) {
    // 使用.run访问$rootScope
    $rootScope.rootProperty = 'root scope';
})
.controller('ParentController', function ($scope) {
    // 使用.controller访问`ng-controller`内部的属性
    // 在DOM忽略的$scope中，根据当前控制器进行推断
    $scope.parentProperty = 'parent scope';
})
.controller('ChildController', function ($scope) {
    $scope.childProperty = 'child scope';
    // 同在DOM中一样，我们可以通过当前$scope直接访问原型中的任意属性
    $scope.fullSentenceFromChild = 'Same $scope: We can access: ' +
    $scope.rootProperty + ' and ' +
    $scope.parentProperty + ' and ' +
    $scope.childProperty
});
*/


//demo 3
/*
angular.module('myApp', [])
.directive('myDirective', function () {
    $('body').find('.abc').attr('href','www.baidu.com').attr('id','1234').attr('name','asdf');
    return {
        restrict: 'A',
        replace: true,
        scope: {
            myUrl: '=someAttr', // 经过了修改
            myLinkText: '@'
        },
        template: '<div><label>My Url Field:</label><input type="text"ng-model="myUrl" /><a href="{{myUrl}}">{{myLinkText}}</a></div>'
    };
});
*/



//demo 4
/*
angular.module('myApp', [])
.controller('SomeController', function ($scope) {
    // 反模式，裸值
    $scope.someBareValue = 'hello computer';
    // 设置 $scope 本身的操作，这样没问题
    $scope.someAction = function () {
        // 在SomeController和ChildController中设置{{ someBareValue }}
        $scope.someBareValue = 'hello human, from parent';
    };
})
.controller('ChildController', function ($scope) {
    $scope.childAction = function () {
        // 在ChildController中设置{{ someBareValue }}
        $scope.someBareValue = 'hello human, from child';
    };
});
*/

//demo 5
/*
angular.module('myApp', [])
.controller('PeopleController', function ($scope) {
    $scope.people = [
    { name: "Ari", city: "San Francisco" },
    { name: "Erik", city: "Seattle" }
    ];
});
*/

//demo 6
/*
angular.module('myApp', [])
.controller('FormController', function ($scope) {
    $scope.fields = [
    { placeholder: 'Username', isRequired: true },
    { placeholder: 'Password', isRequired: true },
    { placeholder: 'Email (optional)', isRequired: false }
    ];
    $scope.submitForm = function () {
        alert("it works!");
    };
});
*/

//demo 7
/*
angular.module('myApp', [])
.controller('FormController', function ($scope) {
    $scope.person = {
        name: null
    };
    $scope.people = [];
    $scope.submit = function () {
        if ($scope.person.name) {
            $scope.people.push({ name: $scope.person.name });
            $scope.person.name = '';
        }
    };
});
*/

//demo 8
/*
angular.module('myApp', [])
.directive('myDirective', function () {
    return {
        restrict: 'A',
        scope: true  //false
    };
}).controller('SomeController', function ($scope) {
    // 可以留空，但需要被定义
})
.controller('SecondController', function ($scope) {
    // 同样可以留空
});
*/

//demo 9
/*
angular.module('myApp', [])
.directive('myDirective', function () {
    return {
        restrict: 'A',
        template: 'Inside myDirective, isolate scope: {{ myProperty }}',
        scope: {},
        link: function (scope) {
            scope.myProperty = scope.$parent.myProperty;
        }
    };
})
.directive('myInheritScopeDirective', function () {
    return {
        restrict: 'A',
        template: 'Inside myDirective, isolate scope: {{ myProperty }}',
        scope: true
    };
});
*/

//demo 10
/*
angular.module('myApp', ['myApp.service'])
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('myInterceptor');
})
.controller('myController', function ($scope, testService) {
    var a = 2.2 % 0.5;
    $scope.name = testService.getName(a);
});
*/

angular.module('myApp',[])
    .directive('accordion', function() {
        return{
            restrict: 'EA',
            replace: true,
            transclude: true,
            template: '<div ng-transclude></div>',
            controller: function(){
                var expanders = [];
                this.gotOpened = function(selectExpander) {
                    angular.forEach(expanders, function(expander){
                        if(selectExpander != expander){
                            expander.showMe = false;
                        }
                    });
                }

                this.addExpander = function(expander){
                    expanders.push(expander);
                }
            }
        };
    })
    .directive('expander', function(){
        return{
            restrict: 'EA',
            replace: true,
            transclude: true,
            require: '?^accordion',  //using accordion controller content
            scope: {title: '=expanderTitle'},
            template: '<div>\
            <div class="title" ng-click ="toggle()">{{title}}</div>\
            <div class="body" ng-show="showMe" ng-transclude></div>\
        </div>',
            link: function (scope, element, attrs, accordionController) {
                scope.showMe = false;
                accordionController.addExpander(scope);
                scope.toggle = function () {
                    if (!scope.showMe) {
                        scope.showMe = !scope.showMe;
                        accordionController.gotOpened(scope);
                    }
                    else {
                        scope.showMe = !scope.showMe;
                    }
                }
            }
        }
    })
    .controller('SomeController', function($scope){
        $scope.expanders = [
            {title: 'Click me to expand',
                text: 'Hi there folks, I am the content that was hidden but is now shown'},
            {title: 'Click this',
                text: 'I am even better text than you have seen previously'},
            {title: 'No, click me',
                text: 'I am text that should be seen before seeing other texts'}
        ] ;
    })
    .directive('pmsText', function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: { ngModel: '=' },
            require: '^ngModel',
            template: '<input type="text" />',
            link: function (scope, element, attrs, value) {
                //angular.element(element[0]).attr('id', '1234');
                //element.prop('id', '1234');
                //attrs.$set('ng-show', false);
                //attrs.$set('required','required');
                element.attr('required','required');
                attrs.$set('id', 12345);
                //element[0].prop('ng-required', 'true');
                //$compile(element)(scope);
                //$compile(element.attr('ng-required', 'true'))(scope)
            },
            //compile: function (tEle, tAttr, transclude) {
            //    tEle.attr("ng-required", true);
            //    var fn = $compile(tEle);
            //    return function (scope) {
            //        fn(scope);
            //    }
            //    //return {
            //    //post: function (scope, iEle, iAttr, controller) {
            //    //    iAttr.$set('required', true);
            //    //    iAttr.$set('id', 12345);
            //    //},
            //    //pre: function (scope, iEle, iAttr, controller) {
            //    //    iAttr.$set('ng-required', true);
            //    //    iAttr.$set('id', 12345);
            //    //}
            //    //}
            //}
        }
    })

var a = 10;
add(a);
function add(number) {
    number++;
}
console.log(a);