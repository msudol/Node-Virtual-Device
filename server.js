// Include Nodejs net module, required to create TCP server listener
const Net = require('net');

// Import devices.js 
const devices = require('./devices.js');

// basic uuid function to give sockets a unique ID 
var UUID = function() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// Random Number Generator (default 0-100)
var getRand = function(x, y) {	
	min = Math.ceil(x) || 0;
	max = Math.floor(y) || 100;
	return Math.floor(Math.random() * (max - min + 1) + min);
};

// Random Boolean Generator
var getBool = function() {
	return Math.random() < 0.5;
};

// Random Chance Generator (default 10%)
var getChance = function(x) {	
	var min = Math.ceil(x) || 10;
	return Math.round(100 * Math.random()) < min;
};

// helper function to convert a json to CSV - untested
var ConvertToCSV = function(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	return str;
}




// data return function - this still needs some work to emulate many different devices and data formats
var dataGen = function(d) {
	
	var retVal = [];
	
	for (data in d.data) {
	
		// create an object to store results, work in progess.  
		// This currently assumes an array of objects with the format {name: value} but that may not always be the case.
		
		var val = {};
		val.name = d.data[data].name;
	
		// range will choose an integer between a min/max value, it also has a chance to go outside of the range if desired.
		if (d.data[data].dataType == "range") {
					
			// alternate range from device config by chance percentage to test tolerances
			if (getChance(d.data[data].chance)) {
				var min = d.data[data].xrange[0];
				var max = d.data[data].xrange[1];
			}
			// otherwise normal range
			else {
				var min = d.data[data].range[0];
				var max = d.data[data].range[1];
			}
			
			val.value = getRand(min, max);
			retVal.push(val);
		}
		
		// simply returns true or false
		else if (d.data[data].dataType == "boolean") {
			
			val.value = getBool();
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
	//console.log(JSON.stringify(retVal));
	
	if (d.driver == "JSON") {
		return JSON.stringify(retVal); 
	}
	else if (d.driver = "CSV") {
		return ConvertToCSV(JSON.stringify(retVal));
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
		const id = UUID();
		
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

// loop through devices from devices.js and create a TCP server for each.
for (device in devices) {
	
	var d = devices[device];
	
	createServer(d);

}
