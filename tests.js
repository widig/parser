
var fs = require("fs");
var path = require("path");
var tests = 0;
var maxTests = -1;
var isTest = false;
var ansi = require("./ansi.js");
function startTest(selected_language,script) {

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
}

function checkTestOK(selected_language,parsed) {
	if(isTest) {
		if(fs.existsSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json")) {
			var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json" ) );
			if(obj.result) {
				if("parsed" in obj) {
					if(parsed == obj.parsed) {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					} else {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					}
				} else {
					console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK" + ansi.fg.green+ " ]" + ansi.fg.yellow);
				}
			} else {
				console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL" + ansi.fg.green+ " ]" + ansi.fg.yellow);
			}
		} else {
			console.log(ansi.fg.green + "[test "+(tests-1)+" passed]" + ansi.fg.yellow);
		}
	}
}
function checkTestFAIL(selected_language) {
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

function iterTest(selected_language,script) {
	if(tests<maxTests) {
		var obj = fs.readFileSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + tests + ".txt","utf8");
		console.log(obj);
		script.push(obj);
		tests+=1;
	} else {
		isTest = false;
	}
}

module.exports = {
	startTest : startTest,
	checkTestOK : checkTestOK,
	checkTestFAIL : checkTestFAIL,
	iterTest : iterTest
}