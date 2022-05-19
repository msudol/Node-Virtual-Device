// Include Nodejs net module, required to create TCP server listener
const Net = require('net');

// Import devices.js 
const devices = require('./devices.js');

var UUID = function() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// Random Number Generator
var getRand = function() {	
    return Math.round(100 * Math.random());
};

// Random Boolean Generator
var getBool = function() {
	return Math.random() < 0.5;
};

// data return function
var dataGen = function(d) {
	
	var retVal = [];
	
	for (data in d.data) {
	
		if (d.data[data].dataType == "range") {
			var val = {};
			val.name = d.data[data].name;
			val.value = getRand();
			retVal.push(val);
		}
		else if (d.data[data].dataType == "boolean") {
			var val = {};
			val.name = d.data[data].name;
			val.value = getBool();
			retVal.push(val);
		}
		else {
		}
	}
	//console.log(JSON.stringify(retVal));
	
	return JSON.stringify(retVal); 
};

var createServer = function(d) {
	
	console.log("Initializing: " + d.name);
	
	d.server = new Net.Server();
	
	d.timer = []; 
	
	// The server listens to a socket for a client to make a connection request.
	// Think of a socket as an end point.	
	d.server.listen(d.port, function() {
		console.log(`Server ${d.name} listening for connection requests on socket localhost:${d.port}`);
	});

	// When a client requests a connection with the server, the server creates a new socket dedicated to that client.
	d.server.on('connection', function(socket) {
		
		const id = UUID();
		
		console.log(`A new connection has been established to ${d.name} with ID ${id}`);

		// Now that a TCP connection has been established, the server can send data to the client by writing to its socket.
		socket.write(`${dataGen(d)}`);
		
		// an interval function that runs to generate data for anyone listening
		d.timer[id] = setInterval(function() {
			socket.write(`${dataGen(d)}`);
		}, d.interval * 1000);

		// The server can also receive data from the client by reading from its socket.
		socket.on('data', function(chunk) {
			var cdata = chunk.toString();
			console.log(`Data received from client: ${cdata}`);
			if (cdata == "q") {
				clearInterval(d.timer[id]);
				console.log(`${d.name} Closing connection with the client, socket ID ${id}`);
				socket.destroy();
			}
		});

		// When the client requests to end the TCP connection with the server, the server ends the connection.
		socket.on('end', function() {
			clearInterval(d.timer[id]);
			console.log(`${d.name} Closing connection with the client, socket ID ${id}`);
		});

		// Don't forget to catch error
		socket.on('error', function(err) {
			console.log(err);
		});
		
	});
	
};

// loop through devices from devices.js and create a TCP server for each.
for (device in devices) {
	
	var d = devices[device];
	
	createServer(d);

}
