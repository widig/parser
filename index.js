var fs = require("fs");
var path = require("path");
var readline = require('readline');
var parser = require("./parser.js");
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function prompt(callback) {
	rl.question(">", function(answer) {
		var check = true;
		try {
			callback(answer);
		} catch(e) {
			//console.log("error",e,"\r\n",e.message,"\r\n",e.stack);
			check = false;
		}
		if(check) { 
			prompt(callback);
		} else rl.close();
	});
}
var context = {};
if(!("context" in context)) {
	//console.log("here");
	var files = fs.readdirSync("memory");
	context.context = [];
	//console.log(files.length);
	for(var x = 0; x < files.length;x++) {
		var obj = JSON.parse( fs.readFileSync( "memory" + path.sep + x + ".json", "utf8" ) );
		//console.log(JSON.stringify(obj));
		context.context.push(obj);
	}
	context.memory = context.context[ context.context.length-1 ];
}

prompt(function(data) {
	console.log(data);
	var options  = {
		run : true,
		doc : data,
		start : "main",
		context : context,
		lang : JSON.parse(fs.readFileSync("./language" + path.sep + "v.1.0.json","utf8")),
		events : require("./language" + path.sep + "v.1.0.js")
	}
	try {
	var r = parser(options);
	if(r.result) {
		console.log("PARSED:"+r.code.substring(r.range[0],r.range[1]));
	}
	} catch(e) {
		console.log(e);
	}
	if(data == "exit") throw "exit";
});