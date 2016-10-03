angular.module('leds', [])
    .controller('ledsController', function($scope) {
        var socket = io(); //  Socket.IO

        $scope.state = {}; // Create LED state object
        $scope.locked = true; // Disable view by default

        socket.on('connect', function () { // On connection established
            $scope.locked = false; // Enable view
            $scope.$apply(); // Re-render view
        });

        socket.on('disconnect', function () { // Hide everything on disconnect
            $scope.locked = true;
            $scope.$apply();
        });

        socket.on('tps:state:changed', function (status) { // Catch 'tps:state:changed' event
            $scope.state[status.name] = status.value == 0;
            $scope.$apply();
        });

        $scope.switch = function(name) { // Send inversed value of the 'state' variable
            socket.emit('web:state:changed', {name:name,value:$scope.state[name]? 1 : 0});
        }
    });