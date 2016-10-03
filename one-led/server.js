// Require HTTP as WebSocket server modules
const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const gpio = require("@tibbo-tps/gpio");

// Serve static assets from the 'public' folder
app.use("/", express.static('public'));

const led = gpio.init("S15A");

if(led.getDirection() === "input"){
    led.setDirection('output');
    led.setValue(1);
}

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