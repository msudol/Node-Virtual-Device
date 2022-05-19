// devices.js 

'use strict';

let devices = [
    {
        name: "Test 1",
		driver: "JSON",  // socket will send results in json format
        port: 39990,
		interval: 10,  // time in seconds data will write to the socket
		data: [
			{
				name: "Exit Temp",
				dataType: "range",
				range: [140, 160],
				chance: 50,  // percentage chance to return a value beyond the range, set high to occur often
				xrange: [120, 180] // extended range if chance returns true
			},
			{
				name: "Edge Spacing",
				dataType: "range",
				range: [-20, 20],
				chance: 50,
				xrange: [-40, 40]
			}
		]	
    },
    {
        name: "Test 2",
		driver: "JSON",
		port: 39991,
		interval: 10,
		data: [
			{
				name: "Example Bool",
				dataType: "boolean",
			},
			{
				name: "Example Function",
				dataType: "function", // pass a simple function to the device data generator
				func: function() { 
					var counter = memory.test2.lastVal++;  // use the memory object below to store a value and increment it
					if (counter > 50) {
						memory.test2.lastVal = 0;
					}
					return counter;
				}
			}
		]	
    },
    {
        name: "Test 3",
		driver: "CSV",
		port: 39992,
		interval: 10,
		data: [
			{
				name: "Example Bool",
				dataType: "boolean",
			},
			{
				name: "Example Function",
				dataType: "function", // pass a simple function to the device data generator
				func: function() { 
					var counter = memory.test3.lastVal++;  // use the memory object below to store a value and increment it
					if (counter > 50) {
						memory.test3.lastVal = 0;
					}
					return counter;
				}
			}
		]	
    }	
];

// an object space to store some things, useful to reference for storing values or advanced operations
let memory = {
	test2: {
		lastVal: 0
	},
	test3: {
		lastVal: 0
	}
};


module.exports = devices;

