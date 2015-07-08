/*
 * Infobox Importer Script for Japanese Wikias
 * Per Johan Groland <pgroland@wikia-inc.com>
 *
 */
"use strict";

var co = require('co')
 ,  args = require('./src/args.js');

/////////////////////////////////////////////////
// Test for Ecmascript ES6 Harmony features
function checkES6() {
	try {
		eval("function* testGenerators() {}");
		//eval("function testLet() { let a = 1; }");
		//eval("var random = Proxy.create({ get: function() { return Math.random(); } });");
		eval("var m = new Map();");
		eval("var w = new WeakMap();");
		eval("var s = new Set();");
		eval("var debugSymbol = Symbol();");
		//eval("class Car {}");
		//eval("let x = [0,1,2]; x.map(x => console.log(x * x));");
		eval("var x = [0,1,2]; x.map(x => x * x);");
	}
	catch (err) {
		console.log("ERROR:".bold + " This application uses Ecmascript 6 features");
		console.log("Run it with node 0.12.0 or newer or io.js. (Currently running " + process.version + ")");
		console.log("node --harmony infoboximporter.js".bold);
		console.log(err);
	
		process.exit(1);
	}
}

checkES6();

co(function* () {
	console.log("Running infoboximporter");
	var argv = args.parseOptions();
	console.log(argv);
}).then(function() {
	console.log("Done");
}).catch(function(error) {
	console.log(error);
});
