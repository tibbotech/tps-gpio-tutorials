angular.module('leds', [])
    .controller('ledsController', function($scope) {
        var socket = io(); // Socket.IO

        $scope.locked = true; // Disable view by default

        socket.on('connect', function () { // On connection established
            $scope.locked = false; // Enable view
            $scope.$apply(); // Re-render view
        });

        socket.on('disconnect', function () { // Hide everything on disconnect
            $scope.locked = true;
            $scope.$apply();
        });

        socket.on('tps:state:changed', function (value) { // Catch 'tps:state:changed' event
            $scope.state = value == 0;
            $scope.$apply();
        });

        $scope.switch = function() { // Send inversed value of the 'state' variable
            console.log($scope.state ? 1 : 0);
            socket.emit('web:state:changed', $scope.state ? 1 : 0);
        }
    });