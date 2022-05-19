// devices.js 

'use strict';

let devices = [
    {
        name: "Test 1",
		driver: "JSON",
        port: 39990,
		interval: 10,
		data: [
			{
				name: "Exit Temp",
				dataType: "range",
				range: [140, 160],
				chance: 5,
				xrange: [-10, 10]
			},
			{
				name: "Edge Spacing",
				dataType: "range",
				range: [-20, 20],
				chance: 5,
				xrange: [-10, 10]
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
			}
		]	
    }
];

module.exports = devices;

