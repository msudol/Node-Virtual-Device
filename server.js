// Include Nodejs net module, required to create TCP server listener
const Net = require('net');

// Import devices.js 
const devices = require('./devices.js');

// Random Number Generator
var getRand = function() {	
    return Math.round(100 * Math.random());
};

// Random Boolean Generator
var getBool = function() {
	return Math.random() < 0.5;
};

var createServer = function(d) {
	
	console.log("Initializing: " + d.name);
	
	d.server = new Net.Server();
	
	// The server listens to a socket for a client to make a connection request.
	// Think of a socket as an end point.	
	d.server.listen(d.port, function() {
		console.log(`Server ${d.name} listening for connection requests on socket localhost:${d.port}`);
	});

	// When a client requests a connection with the server, the server creates a new socket dedicated to that client.
	d.server.on('connection', function(socket) {
		
		console.log('A new connection has been established to ${d.name}');

		// Now that a TCP connection has been established, the server can send data to the client by writing to its socket.
		socket.write(`${getBool()};;${getRand()}`);
		
		// an interval function that runs to generate data for anyone listening
		setInterval(function() {
			socket.write(`${getBool()};;${getRand()}`);
		}, 3000);

		// The server can also receive data from the client by reading from its socket.
		socket.on('data', function(chunk) {
			console.log(`Data received from client: ${chunk.toString()}`);
		});

		// When the client requests to end the TCP connection with the server, the server ends the connection.
		socket.on('end', function() {
			console.log('${d.name} Closing connection with the client');
		});

		// Don't forget to catch error
		socket.on('error', function(err) {
			console.log(`Error: ${err}`);
		});
		
	});
	
};

// loop through devices from devices.js and create a TCP server for each.
for (device in devices) {
	
	var d = devices[device];
	
	createServer(d);

}