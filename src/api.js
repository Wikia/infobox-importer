/*
 * Infobox Importer Script for Japanese Wikias
 * Per Johan Groland <pgroland@wikia-inc.com>
 *
 */
"use strict";

/*
// converter api
http://starwars.grunny.wikia-dev.com/wikia.php?controller=TemplateDraft&method=getInfoboxMarkup&template=Character&format=json

// fields
http://got.adam.wikia-dev.com/api.php?action=query&prop=infobox&titles=Template:Character&format=json

// 
http://fallout.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json

ttte.wikia.com to ja.ttte.wikia.com (existing wiki but not active)
warframe.wikia.com to ja.warframe.wikia.com (only 1 page)

http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Corris Railway
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Ffestiniog Railway
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Magazine Story
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=No license
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Quote
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Returning Characters
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Snowdon Mountain Railway
http://ttte.wikia.com/api.php?action=query&list=allpages&apnamespace=10&format=json&apfrom=Unsigned

http://ttte.wikia.com/api.php?action=query&prop=infobox&titles=Template:Infobox Movie&format=json
http://ttte.wikia.com/api.php?action=query&prop=infobox&titles=Template:Infobox User&format=json
http://ttte.wikia.com/api.php?action=query&prop=infobox&titles=Template:Infobox character&format=json

Embedded in which pages:
http://ttte.wikia.com//api.php?action=query&list=embeddedin&eititle=Template:Infobox Movie&format=json

*/

var RSVP = require('rsvp')
 ,  util = require('util')
 ,  request = require('request')
 ,  events = require('events');

function API(wikiaName, useDev) {
	useDev = useDev || false;
	
	this.wikia = wikiaName;
	this.baseURL = "http://" + wikiaName;
	
	if (useDev) {
		this.baseURL += ".pgroland.wikia-dev.com/";
	}
	else {
		this.baseURL += ".wikia.com/";
	}
		
}

util.inherits(API, events.EventEmitter);

/**
 * Helper for deciphering the MediaWiki continuation query
 */
function unwrapContinuation(data) {
	var queryName;
	var queryValue;
	
	if (data && data['query-continue']) {
		var continuationObject = data['query-continue'];
		
		var keys = Object.keys(continuationObject);
		
		if (keys.length === 1) {
			var inner = continuationObject[keys[0]];
			var innerKeys = Object.keys(inner);
			
			if (innerKeys.length === 1) {
				queryName = innerKeys[0];
				queryValue = inner[innerKeys[0]];
				return {
					name: queryName,
					value: queryValue
				};
			}
		}
	}
	
	return null;
}

API.prototype.getWikiaName = function() {
	return this.wikia;
};

/**
 * General wrapper for a single MediaWiki GET api call
 * @param deferred
 * @param url
 * @param continuation
 */
API.prototype.singleRequestWrapper = function(url, continuation) {
	var deferred = RSVP.defer();

	if (continuation) {
		url += '&' + continuation.name + '=' + continuation.value;
	}
	
	var that = this;
	
	request(url, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			try {
				var json = JSON.parse(body);
				that.emit("data", json);
				deferred.resolve(json);
			}
			catch (e) {
				deferred.reject(e);
			}
		}
		else {
			that.emit("error", err);
			deferred.reject(err);
		}
	});
	
	return deferred.promise;
};

/**
 * General wrapper for a MediaWiki GET api call with automatic continuation query
 * @param url
 * @param matchRegex
 */
API.prototype.chainedRequestWrapper = function(url, list, matchRegex) {
	var deferred = RSVP.defer();
	matchRegex = matchRegex || new RegExp('infobox', 'i');
	var allResults = [];
	
	this.url = url;
	this.list = list;
	var that = this;
	
	this.singleRequestWrapper(url);
	
	this.on("data", function(data) {
		var continuation = unwrapContinuation(data);
		
		for (var page of data.query[that.list]) {
			if (page && page.title && page.title.match(matchRegex)) {
				allResults.push(page);
			}
		}
		
		if (continuation) {
			this.singleRequestWrapper(that.url, continuation);
		}
		else {
			deferred.resolve(allResults);
		}
	});
	
	this.on("error", function(err) {
		deferred.reject(err);
	});
	
	return deferred.promise;
};

/**
 * Get list of templates that match the regexp
 * @param matchRegex The regexp to match. If none is provided, /infobox/ will be used
 * @returns An array of matched infoboxes
 */
API.prototype.infoBoxQuery = function(matchRegex) {
	matchRegex = matchRegex || new RegExp('infobox', 'i');
	var list = 'allpages';
	var url = this.baseURL + 'api.php?action=query&list=' + list + '&apnamespace=10&format=json';

	return this.chainedRequestWrapper(url, list, matchRegex);
};

/**
 * Get a list of articles an infobox is used by
 * @param Name of infobox template to get data from
 * @param continuation Continuation query or null
 * http://ttte.wikia.com//api.php?action=query&list=embeddedin&eititle=Template:Infobox Movie&format=json
 */
API.prototype.getInfoboxUsage = function(name) {
	var list = 'embeddedin';
	var url = this.baseURL + 'api.php?action=query&list=' + list + '&eititle=Template:' + name + '&format=json';
	return this.chainedRequestWrapper(url, list, new RegExp(''));
};

module.exports = API;
