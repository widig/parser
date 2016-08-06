
var fs = require("fs");
var path = require("path");

function StringMap(str) {
	var map = [{},{}];
	for(var x = 0; x < str.length;x++) {
		var index = -1;
		var ch = str.charAt(x);
		for(var y = 1; y < map.length;y++) {
			if(ch in map[y]) {
				index = y;
			} else {
				break;
			}
		}
		if(index == -1) {
			map[1][ch] = x;
			map[0][x] = 1;
		} else if(index+1 < map.length) {
			map[index+1][ch] = x;
			map[0][x] = index + 1;
			//console.log(index+1);
		} else {
			var obj = {};
			obj[ch] = x;
			map.push(obj);
			map[0][x] = index+1;
			//console.log("a",index+1);
		}
	}
	map[0].length = str.length;
	map.count = function(c) {
		var counter = 0;
		for(var x= 1; x < map.length;x++) {
			if(c in map[x]) {
				counter = x;
			} else {
				break;
			}
		}
		return counter;
	}
	map.before = function(c) {
		var arr = [];
		for(var x= 1; x < map.length;x++) {
			if(c in map[x]) {
				var p = map[x][c];
				if(p>0) {
					var char_before = str.charAt( p-1 );
					// which?
					for(var y = 1;y < map.length;y++) {
						if(char_before in map[y] && map[y][char_before] == p-1) {
							arr.push( [ y, char_before ]);
							break;
						}
					}
				} else {
					arr.push([x,0]);
				}
			} else {
				break;
			}
		}
		return arr;	
	}
	map.after = function(c) {
		var arr = [];
		for(var x= 1; x < map.length;x++) {
			if(c in map[x]) {
				var p = map[x][c];
				if(p+1 < map[0].length) {
					var char_after = str.charAt(p+1);
					for(var y = 1; y < map.length;y++) {
						if(char_after in map[y] && map[y][char_after] == p+1) {
							arr.push([ y, char_after]);
							break;
						}
					}
				} else {
					arr.push([x,-1]);
				}
			}
		}
		return arr;
	}
	map.where = function(c) {
		var arr = [];
		for(var x = 1; x < map.length;x++) {
			if(c in map[x]) {
				arr.push( map[x][c] );
			}
		}
		return arr;
	}
	map.whereString = function(pat) {
		var regions = map.where(pat.charAt(0));
		var testLen = regions.length;
		while(testLen>0) {
			var r = regions.shift();
			var c = true;
			for(var x = 1; x < pat.length;x++) {
				if( pat.charAt(x) != str.charAt(r+x) ) {
					c = false;
					break;
				}
			}
			if(c) {
				regions.push(r);	
			}
			testLen -= 1;
		}
		return regions;
	}
	map.whereSequence = function(options) {
		
		var imap = {};
		for(var x = 1; x < arguments.length;x++) {
			var t = Object.prototype.toString.apply(arguments[x]);
			if(t == "[object String]") {
				imap[arguments[x]] = map.whereString(arguments[x]);
			} else if(t == "[object Array]") {
				var arr = [];
				for(var y = 0; y < arguments[x].length;y++) {
					var arr1 = map.whereString(arguments[x][y]);
					arr = arr.concat(arr1);
				}
				var arr2 = [];
				for(var y = 0; y < arr.length;y++) {
					var c = false;
					for(var z = 0; z < arr2.length;z++) {
						if(arr[y] == arr2[z]) {
							c = true;
							break;
						}
					}
					if(!c) arr2.push(arr[y]);
				}
				imap[arguments[x]] = arr2;

			}
		}
		var stack = [[0,0,-1]];
		var prod = [];
		console.log(JSON.stringify(imap));
		while(stack.length>0) {
			var item = stack.shift();
			console.log( "item:",item[0],"index:",item[1], arguments[item[0]+1] );
			if(
				item[0]+1 < arguments.length &&
				imap[ arguments[ item[0]+1 ] ].length > 0 && 
				item[1] < imap[ arguments[ item[0]+1 ] ].length &&
				item[2] < imap[ arguments[ item[0]+1 ] ][ item[1] ]
			) {
				
				if(prod.length==0) prod.push([]);
				prod[ prod.length-1 ].push( imap[ arguments[ item[0]+1 ] ][ item[1] ] );
				stack.unshift([item[0],item[1]+1, item[2] ]);
				stack.unshift([item[0]+1,0, imap[ arguments[ item[0]+1 ] ][ item[1] ] + arguments[ item[0]+1].length ]);
				console.log("found:",arguments[item[0]+1],JSON.stringify(prod));
			} else {
				if(item[0] + 1 >= arguments.length) {
					console.log("dead end");
					var np = [];
					for(var x = 0; x < prod[ prod.length-1 ].length-1;x++)
						np.push( prod[ prod.length-1][x] );
					prod.push(np);
					console.log(JSON.stringify(prod));
				} else if(item[1] >= imap[ arguments[ item[0]+1 ] ].length) {
					if(prod.length >0 && prod[ prod.length-1].length >0) prod[ prod.length-1].pop();
					
					
				} else if( item[2] >= imap[ arguments[ item[0]+1 ] ][ item[1] ]) {
					console.log("try next combination");
					stack.unshift( [ item[0], item[1] + 1, item[2] ]);
				} else {
					console.log("fail");
					if(prod.length>0) prod.pop();	
					while(stack.length>0 && stack[ 0 ][0] > 0) stack.shift();
				}
			}
		}
		if(prod.length>0 && prod[prod.length-1].length < arguments.length-1) prod.pop();
		//sample
		//   var m1 = Pattern2("123 abc 456 789 123 123 789 567 789");
		//   console.log("seq:",m1.whereSequence({},"123","abc","789"));
		// >>[[0,4,12],[0,4,24],[0,4,32]
		// options to implement
		// largest
		// smallest
		// in range
		// after
		// before
		
		return prod;
	}
	map.whereSpace = function() {

	}
	return map;
}


