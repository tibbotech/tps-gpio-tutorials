// Require HTTP as WebSocket server modules
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gpio = require("@tibbo-tps/gpio");

// Serve static assets from the 'public' folder
app.use("/", express.static('public'));

// Set up IO lines
var led = gpio.init("S13A");
var button = gpio.init("S11A");

var wasButtonPressed = false;

if(led.getDirection() === "input"){
    led.setDirection('output');
    led.setValue(1);
}
button.setDirection('input');

setInterval(function(){
    // If button is just released...
    if(button.getValue() === 1 && wasButtonPressed === true){
        wasButtonPressed = false;

        // ...read led state...
        var ledState = led.getValue();

        //...inverse it...
        if(ledState === 1){
            ledState = 0
        }else{
            ledState = 1;
        }

        //...write...
        led.setValue(ledState);

        //...and submit to web app if connected
        if(clients !== undefined){
            clients.emit('tps:state:changed', ledState);
        }
    }else if(button.getValue() === 0){
        // If button is pressed
        wasButtonPressed = true;
    }
},100);

// Listens for incoming WebSocket connection
var clients = io.on('connection', function(socket){

    // If client is just connected, immediately submit led state
    clients.emit('tps:state:changed', led.getValue());

    socket.on('web:state:changed', function(value){
        // change line state...
        led.setValue(value);

        //.. and broadcast it to all the clients
        clients.emit('tps:state:changed', value);
    });

    socket.on('disconnect', function(){
        console.log('USER DISCONNECTED');
    });
});

// Run HTTP server on :3000 port
http.listen(3000,function(){
    console.log("LISTENING");
});