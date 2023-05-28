// Require HTTP as WebSocket server modules
const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const TPSpmap = require( '@tibbo-tps/pinmap');
const { version, Chip, Line } = require( "node-libgpiod");

global.chip = new Chip(0);

// Serve static assets from the 'public' folder
app.use("/", express.static('public'));

global.led = new Line( chip, TPSpmap.getRpin( "S15A"));

led.requestOutputMode();
led.setValue(1);

// Listens for incoming WebSocket connection
var clients = io.on('connection', function(socket){
    // When connection is established
    console.log('USER CONNECTED');

    // Read I/O line state..
    // ..and broadcast it to all the connected clients
    var value = led.getValue();

    clients.emit('tps:state:changed', value);

    // When any of connected clients requires change of the line state
    socket.on('web:state:changed', function(value){
        // Change line state...
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