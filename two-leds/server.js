// Require HTTP as WebSocket server modules
var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gpio = require("@tibbo-tps/gpio");

// Serve static assets from the 'public' folder
app.use("/", express.static('public'));

//Set up LEDs
var leds = {
    red : gpio.init("S13A"),
    blue : gpio.init("S15A")
};
Object.keys(leds).forEach(function(key){
    if(leds[key].getDirection() === "input"){
        leds[key].setDirection('output');
        leds[key].setValue(1);
    }
});

// Listens for incoming WebSocket connection
var clients = io.on('connection', function(socket){
    // When connection is established
    console.log('USER CONNECTED');
    var values= {
        red : leds.red.getValue(),
        blue : leds.blue.getValue()
    };
    
    clients.emit('tps:state:changed', {name : 'red', value : values.red});
    clients.emit('tps:state:changed', {name : 'blue', value : values.blue});
    
    // When any of connected clients requires change of the line state
    socket.on('web:state:changed', function(data){
        // Change line state...
        leds[data.name].setValue(data.value);
        //.. and broadcast it to all the clients
        clients.emit('tps:state:changed', data);
    });
    
    socket.on('disconnect', function(){
        console.log('USER DISCONNECTED');
    });
});

// Run HTTP server on :3000 port
http.listen(3000,function(){
    console.log("LISTENING");
});