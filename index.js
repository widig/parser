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
		lang : {
			CharsetSpaceNL : [ [[4," \r\n\t"]] ],
			CharsetAlphaLower : [ [[4,"abcdefghijklmnopqrstuvwxyz"]] ],
			CharsetAlphaUpper : [ [[4,"ABCDEFGHIJKLMNOPQRSTUVWXYZ"]] ],
			CharsetAlpha : [ [[4,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"]] ],
			CharsetPunctuation : [ [[4,"`~!@#$%^&*()_+-=[]{}\\|;:'\",./<>?"]] ],
			CharsetIdentifier : [ [[4,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*_+-{}\\|;:'\",./<>?"]] ],
			CharsetIdentifierConcatenatorHash : [ [[4,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@$%^&*()_+-=[]{}\\|;:'\",./<>?"]] ],
			CharsetIdentifierConcatenatorSign : [ [[4,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()_+-=[]{}\\|;:'\",./<?"]] ],
			CharsetDigit : [ [[4,"0123456789"]] ],
			CharsetPositiveDigit : [ [[4,"123456789"]] ],
			ArraySpaceNLOptional : [ 
				[[0,"CharsetSpaceNL"]],
				[[2]]
			],
			PreIdentifier : [ 
				[[0,"CharsetAlpha"],[3,"CharsetIdentifier"]],
				[[0,"CharsetAlpha"]],
			],
			Identifier : [ [[0,"PreIdentifier"]] ],
			InlineArgumentBaseOp : [ [[1,":"]] ],
			InlineArgument : [ [[1,"["],[6,"InlineArgumentBaseOp"],[0,"NonNegativeIntegerJustNumber"],[1,"]"]] ],
			PreNonNegativeIntegerJustNumber : [
				[[0,"Zero"]],
				[[0,"CharsetPositiveDigit"],[6,"CharsetDigit"]]
			],
			NonNegativeIntegerJustNumber : [
				[[0,"PreNonNegativeIntegerJustNumber"]]
			],
			TypeName : [ [[3,"CharsetNonBlank"]] ],
			ArrayDigit : [ [[3,"CharsetDigit"]] ],
			PlusSignalOptional : [[[1,"+"]],[[2]]],
			MinusSignal : [[[1,"-"]]],
			PrePositiveInteger : [ [[0,"PlusSignalOptional"],[0,"CharsetPositiveDigit"],[6,"CharsetDigit"]] ],
			PositiveInteger : [ [[0,"PrePositiveInteger"]] ],
			PreNegativeInteger : [ [[0,"MinusSignal"],[0,"CharsetPositiveDigit"],[6,"CharsetDigit"]] ],
			NegativeInteger : [ [[0,"PreNegativeInteger"]] ],
			Zero : [ [[1,"0"]] ],
			PreInteger : [ [[0,"NegativeInteger"]],[[0,"Zero"]],[[0,"PositiveInteger"]]  ],
			Integer : [ [[0,"PreInteger"]]  ],
			IdentifierConcatenatorHashCharRule : [
				[[1,"\\#"]],
				[[0,"CharsetIdentifierConcatenatorHash"]]
			],
			IdentifierConcatenatorSignCharRule : [
				[[1,"\\>"]],
				[[0,"CharsetIdentifierConcatenatorSign"]]
			],
			IndentifierConcatenator : [ 
				[[1,"<"],[6,"IdentifierConcatenatorSignCharRule"],[1,">"]],
				[[1,"#"],[6,"IdentifierConcatenatorHashCharRule"],[1,"#"]],
				[[1,"#"],[6,"IdentifierConcatenatorSignCharRule"],[1,">"]],
				[[1,"<"],[6,"IdentifierConcatenatorHashCharRule"],[1,"#"]]
			],
			BinaryOperator : [ 
				[[1,"+"]],
				[[1,"Log"]],
				[[1,"**"]],
				[[1,"*"]],
				[[1,"-"]],
				[[1,"%"]],
				[[1,"/"]],
				[[1,"<<"]],
				[[1,">>"]],
				[[1,"%"]],
				[[1,"&"]],
				[[1,"|"]],
				[[1,"^"]],
				[[0,"IndentifierConcatenator"]] 
			],
			Call : [
				[[0,"CallBegin"],[0,"Identifier" /* name expression*/],[1,"("],[0,"ArraySpaceNLOptional"],[0,"StatementBinaryExpressionArrayOptionalForCall"],[1,")"],[0,"CallEval"]]
			],
			CallBegin : [
				[[2]]
			],
			CallEval : [
				[[2]]
			],
			Element : [
				[[0,"Call"]],
				[[0,"Integer"]],
				[[0,"InlineArgument"]],
				[[0,"Identifier"]]
			],
			HasInlineArgument : [
				[[2]]
			],
			ConvertMemoryToInteger : [
				[[2]]
			],
			StatementBinaryExpressionArrayOptionalForCall : [
				[[0,"StatementBinaryExpressionArrayForCall"]],
				[[2]]
			],
			StatementBinaryExpressionArrayForCall : [
				[[0,"StatementBinaryExpression"],[0,"ArraySpaceNLOptional"],[1,","],[0,"ArraySpaceNLOptional"],[0,"StatementBinaryExpressionArrayForCall"]],
				[[0,"StatementBinaryExpression"],[0,"ArraySpaceNLOptional"]]
			],
			StatementBinaryExpression : [
				[[0,"Element"],[0,"ArraySpaceNLOptional"],[0,"BinaryOperator"],[0,"ArraySpaceNLOptional"],[0,"StatementBinaryExpression"]],
				[[0,"Element"],[0,"StatementBinaryExpressionEval"]]
			],
			StatementBinaryExpressionEval : [
				[[2]]
			],
			StatementCreateOperator : [ [[1,"create"],[0,"ArraySpaceNLOptional"],[1,"operator"], [0,"ArraySpaceNLOptional"], [0,"TypeName"], [0,"ArraySpaceNLOptional"], [0,"TypeName"], [0,"ArraySpaceNLOptional"], [0,"PositiveInteger"] ] ], // first typename is symbol, second typename is reference to a binary function that implements float, integer and boolean overloads of binary functions that handles that operator
			StatementRemoveOperator : [ [[1,"remove"],[0,"ArraySpaceNLOptional"],[1,"operator"], [0,"ArraySpaceNLOptional"], [0,"TypeName"]] ],
			StatementStatusContext : [ [[1,"StatusContext"]] ],
			StatementPopContext : [ [[1,"PopContext"]] ],
			StatementPushContext : [ [[1,"PushContext"]] ],
			AssignmentOperator : [ 
				[[1,"C="]],
				[[1,"O="]],
				[[1,"N="]],
				[[1,"="]],
			],
			LeftHandIdentifier : [
				[[0,"StatementBinaryExpression"],[0,"LeftHandIdentifierEval"]]
			],
			LeftHandIdentifierEval : [
				[[2]]
			],
			RightHandIdentifier : [
				[[0,"StatementBinaryExpression"],[0,"RightHandIdentifierEval"]]
			],
			RightHandIdentifierEval : [
				[[2]]
			],
			StatementExpression : [ 
				[ [0,"LeftHandIdentifier"],[0,"ArraySpaceNLOptional"],[0,"AssignmentOperator"],[0,"ArraySpaceNLOptional"],[0,"RightHandIdentifier"],[0,"StatementExpressionEval"]],
				[ [0,"StatementBinaryExpression"],[0,"StatementExpressionEval"]]
			],
			IsDefinition : [
				[[2]]
			],
			StatementExpressionEval : [
				[[2]]
			],
			StatementIdentifiers : [
				[[2]]
			],
			Statement : [
				[[0,"StatementStatusContext"]]
				, [[0,"StatementPopContext"]]
				, [[0,"StatementPushContext"]]
				, [[0,"StatementExpression"]]
				, [[0,"StatementCreateOperator"]]
				, [[0,"StatementRemoveOperator"]]
				, [[0,"StatementIdentifiers"]]
			], // operator_list is a special variable that return a list of strings of operator with precedence groupings in order of evaluation
			main : [
				[[0,"Statement"]]
			]
		},
		events : {
			"CallBegin" : function(ctx,index,data) { 
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				//console.log("CALL BEGIN");
			},
			"CallEval" : function(ctx,index,data) { 
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("memory" in ctx)) {
					ctx.memory = {};
				}
				//console.log("CALL EVAL");
				
				ctx.order.shift();
				var id = ctx.type.identifier.shift();
				if(!(id in ctx.memory)) {
					throw id + " not found.";
				}
				var args = [];
				while(ctx.order.length>0) {
					var type = ctx.order.shift();
					if(type == 2) {
						args.push(ctx.type.integer.shift());
					} else {
						//console.log(type);
						throw "not implemented.";
					}
				}
				
				if(!("arguments" in ctx)) {
					ctx.arguments = [];
				}
				ctx.arguments.push(args); // scope of arguments;
				
				// eval
				
				var total = 0;
				var mem = ctx.memory[id];
				var val = [];
				var op = [];
				var offset = [
					mem.type.arguments.length-1,
					mem.type.operator.length-1,
					mem.type.integer.length-1
				];
				for(var x = 0; x < mem.order.length;x++) {
					if( mem.order[x] == 0 ) {
						var a = mem.type.arguments[ offset[0]-- ];
						//console.log(a);
						val.push( ctx.arguments[ ctx.arguments.length-1 - a[0] ][ a[1] ] );
					} else if( mem.order[x] == 1) {
						var a = mem.type.operator[ offset[1]-- ];
						//console.log(a);
						op.push( a );
					} else if( mem.order[x] == 2) {
						var a = mem.type.integer[ offset[2]--];
						//console.log(a);
						val.push( a );
					}
				}
				
				while(op.length>0) {
					//console.log("val",val,"op",op);	
					var level = -1;
					for(var x = 0; x < op.length;x++) {
						if( ( op[x] == "**" || op[x] == "Log")  && level < 4) {
							sel = x;
							level = 4;
						} else if( ( op[x] == "*" || op[x] == "/"|| op[x] == "%")  && level < 3) {
							sel = x;
							level = 3;
						} else if( ( op[x] == "+"  || op[x] == "-" ) && level < 2) {
							sel = x;
							level = 2;
						} else if( ( op[x] == "&"  || op[x] == "|" || op[x] == "^") && level < 1) {
							sel = x;
							level = 1;
						} else if( ( op[x] == ">>"  || op[x] == "<<") && level < 0) {
							sel = x;
							level = 0;
						}
					}
					var a = val.splice( sel, 1)[0];
					var b = val.splice( sel, 1)[0];
					var sop = op.splice( sel , 1 )[0];
					//console.log(">>",sel,a,b,op);
					if(sop == "Log") {
						val.splice( sel, 0, ( Math.log( a) / Math.log( b) )>>> 0 );
					} else if(sop == "**") {
						val.splice( sel, 0, Math.pow( a, b) >>> 0 );
					} else if(sop == "+") {
						val.splice( sel, 0, a + b);
					} else if(sop == "-") {
						val.splice( sel, 0, a - b);
					} else if(sop == "*") {
						val.splice( sel, 0, a * b);
					} else if(sop == "/") {
						val.splice( sel, 0, a / b);
					} else if(sop == "%") {
						val.splice( sel, 0, a % b);
					} else if(sop == "|") {
						val.splice( sel, 0, (a>>>0) | (b>>>0));
					} else if(sop == "&") {
						val.splice( sel, 0, (a>>>0) & (b>>>0));
					} else if(sop == "^") {
						val.splice( sel, 0, (a>>>0) ^ (b>>>0));
					} else if(sop == ">>") {
						val.splice( sel, 0, (a>>>0) >> (b>>>0));
					} else if(sop == "<<") {
						val.splice( sel, 0, (a>>>0) << (b>>>0));
					}
					//console.log(JSON.stringify(val));
					//console.log(op);
				}
				
				console.log("OK",JSON.stringify(val));
				
			},
			"InlineArgument" : function(ctx,index,data) { 
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("arguments" in ctx.type)) {
					ctx.type.arguments = [];
				}
				ctx.type.arguments.push( [ data[1].length, parseInt(data[2]) ] );
				ctx.order.push(0);
				//console.log("INLINE ARGUMENT",JSON.stringify(data));
			},
			"Integer" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("integer" in ctx.type)) {
					ctx.type.integer = [];
				}
				//console.log("INTEGER",JSON.stringify(data));
				ctx.order.push(2);
				ctx.type.integer.push(parseInt(data[0]));
			},
			"LeftHandIdentifier" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("identifier" in ctx.type)) {
					ctx.type.identifier = [];
				}
				//console.log("LEFTHAND BEGIN",JSON.stringify(data));
				ctx.order.push(4);
			},
			"LeftHandIdentifierEval" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("identifier" in ctx.type)) {
					ctx.type.identifier = [];
				}
				//console.log("LEFTHAND END",JSON.stringify(data));
				ctx.order.push(5);
			},
			"RightHandIdentifier" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("identifier" in ctx.type)) {
					ctx.type.identifier = [];
				}
				//console.log("RIGHTHAND BEGIN",JSON.stringify(data));
				ctx.order.push(6);
			},
			"RightHandIdentifierEval" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("identifier" in ctx.type)) {
					ctx.type.identifier = [];
				}
				//console.log("RIGHTHAND END",JSON.stringify(data));
				ctx.order.push(7);
			},
			"Identifier": function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("identifier" in ctx.type)) {
					ctx.type.identifier = [];
				}
				//console.log("IDENTIFIER",JSON.stringify(data));
				ctx.order.push(3);
				ctx.type.identifier.push(data[0]);
			},
			"ConvertMemoryToInteger" : function(ctx,index,data) {
				/*
				if("memory" in ctx) {
					if(ctx.type.identifier.length>0) {
						if(ctx.type.identifier[ ctx.type.identifier.length-1] in ctx.memory) {
							ctx.type.integer.push( ctx.memory[ ctx.type.identifier.pop() ] );
						} else {
							console.log("1");
							throw "identififer " + ctx.type.identifier[ ctx.type.identifier.length-1] + " not found.";
						}
					} else {
						console.log("2");
						throw "must have a identifier";
					}
				} else {
					console.log("3");
					throw "memory not found.";
				}
				*/
			},
			"BinaryOperator" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("operator" in ctx.type)) {
					ctx.type.operator = [];
				}
				
				ctx.type.operator.push(data[0]);
				
				ctx.order.push(1);
				//console.log("OPERATOR",JSON.stringify(data));
			},
			"StatementExpressionEval": function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("order" in ctx)) {
					ctx.order = [];
				}
				if(!("arguments" in ctx.type)) {
					ctx.type.arguments = [];
				}
				if(!("identifier" in ctx.type)) {
					ctx.type.identifier = [];
				}
				if(!("memory" in ctx) || ctx.memory == undefined) {
					ctx.memory = {};
				}
				//console.log("STATEMENT EXPRESSION EVAL");
				var lefthand = false;
				var righthand = false;
				var identifier_reference = null;
				for(var x = 0; x < ctx.order.length;x++) {
					//console.log(ctx.order[x]);
					if(lefthand) {
						if(ctx.order[x] == 5) {
							lefthand = false;
						}
						if(lefthand) {
							//console.log(">>",ctx.order[x]);
							identifier_reference = ctx.type.identifier.pop();
							ctx.memory[ identifier_reference ] = {
								order : [],
								type : {
									operator : [],
									integer : [],
									arguments : []
								}
							}
						}
					} else {
						if(ctx.order[x] == 4) {
							lefthand = true;
						}
					}
					if(righthand) {
						if(ctx.order[x] == 7) {
							righthand = false;
						}
						if(righthand) {
							//console.log(">>",ctx.order[x]);
							ctx.memory[ identifier_reference ].order.push( ctx.order[x] );
							if(ctx.order[x] == 0) {
								var arg = ctx.type.arguments.pop();
								//console.log("!!",arg);
								ctx.memory[ identifier_reference ].type.arguments.push( arg );
							} else if(ctx.order[x] == 1) {
								var op = ctx.type.operator.pop();
								//console.log("!!",op);
								ctx.memory[ identifier_reference ].type.operator.push(op);
							} else if(ctx.order[x] == 2) {
								var i = ctx.type.integer.pop();
								//console.log("!!",i);
								ctx.memory[ identifier_reference ].type.integer.push(i);
							}
						}
					} else {
						if(ctx.order[x] == 6) {
							righthand = true;
						}
					}
				}
				while(ctx.order.length>0) ctx.order.pop();
				while(ctx.type.integer.length>0) ctx.type.integer.pop();
				while(ctx.type.operator.length>0) ctx.type.operator.pop();
				while(ctx.type.arguments.length>0) ctx.type.arguments.pop();
				while(ctx.type.identifier.length>0) ctx.type.identifier.pop();
				
				/*
				console.log("@ XC",ctx.type.identifier);
				
				if( ctx.type.identifier.length > 0 && ctx.type.integer.length > 0) {
					
					var identifier = ctx.type.identifier.pop();
					var value = ctx.type.integer.pop();
					
					ctx.memory[identifier ] = value;
					console.log("MEMORY DEFINED");
				}
				console.log("expr:",
					index,
					JSON.stringify(ctx.type.identifier),
					JSON.stringify(ctx.type.integer),
					JSON.stringify(ctx.type.operator),
					JSON.stringify(ctx.memory)
				);
				*/
				
			},
			"StatementExpression" : function(ctx,index,data) {
				/*
				if(index == 0) {
					console.log("@ XA");
				} else if(index == 1) {
					console.log("@ XB");
				}
				*/
			},
			"StatementStatusContext" : function(ctx,index,data) {
				if(!("memory" in ctx)) {
					ctx.memory = {};
				}
				console.log("STACK LEVEL:",ctx.context.length);
				console.log("MEMORY");
				for(var key in ctx.memory) {
					console.log("    " + key);
				}
			},
			"StatementPopContext" : function(ctx,index,data) {
				if(!("memory" in ctx)) {
					ctx.memory = {};
				}
				if(!("context" in ctx)) {
					var files = fs.readdirSync("memory");
					ctx.context = [];
					for(var x = 0; x < files.length;x++) {
						var obj = JSON.parse( fs.readFileSync( "memory" + path.sep + x + ".json", "utf8" ) );
						ctx.context.push(obj);
					}
				}
				if(ctx.context.length>0) {
					ctx.memory = ctx.context.pop();
					fs.unlinkSync("memory" + path.sep + ctx.context.length + ".json");
				}
			},
			"StatementPushContext" : function(ctx,index,data) {
				if(!("memory" in ctx)) {
					ctx.memory = {};
				}
				
				if(!("context" in ctx)) {
					var files = fs.readdirSync("memory");
					ctx.context = [];
					for(var x = 0; x < files.length;x++) {
						var obj = JSON.parse( fs.readFileSync( "memory" + path.sep + x + ".json", "utf8" ) );
						ctx.context.push(obj);
					}
				}
				fs.writeFileSync("memory" + path.sep + ctx.context.length + ".json",JSON.stringify(ctx.memory));
				ctx.context.push( ctx.memory );
			},
			"HasInlineArgument" : function(ctx,index,data) {
				
			},
			"StatementBinaryExpressionEval" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("operator" in ctx.type)) {
					ctx.type.operator = [];
				}
				if(!("integer" in ctx.type)) {
					ctx.type.integer = [];
				}
				/*
				
					A = 1
					B = A + 1
					B = B + 1 ( ambiguity 1> B = A + 1 + 1 or 2> B = B + 1 which is 3 then 4 then 5 ) to handle which formulae will replace older one 
					use B O= B + 1 == B = A + 1 + 1 and B N= B + 1, O= expand old formulae of B so the value, N= uses new formulae and keep old value
					in both cases B is function
					use B C= A +1 for constant value at the moment of evaluation
					B = :0 + 1
					B(1) = 2
					B = :
					
				*/
				
				/*
				while(ctx.type.operator.length>0) {
					var sel = -1;
					var level = -1;
					for(var x = 0; x < ctx.type.operator.length;x++) {
						if((ctx.type.operator[x] == "**" ||ctx.type.operator[x] == "*" ||  ctx.type.operator[x] == "/"||  ctx.type.operator[x] == "%" ) && level < 3) {
							sel = x;
							level = 3;
						} else if((ctx.type.operator[x] == "+" || ctx.type.operator[x] == "-") && level < 2) {
							sel = x;
							level = 2;
						} else if((ctx.type.operator[x] == "&" || ctx.type.operator[x] == "|" || ctx.type.operator[x] == "^") && level < 1) {
							sel = x;
							level = 1;
						} else if((ctx.type.operator[x] == "<<" ||  ctx.type.operator[x] == ">>" ) && level < 0) {
							sel = x;
							level = 0;
						}
					}
					if(sel==-1) {
						break;
					}
					var a = ctx.type.integer.splice( ctx.type.integer.length - ctx.type.operator.length + sel , 1 )[0]
					var b = ctx.type.integer.splice( ctx.type.integer.length - ctx.type.operator.length + sel , 1 )[0];
					var op = ctx.type.operator.splice( sel , 1 );
					if(op == "**") {
						ctx.type.integer.splice( sel , 0, Math.pow(a,b)>>>0 );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "*") {
						ctx.type.integer.splice( sel , 0, a * b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "/") {
						ctx.type.integer.splice( sel , 0, a / b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "%") {
						ctx.type.integer.splice( sel , 0, a % b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "+") {
						ctx.type.integer.splice( sel , 0, a + b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "-") {
						ctx.type.integer.splice( sel , 0, a - b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "&") {
						ctx.type.integer.splice( sel , 0, a & b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "|") {
						ctx.type.integer.splice( sel , 0, a | b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "^") {
						ctx.type.integer.splice( sel , 0, a ^ b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == "<<") {
						ctx.type.integer.splice( sel , 0, a << b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					} else if(op == ">>") {
						ctx.type.integer.splice( sel , 0, a >> b );
						console.log(a,b,op,JSON.stringify(ctx.type.integer));
					}
				}
				
				console.log("expr:",
					index,
					JSON.stringify(ctx.type.integer),
					JSON.stringify(ctx.type.operator)
				);
				*/
				
			}
		}
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