var lang = {};

function Parser(options) {
	// parse with map reduce
	// warning: username is a tip
	
	var debug = false;
	if(debug)console.log(">> webshell calling");
	var lang = null;
	var doc = null;
	var ret = {};
	var packet = null;
	var run = false;
	if("run" in options) {
		run = options.run;
		options.run = false;
	}
	
	if("doc" in options) {
		doc = options.doc;
	} else {
		throw "no doc defined.";
	}
	var events = {};
	
	if("lang" in options) {
		lang = options.lang;
	} else {
		lang = options.lang = {
			CharsetDigit : [
				[[4,"0123456789"]]
			],
			CharsetPositiveDigit : [
				[[4,"123456789"]]
			],
			ArrayDigit : [
				[[3,"CharsetDigit"]]
			],
			PositiveInteger : [
				[[0,"CharsetPositiveDigit"],[6,"ArrayDigit"]]
			],
			Integer : [
				[[1,"0"]]
				//,[[0,"PositiveInteger"]]
			],
			main:[
				[[0,"Integer"]]
			]
		};
		events = {
		
		}
	}
	
	
	if(!("map" in options)) {
		options.map = StringMap(doc);
	}
	
	if(!("count" in options)) {
		options.count = 100;	
	}
	if(!("backtrack" in options)) {
		options.backtrack = 0;	
	}
	if(!("vars" in options)) {
		options.vars = {};
	}
	if(!("cached" in options)) {
		options.cached = {};
	}
	if(!("pos" in options)) {
		options.pos = 0;
	}
	if(!("errors" in options)) {
		options.errors = [];
	}
	if(!("comments" in options)) {
		options.comments = [];
	}
	
	if(!("context" in options)) { // one command context (webrequest)
		options.context = {};
	}
	
	var start = null;
	if("start" in options) {
		start = options.start;
	} else {
		start = "main";
		options.start = start;
	}
	//console.log(">",start);
	if(debug) console.log(JSON.stringify(options));
	if(debug) console.log("GO!",start);
	
	if(!("callstack" in options)) {
		options.callstack = [start];
	} else {
		options.callstack.push(start);
	}
	
	if(debug) console.log(">> webshell calling4");
	
	options.count -= 1;
	if(options.count == 0) {
		if(debug) console.log("error");
		return { result : false, error : true };
	}
	var parsed = false;
	var backtrack = options.pos;
	var map = options.map;
	var ruleIndex = -1;
	var ruleData = [];
	
	
	if(start in lang) {
		if(debug) console.log(">> webshell start parsing",start);
		for(var x = 0; x < lang[ start ].length; x++) { // rules
			
			ruleIndex = x;
			ruleData = [];
			if(debug) console.log("start:",start,x);
			var rule = true;
			options.pos = backtrack;
			for(var y = 0; y < lang[ start ][x].length;y++) { // rule items
				if(debug) console.log("rule item:",y, "type:",lang[ start ][x][y][0]);
				if( lang[ start ][x][y][0] == 0 ) { // rule test
					var startPos = options.pos;
					options.start = lang[ start ][x][y][1];
					if(debug) console.log(">>call",lang[ start ][x][y][1],JSON.stringify(options));
					var r = Parser(options);
					if(debug) console.log("<<call",start);
					//if(debug) console.log("back to",start,r);
					if(r.result) {
						ruleData.push({
							index : r.index,
							type:0,name:lang[ start ][x][y][1],
							range:[ startPos, options.pos],
							data:r.data
						});
					} else {
						rule = false;
						break;
					}
				} else if( lang[ start ][x][y][0] == 1 ) { // string
					if(debug) console.log("at string parsing(1):",options.pos,x,y,lang[start][x][y]);
					if( lang[ start ][x][y][1].length > 0) {
						if(lang[ start ][x][y][1].length > (doc.length - options.pos) ) {
							if(debug) console.log("pattern is greater than input.");
							rule = false;
							break;
						} else {
							var useCase = false;
							var useCapitalLetter = false;
							if( lang[ start ][x][y].length == 3 && "ignoreCase" in lang[ start ][x][y][2] && lang[ start ][x][y][2].ignoreCase) {
								useCase = true;
							}
							if( lang[ start ][x][y].length == 3 && "capitalLetter" in lang[ start ][x][y][2] && lang[ start ][x][y][2].capitalLetter) {
								useCapitalLetter = true;
							}
							var regions = null;
							if(useCase) {
								var first_lower = lang[ start ][x][y][1].charAt(0).toLowerCase();
								var first_upper = lang[ start ][x][y][1].charAt(0).toUpperCase();
								var regions = map.where( first_lower );
								var regions2 = map.where( first_upper );
								regions =  regions.concat( regions2 );
							} else {
								regions = map.where( lang[ start ][x][y][1].charAt(0) );
							}
							//console.log("error?",start,x,y,lang[ start ][x][y][1],lang[ start ][x][y][1].charAt(0),regions,regions.length);
							var arr1 = [];
							var arr2 = [];
							for(var z = 0; z < lang[start][x][y][1].length;z++) arr1.push(lang[start][x][y][1].charCodeAt(z));
							for(var z = 0; z < doc.substring(options.pos).length && z < lang[start][x][y][1].length;z++) arr2.push( doc.charCodeAt(z+options.pos) );
							//console.log("test string:",lang[start][x][y][1],doc.substring(options.pos),arr1,arr2);
							var testLen = regions.length;
							var check = false;
							while(testLen>0) {
								var r = regions.shift();
								var c = true;
								for(var z = 1; z < lang[ start ][x][y][1].length;z++) {
									//console.log(r,z,doc.charAt(r+z));
									if(useCase) {
										var cur_lower = lang[ start ][x][y][1].charAt(z).toLowerCase();
										var cur_upper = lang[ start ][x][y][1].charAt(z).toUpperCase();
										if( cur_upper != doc.charAt(r+z) && cur_lower != doc.charAt(r+z) ) {
											c = false;
											break;
										}
									} else {
										if( lang[ start ][x][y][1].charAt(z) != doc.charAt(r+z) ) {
											c = false;
											break;
										}
									}
								}
								if(c) {
									regions.push(r);	
								}
								testLen -= 1;
							}
							// change to cache
							options.cached[ start + ":" + y ] = regions;
							for(var z = 0; z < regions.length;z++) {
								if(regions[z] == options.pos) {
									check = true;
									break;
								}
							}
							//console.log(">>",check,regions,lang[start][x][y][1],options.pos,map.where(lang[ start ][x][y][1].charAt(0)),map);
							if(!check) {
								if (debug) console.log( "pattern string \"" + lang[start][x][y][1] + "\" was not found.");
								rule = false;
								break;
							} else {
								var startPos = options.pos;
								options.pos += lang[ start ][x][y][1].length;
								ruleData.push({type:1,range:[startPos,options.pos]});
							}								
						}
					} else {
						// true for this rule = empty
					}
				} else if( lang[ start ][x][y][0] == 4 ) { // charset
					if( doc.length> 0 && doc.length - options.pos > 0 && lang[ start ][x][y][1].indexOf( doc.charAt(options.pos) ) !=-1 ) {
						//console.log("HERE",doc.charAt(options.pos),lang[start][x][y][1]);
						var startPos = options.pos;
						options.pos += 1;
						ruleData.push({type:4,range:[startPos,options.pos]});
					} else {						
						rule = false;
						break;
					}
				} else if( lang[ start ][x][y][0] == 3 ) { // array of rule (+)
					var startPos = options.pos;
					var dataArray = [];
					
					var backup_start = start;
					options.start = lang[ start ][x][y][1];
					var r = Parser(options);
					start = backup_start
					
					var ci = 0;
					if(debug) console.log("back to",start);
					if(r.result) {
						dataArray.push(r);
						while(r.result) {
							ci += 1;
							var miniback2 = options.pos;
														
							var backup_start = start;
							options.start = lang[ start ][x][y][1];
							var r = Parser(options);
							start = backup_start;
					
							if(debug) console.log("back to",start);
							if(!r.result) {
								options.pos = miniback2;
							} else {
								dataArray.push(r);
							}
						}
						ruleData.push({type:3,count:ci,range:[startPos,options.pos],data:dataArray});
					} else {
						options.pos = startPos;
						rule = false;
						break;
					}
				} else if( lang[ start ][x][y][0] == 2 ) { // empty
					ruleData.push({type:2});
				} else if(lang[ start ][x][y][0] == 5) { // code range
					if( 
						doc.length> 0 && 
						(doc.length - options.pos) > 0 && 
						doc.charCodeAt(options.pos) >= lang[ start ][x][y][1] && 
						doc.charCodeAt(options.pos) <= lang[ start ][x][y][2] 
					) {
						var startPos = options.pos;
						options.pos += 1;
						ruleData.push({type:5,range:[startPos, options.pos]});
					} else {
						rule = false;
						break;
					}
				} else if(lang[start][x][y][0] == 6) { // array of rule(*)
					var miniback = options.pos;
					var dataArray = [];
					
					var backup_start = start;
					options.start = lang[ start ][x][y][1];
					var r = Parser(options);
					start = backup_start;
					
					
					if(debug) console.log("back to",start);
					var ci = 0;
					if(r.result) {
						dataArray.push(r);
						while(r.result) {
							ci += 1;
							var miniback2 = options.pos;
							
							var backup_start = start;
							options.start = lang[ start ][x][y][1];
							var r = Parser(options);
							start = backup_start;
							
							if(debug) console.log("back to",start);
							if(!r.result) {
								options.pos = miniback2;	
							} else {
								dataArray.push(r);
							}
						}
						ruleData.push({type:6,count:ci,range:[miniback,options.pos],data:dataArray});
					} else {
						options.pos = miniback;
						ruleData.push({type:6,count:0,range:[miniback,options.pos],data:[]});
					}
				} else if(lang[start][x][y][0] == 7) { // typed array {n,m}					
					var min = lang[start][x][y][2];
					var max = lang[start][x][y][3];
					var ci = 0;
					var miniback = options.pos;
					var dataArray = [];
					
					var backup_start = start;
					options.start = lang[ start ][x][y][1];
					var r = Parser(options);
					start = backup_start;
					
					
					if(r.result) {
						dataArray.push(r);					
						while(r.result) {
							ci += 1;
							if( ci >= max ) {
								break;
							}
							var miniback2 = options.pos;
							
							var backup_start = start;
							options.start = lang[ start ][x][y][1];
							r = Parser(options);
							start = backup_start;
					
							if(!r.result) {
								options.pos = miniback2;
							} else {
								dataArray.push(r);
							}
						}
						if(ci < min) {
							rule = false;
							break;
						}
						if(rule) {
							ruleData.push({type:7,count:ci,range:[miniback,options.pos],data:dataArray});
						}
					} else {
						options.pos = miniback;
						if(min>0) {
							rule = false;
							break;
						} else {
							ruleData.push({type:7,count:0,range:[miniback,miniback],data:dataArray});
						}
					}						
				} else if(lang[start][x][y][0] == 8) { // set var function
					// 8, target, function, args
					var arr = [];
					for(var z = 0; z < lang[start][x][y][3].length;z++) {
						arr.push( options.vars[ lang[start][x][y][3][z] ] );
					}
					var data = lang[start][x][y][2].apply(null,arr);
					options.vars[ lang[start][x][y][1] ] = data;
					ruleData.push({type:8,range:[options.pos,options.pos],key:lang[start][x][y][1],value:data});
				} else if(lang[start][x][y][0] == 9) { // unset var
					// 9, target
					delete options.vars[ lang[start][x][y][1] ];
					ruleData.push({type:9,range:[options.pos,options.pos],key:lang[start][x][y][1]});
				} else if(lang[start][x][y][0] == 10) { // choice path by var, first path is first bit, second path is second bit
					// 10, target, paths
					var data = options.vars[ lang[start][x][y][1] ];
					var startPos = options.pos;
					var dataArray = [];
					var ruleArray = [];
					for(var z = 0; z < lang[start][x][y][2].length;z++) {
						if( (data & (1<<z)) > 0 ) {
						
							var backup_start = start;
							options.start = lang[ start ][x][y][2][z];
							var r = Parser(options);
							start = backup_start;
							
							if(r.result) {
								dataArray.push(r);
								ruleArray.push(lang[start][x][y][2][z]);
							} else {
								rule = false;
								break;
							}
						}
					}
					if(rule == false) break;
					else {
						ruleData.push({type:10,value:data,range:[startPos,options.pos],data:dataArray,rules:ruleArray});
					}
				} else if(lang[start][x][y][0] == 11) { // anychar
					if( 
						doc.length> 0 && 
						(doc.length - options.pos) > 0
					) {
						var startPos = options.pos;
						options.pos += 1;
						ruleData.push({type:11,range:[startPos, options.pos]});
					} else {
						rule = false;
						break;
					}
				} else if(lang[start][x][y][0] == 12) { // error
					options.errors.push([options.pos,lang[start][x][y][1]]);
					rule = false;
					break;
				} else if(lang[start][x][y][0] == 13) { // if
					var miniback = options.pos;
					
					var backup_start = start;
					options.start = lang[ start ][x][y][1];
					var r = Parser(options);
					start = backup_start;
					
					
					if(r.result) {
						options.pos = miniback;
						ruleData.push({type:13, rule: lang[ start ][x][y][1]});
					} else {
						rule = false;
						break;
					}
				} else if(lang[start][x][y][0] == 14) { // ifn
					var miniback = options.pos;
					
					var backup_start = start;
					options.start = lang[ start ][x][y][1];
					var r = Parser(options);
					start = backup_start;
					
					if(!r.result) {
						options.pos = miniback;
						ruleData.push({type:14, rule: lang[ start ][x][y][1]});
					} else {
						rule = false;
						break;
					}
				} else if(lang[start][x][y][0] == 15) {
					options.comments.push( lang[start][x][y][1] );
				} else {
					console.log("item code:",JSON.stringify(lang));
					throw "unkown rule item type";
				}
			}
			if(rule == true) {
				parsed = true;
				break;
			}
		}
	} else {
		throw "unkown " + start + " in given language";
	}
	
	if(debug) console.log(">> webshell end parsing");
	if(debug) console.log(parsed,start,backtrack,options.pos);
	options.callstack.pop();
	ret.result = parsed;
	ret.name = start;
	ret.index = ruleIndex;
	ret.data = ruleData;
	if(ret.data.length>0) {
		ret.range = [
			backtrack,
			options.pos
		]
	}
	ret.errors = options.errors;
	ret.comments = options.comments;
	ret.code = doc;
	
	//Lang({cmd:"run"},"main",ret);
	if(run) {
		var data = ret;
		if(data.result) {
			if(debug) console.log(">> webshell start event handling");
			// console.log(JSON.stringify(events));
			var stack = [ data ];
			while(stack.length>0) {
				var rule = stack.shift();
				//console.log(rule,rule.name);
				if("data" in rule) { // get string of each item to pass to event
					for(var x = 0; x < rule.data.length;x++) {
						stack.unshift(rule.data[rule.data.length-1-x]);
					}
				}
				
				if(rule.name in events) {
					var arr = [];
					for(var x = 0; x < rule.data.length;x++) {
						if("range" in rule.data[x]) {
							arr.push( data.code.substring( rule.data[x].range[0], rule.data[x].range[1] ) );
						}
					}
					// console.log("@@ TRIGGER!!",rule.index,arr);
					// first argument is context, which is the machine
					events[ rule.name ](  options.context /*machine*/,rule.index, arr  );
				}
			}
			if(debug) console.log(">> webshell end event handling");
		}
	}
	return ret;	
}

Parser["ruleItem"] = function(a) {
	return [0,a];
}
Parser["string"] = function(a) {
	return [1,a];
}
Parser["tautology"] = function() {
	return [2];
}
Parser["oneOrMoreRules"] = function(a) {
	return [3,a];
}
Parser["charset"] = function(a) {
	return [4,a];
}
Parser["codeRange"] = function(a,min,max) {
	return [5,min,max];
}
Parser["zeroOrMoreRules"] = function(a) {
	return [6,a];
}
Parser["ruleAmount"] = function(a,min,max) {
	return [7,a,min,max];
}
Parser["set"] = function(name,f,args) {
	return [8,name,f,args];
}
Parser["unset"] = function(name) {
	return [9,name];
}
Parser["choice"] = function(name,choices) {
	return [10,name,choices];
}
Parser["anychar"] = function() {
	return [11];
}
Parser["error"] = function(a) {
	return [12,a];
}
Parser["if"] = function(a) {
	return [13,a];
}
Parser["ifn"] = function(a) {
	return [14,a];
}
Parser["comments"] = function(a) {
	return [15,a];
}

module.exports = Parser;