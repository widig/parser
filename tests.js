
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

function checkTestOK(selected_language,parsed,value) {
	if(isTest) {
		if(fs.existsSync("./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json")) {
			var obj = JSON.parse( fs.readFileSync( "./language" + path.sep + selected_language + path.sep + "tests" + path.sep + (tests-1) + ".json" ) );
			if(obj.result) {
			
				var check = false;
				if("parsed" in obj) {
					check = true;
					if(parsed == obj.parsed) {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK string" + ansi.fg.green+ " ]" + ansi.fg.yellow);
					} else {
						console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL string" + ansi.fg.green+ " ]" + ansi.fg.yellow);
						sb = [];
						for(var x = 0; x < parsed.length;x++) {
							sb.push("" + parsed.charCodeAt(x));
						}
						sb2 = [];
						for(var x = 0; x < obj.parsed.length;x++) {
							sb2.push("" + obj.parsed.charCodeAt(x));
						}
						console.log("source:",sb.join(" "));
						console.log("test:",sb2.join(" "));
					}
				} 
				
				if("resultEqual" in obj) {
					check = true;
					var t0 = Object.prototype.toString.apply(obj.resultEqual);
					var t1 = Object.prototype.toString.apply(value);
					if(t0 == t1) {
						function compareObject(obj1,obj2) {
							var check = true;
							for(var key in obj1) {
								if(key in obj2) {
									var t0 = Object.prototype.toString.apply(obj1[key]);
									var t1 = Object.prototype.toString.apply(obj2[key]);
									if(t0==t1) {
										if(t0 == "[object Object]") {
											if(!compareObject(obj1[key],obj2[key])) {
												check = false;
												break;
											}
										} else if(t0 == "[object Array]") {
											if(!compareArray(obj1[key],obj2[key])) {
												check = false;
												break;
											}
										} else if(t0 == "[object String]") {
											if( obj1[key] != obj2[key]) {
												check = false;
												break;
											}
										} else if(t0 == "[object Number]") {
											if( obj1[key] != obj2[key] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Boolean]") {
											if( obj1[key] != obj2[key] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Null]") {
											if( obj1[key] != obj2[key] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Undefined]") {
											if( obj1[key] != obj2[key] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Date]") {
											if( obj1[key] != obj2[key] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object RegExp]") {
											if( obj1[key] != obj2[key] ) {
												check = false;
												break;
											}
										}
									}
									
								} else {
									return false;
								}
							}
							if(!check) return false;
							return true;
						}
						function compareArray(arr1,arr2) {
							if(arr1.length == arr2.length) {
								var check = true;
								for(var x = 0; x < arr1.length;x++) {
									var t0 = Object.prototype.toString.apply(arr1[x]);
									var t1 = Object.prototype.toString.apply(arr2[x]);
									if(t0==t1) {
										if(t0 == "[object Object]") {
											if(!compareObject(arr1[x],arr2[x])) {
												check = false;
												break;
											}
										} else if(t0 == "[object Array]") {
											if(!compareArray(arr1[x],arr2[x])) {
												check = false;
												break;
											}
										} else if(t0 == "[object String]") {
											if( arr1[x] != arr2[x]) {
												check = false;
												break;
											}
										} else if(t0 == "[object Number]") {
											if( arr1[x] != arr2[x] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Boolean]") {
											if( arr1[x] != arr2[x] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Null]") {
											if( arr1[x] != arr2[x] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Undefined]") {
											if( arr1[x] != arr2[x] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object Date]") {
											if( arr1[x] != arr2[x] ) {
												check = false;
												break;
											}
										} else if(t0 == "[object RegExp]") {
											if( arr1[x] != arr2[x] ) {
												check = false;
												break;
											}
										}
									}
								}
								if(check) return true;
								return false;
							} else {
								return false;
							}
						}
						if(t0 == "[object Object]") {
							var r = compareObject(value,obj.resultEqual);
							if(r) {
								console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK result" + ansi.fg.green+ " ]" + ansi.fg.yellow);
							} else {
								console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL result" + ansi.fg.green+ " ]" + ansi.fg.yellow);
							}
						} else if(t0 == "[object Array]") {
							var r = compareArray(value,obj.resultEqual)
							if(r) {
								console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK result" + ansi.fg.green+ " ]" + ansi.fg.yellow);
							} else {
								console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.red + "FAIL result" + ansi.fg.green+ " ]" + ansi.fg.yellow);
							}
						}
					}
				}
				if(!check) {
					console.log(ansi.fg.green + "[test "+(tests-1)+" " +ansi.fg.white + "OK" + ansi.fg.green+ " ]" + ansi.fg.yellow);
				} else { 
				
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