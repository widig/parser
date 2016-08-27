var fs = require("fs");
var path = require("path");
var readline = require('readline');
var parser = require("./parser.js");
var tests = require("./tests.js");
var debug = true;
var ansi = require("./ansi.js");
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
var script = [];

function prompt(callback) {
	if(script.length>0) {
		var check = true;
		try {
			callback(script.shift());
		} catch(e) {
			check = false;
			if(debug) console.log(e);
			if(debug) console.log(e.stack);
		}
		if(check) { 
			prompt(callback);
		} else rl.close();
	} else {
		rl.question(">", function(answer) {
			var check = true;
			try {
				callback(answer);
			} catch(e) {
				check = false;
				if(debug) console.log(e);
				if(debug) console.log(e.stack);
			}
			if(check) { 
				prompt(callback);
			} else rl.close();
		});
	}
}


var context = {};

// load last preferences of language

var selected_language = "json_next"
var version = "v.1.0";
if(!("context" in context)) {
	var files = fs.readdirSync("./language" + path.sep + selected_language + path.sep + "memory");
	context.context = [];
	for(var x = 0; x < files.length;x++) {
		var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "memory" + path.sep + x + ".json", "utf8" ) );
		context.context.push(obj);
	}
	context.memory = context.context[ context.context.length-1 ];
}
tests.startTest(selected_language,script);

prompt(function(data) {
	var options  = {
		shellEnqueue : function(data) { script.push(data); },
		shellExit : function() { this.exitRequested = true; },
		shellLanguageSwitch : function(lang) { 
			selected_language = lang; 
			
			// load memory?
			if("context" in context) {
				delete context.context;
			}
			if(!("context" in context)) {
				var files = fs.readdirSync("./language" + path.sep + selected_language + path.sep + "memory");
				context.context = [];
				for(var x = 0; x < files.length;x++) {
					var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "memory" + path.sep + x + ".json", "utf8" ) );
					context.context.push(obj);
				}
				context.memory = context.context[ context.context.length-1 ];
			}
			
			
		},
		exitRequested : false,
		run : true,
		doc : data,
		start : "main",
		context : context,
		skipEvents : {"charset_whitespace":1,"whitespace":1,"zeroOrMoreOf:charset_whitespace[0]":1},
		lang : JSON.parse(fs.readFileSync("./language" + path.sep + selected_language + path.sep + version + ".json","utf8")),
		events : require("./language" + path.sep + selected_language + path.sep + version + ".js")
	}
	try {
		var r = parser(options);
		if(r.result) {
			console.log("PARSED:"+r.code.substring(r.range[0],r.range[1]));
			tests.checkTestOK(selected_language,r.code.substring(r.range[0],r.range[1]),"result" in context ? context.result : null);
		} else {
			tests.checkTestFAIL(selected_language);
		}
	} catch(e) {
		if(debug) console.log(e);
		if(debug) console.log(e.stack);
	}
	tests.iterTest(selected_language,script);
	if(data == "exit" || options.exitRequested) throw "exit";
	
});