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
prompt(function(data) {
	console.log(data);
	var options  = {
		run : true,
		doc : data,
		start : "main",
	}
	var r = parser(options);
	if(r.result) {
		console.log("PARSED:"+r.code);
	}
	if(data == "exit") throw "exit";
});