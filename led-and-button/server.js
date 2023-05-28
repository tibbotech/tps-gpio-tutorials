// Require HTTP as WebSocket server modules
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const TPSpmap = require( '@tibbo-tps/pinmap');
const { version, Chip, Line } = require( "node-libgpiod");

// Serve static assets from the 'public' folder
app.use("/", express.static('public'));

global.chip = new Chip(0);
// Set up IO lines
global.led = new Line(chip, TPSpmap.getRpin( "S13A"));
global.button = new Line(chip, TPSpmap.getRpin( "S11A"));

var wasButtonPressed = false;

led.requestOutputMode();
led.setValue(1);

button.requestInputMode();

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