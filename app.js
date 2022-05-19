// Include Nodejs net module, required to create TCP server listener
const Net = require('net');

// The port on which the server is listening.
const port = 39993;

// Create a new TCP server.
const server = new Net.Server();

// Random Number Generator
var getRand = function() {
    return Math.round(100 * Math.random());
};

var getBool = function() {
	return Math.random() < 0.5;
};
	
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen(port, function() {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

// When a client requests a connection with the server, the server creates a new socket dedicated to that client.
server.on('connection', function(socket) {
	
    console.log('A new connection has been established.');

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
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});
