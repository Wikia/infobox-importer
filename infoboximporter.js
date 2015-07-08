/*
 * Infobox Importer Script for Japanese Wikias
 * Per Johan Groland <pgroland@wikia-inc.com>
 *
 */
"use strict";

var co = require('co')
 ,  colors = require('colors')
 ,  prettyjson = require('prettyjson')
 ,  args = require('./src/args.js')
 ,  api = require('./src/api.js');

var argv = args.parseOptions()
 ,  API = new api("ttte");
// ,  API = new api("warframe");

/////////////////////////////////////////////////
// Test for Ecmascript ES6 Harmony features
function checkES6() {
	/* jshint ignore:start */
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
	/* jshint ignore:end */
}

checkES6();

console.log("Running infoboximporter");

co(function* () {
	console.log("Querying for infoboxes on " + API.getWikiaName());
	var data = yield API.infoBoxQuery();
	console.log("Found infoboxes:");
	console.log(data);

	for (var d of data) {
		var name = d.title.substring("Template:".length);
		
		console.log("Usage for '" + name + "'");
		var data2 = yield API.getInfoboxUsage(name);
		console.log("Used in " + data2.length + " pages");
		
		break;
	}
	
}).then(function() {
	console.log("Done".bold);
}).catch(function(error) {
	console.log(error);
});


