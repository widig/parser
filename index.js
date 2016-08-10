var fs = require("fs");
var path = require("path");
var readline = require('readline');
var parser = require("./parser.js");
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

var selected_language = "test"
var context = {};

if(!("context" in context)) {
	var files = fs.readdirSync("./language" + path.sep + selected_language + path.sep + "memory");
	context.context = [];
	for(var x = 0; x < files.length;x++) {
		var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "memory" + path.sep + x + ".json", "utf8" ) );
		context.context.push(obj);
	}
	context.memory = context.context[ context.context.length-1 ];
}

var tests = 0;
var maxTests = -1;
var isTest = false;
if(fs.existsSync("./language" + path.sep + selected_language + path.sep + "tests")) {
	var files = fs.readdirSync("./language" + path.sep + selected_language + path.sep + "tests");
	maxTests = files.length;
	var max = -1;
	for(var x = 0; x < maxTests;x++) {
		if(fs.existsSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + x + ".txt")) {
			max = x;
		}
	}
	maxTests = max+1;
	if(tests<maxTests) {
		isTest = true;
		var obj = fs.readFileSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + tests + ".txt","utf8");
		script.push(obj);
		tests+=1;
	}
}
prompt(function(data) {
	
	var options  = {
		run : true,
		doc : data,
		start : "main",
		context : context,
		lang : JSON.parse(fs.readFileSync("./language" + path.sep + selected_language + path.sep + "v.1.0.json","utf8")),
		events : require("./language" + path.sep + selected_language + path.sep + "v.1.0.js")
	}
	try {
		var r = parser(options);
		if(r.result) {
			console.log("PARSED:"+r.code.substring(r.range[0],r.range[1]));
			if(isTest) {
				if(fs.existsSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json")) {
					var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json" ) );
					if(obj.result) {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					} else {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					}
				} else {
					console.log(ansi.fg.green + "[test "+(tests-1)+" passed]" + ansi.fg.yellow);
				}
			}
		} else {
			if(isTest) {
				if(fs.existsSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json")) {
					var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json" ) );
					if(!obj.result) {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					} else {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					}
				} else {
					console.log(ansi.fg.green + "[test "+(tests-1)+" passed]" + ansi.fg.yellow);
				}
			}
		}
	} catch(e) {
		if(debug) console.log(e);
		if(debug) console.log(e.stack);
	}
	if(tests<maxTests) {
		var obj = fs.readFileSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + tests + ".txt","utf8");
		script.push(obj);
		tests+=1;
	} else {
		isTest = false;
	}
	if(data == "exit") throw "exit";
	
});