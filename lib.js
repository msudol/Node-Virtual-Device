// lib.js - useful functions

'use strict';

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
    var min, max;
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


module.exports = { UUID, getRand, getBool, getChance, ConvertToCSV };
