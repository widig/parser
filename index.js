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
			CharsetSpaceNL : [ [[4," \r\n\t"]] ],
			CharsetAlphaLower : [ [[4,"abcdefghijklmnopqrstuvwxyz"]] ],
			CharsetAlphaUpper : [ [[4,"ABCDEFGHIJKLMNOPQRSTUVWXYZ"]] ],
			CharsetAlpha : [ [[4,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"]] ],
			CharsetPunctuation : [ [[4,"`~!@#$%^&*()_+-=[]{}\\|;:'\",./<>?"]] ],
			CharsetNonBlank : [ [[4,"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()_+-=[]{}\\|;:'\",./<>?"]] ],
			CharsetDigit : [ [[4,"0123456789"]] ],
			CharsetPositiveDigit : [ [[4,"123456789"]] ],
			ArraySpaceNLOptional : [ 
				[[6,"CharsetSpaceNL"]],
				[[2]]
			],
			PreIdentifier : [ 
				[[0,"CharsetAlpha"],[3,"CharsetNonBlank"]],
				[[0,"CharsetAlpha"]],
			],
			Identifier : [ [[0,"PreIdentifier"]] ],
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
			BinaryOperator : [ [[1,"+"]],[[1,"**"]],[[1,"*"]],[[1,"-"]],[[1,"%"]],[[1,"/"]],[[1,"<<"]],[[1,">>"]],[[1,"%"]],[[1,"&"]],[[1,"|"]],[[1,"^"]] ],
			StatementBinaryExpression : [
				[[0,"Integer"],[0,"BinaryOperator"],[0,"StatementBinaryExpression"]],
				[[0,"Integer"],[0,"StatementBinaryExpressionEval"]]
			],
			StatementBinaryExpressionEval : [
				[[2]]
			],
			StatementCreateOperator : [ [[1,"create"],[0,"ArraySpaceNLOptional"],[1,"operator"], [0,"ArraySpaceNLOptional"], [0,"TypeName"], [0,"ArraySpaceNLOptional"], [0,"TypeName"], [0,"ArraySpaceNLOptional"], [0,"PositiveInteger"] ] ], // first typename is symbol, second typename is reference to a binary function that implements float, integer and boolean overloads of binary functions that handles that operator
			StatementRemoveOperator : [ [[1,"remove"],[0,"ArraySpaceNLOptional"],[1,"operator"], [0,"ArraySpaceNLOptional"], [0,"TypeName"]] ],
			StatementCommit : [ [[1,"commit"]] ],
			AssignmentOperator : [ [[1,"="]] ],
			StatementExpression : [ 
				[ [0,"Identifier"],[0,"ArraySpaceNLOptional"],[1,"="],[0,"ArraySpaceNLOptional"],[0,"StatementBinaryExpression"]],
				[ [0,"StatementBinaryExpression"]]
			],
			Statement : [
				[[0,"StatementExpression"]]
				, [[0,"StatementCreateOperator"]]
				, [[0,"StatementRemoveOperator"]]
				, [[0,"StatementCommit"]]
			], // operator_list is a special variable that return a list of strings of operator with precedence groupings in order of evaluation
			main : [
				[[0,"Statement"]]
			]
		},
		events : {
			"Integer" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("integer" in ctx.type)) {
					ctx.type.integer = [];
				}
				ctx.type.integer.push(parseInt(data[0]));
				console.log("@"+parseInt(data[0]));
			},
			"Identifier": function(ctx,index,data) {
				console.log(JSON.stringify(data));
			},
			"BinaryOperator" : function(ctx,index,data) {
				if(!("type" in ctx)) {
					ctx.type = {};
				}
				if(!("operator" in ctx.type)) {
					ctx.type.operator = [];
				}
				ctx.type.operator.push(data[0]);
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
					var a = ctx.type.integer.splice( sel , 1 )[0]
					var b = ctx.type.integer.splice( sel , 1 )[0];
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
				
			}
		}
	}
	var r = parser(options);
	if(r.result) {
		console.log("PARSED:"+r.code.substring(r.range[0],r.range[1]));
	}
	if(data == "exit") throw "exit";
});