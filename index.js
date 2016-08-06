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
		lang : {
			CharsetDigit : [ [[4,"0123456789"]] ],
			CharsetPositiveDigit : [ [[4,"123456789"]] ],
			ArrayDigit : [ [[3,"CharsetDigit"]] ],
			PositiveInteger : [ [[0,"CharsetPositiveDigit"],[6,"CharsetDigit"]] ],
			Integer : [ [[1,"0"]],[[0,"CharsetPositiveDigit"],[6,"CharsetDigit"]]  ],
			main : [
				[[0,"Integer"]]
			]
		},
		events : {
		}
	}
	var r = parser(options);
	if(r.result) {
		console.log("PARSED:"+r.code.substring(r.range[0],r.range[1]));
	}
	if(data == "exit") throw "exit";
});