// Include Nodejs net module, required to create TCP server listener (Built-in with node)
const Net = require('net');

// import lib.js - library of functions for user
const lib = require("./lib");

// Import devices.js - modify for your requirements
const devices = require('./devices');

// data return function - this still needs some work to emulate many different devices and data formats
// this is called on an interval for each client connection to the a server. 
var dataGen = function(d) {
	
	// return value as an array
	var retVal = [];
	
	// loop throught the device's data settings
	for (data in d.data) {
	
		// create an object to store results, work in progess.  
		// This currently assumes an array of objects with the format {name: value} but that may not always be the case.
		
		var val = {};
		val.name = d.data[data].name;
	
		// range will choose an integer between a min/max value, it also has a chance to go outside of the range if desired.
		// maybe chance this routine from if/else to case/switch for performance

		if (d.data[data].dataType == "range") {
			var min, max;
					
			// alternate range from device config by chance percentage to test tolerances
			if (lib.getChance(d.data[data].chance)) {
				min = d.data[data].xrange[0];
				max = d.data[data].xrange[1];
			}
			// otherwise normal range
			else {
				min = d.data[data].range[0];
				max = d.data[data].range[1];
			}
			
			val.value = lib.getRand(min, max);
			retVal.push(val);
		}
		
		// simply returns true or false
		else if (d.data[data].dataType == "boolean") {
			
			val.value = lib.getBool();
			retVal.push(val);
			
		}
		
		// returns the result of a function, no error checking so this is experimental
		else if (d.data[data].dataType == "function") {
			
			val.value = d.data[data].func();
			retVal.push(val);
			
		}
		// catch all todo
		else {
			
		}
		
	}
	// spammy, uncomment for debugging
	// console.log(JSON.stringify(retVal));
	//TODO: build actually logging/debugging functionality
	

	// Current formats that the data can be output to. Some other options might be YAML, XML, or PLC specific.
	if (d.driver == "JSON") {
		return JSON.stringify(retVal); 
	}
	else if (d.driver = "CSV") {
		return lib.ConvertToCSV(JSON.stringify(retVal));
	}
	else {
		return retVal;
	}
	
};


// For each device, this function creates a TCP server with the given port and object info from devices.js
var createServer = function(d) {
	
	console.log("Initializing: " + d.name);
	
	// create an instance of net.server
	d.server = new Net.Server();
	
	// for tracking the setIntervals that generate regular data, when connections close, the internval will end saving on memory resources.
	d.timer = []; 
	
	// The server listens to a socket for a client to make a connection request. Think of a socket as an end point.	
	d.server.listen(d.port, function() {
		console.log(`Server ${d.name} listening for connection requests on socket localhost:${d.port}`);
	});

	// When a client requests a connection with the server, the server creates a new socket dedicated to that client.
	d.server.on('connection', function(socket) {
		
		// for tracking purposes generate an ID for this socket
		const id = lib.UUID();
		
		console.log(`A new connection has been established to ${d.name} with ID ${id}`);

		// Now that a TCP connection has been established, the server can send data to the client by writing to its socket.
		socket.write(`${dataGen(d)}`);
		
		// an interval function that runs to generate data for anyone listening
		d.timer[id] = setInterval(function() {
			// reference above function dataGen to generate data for the socket given device (d) parameters
			socket.write(`${dataGen(d)}`);
		}, d.interval * 1000);

		// The server can also receive data from the client by reading from its socket.
		socket.on('data', function(chunk) {
			var cdata = chunk.toString();
			console.log(`Data received from client: ${cdata}`);
			// type q in a telnet session to disconnect
			if (cdata == "q") {
				// kill the timer interval
				clearInterval(d.timer[id]);
				console.log(`${d.name} Closing connection with the client, socket ID ${id}`);
				// destroy the socket
				socket.destroy();
			}
		});

		// When the client requests to end the TCP connection with the server, the server ends the connection.
		socket.on('end', function() {
			// kill the timer interval 
			clearInterval(d.timer[id]);
			console.log(`${d.name} Closing connection with the client, socket ID ${id}`);
		});

		// Don't forget to catch error
		socket.on('error', function(err) {
			console.log(err);
		});
		
	});
	
};


// Main function - loop through devices from devices.js and create a TCP server for each. 
// Note - error will throw if two devices try to bind the same port.
for (device in devices) {
	
	var d = devices[device];
	
	createServer(d);

}
