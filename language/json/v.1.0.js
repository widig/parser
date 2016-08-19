var ansi = require("./../../ansi.js");

module.exports = {
	"main" : function(ctx,index,data) {
		if(!("key" in ctx)) {
			ctx.key = false;
		}
		if(!("_object" in ctx)) {
			ctx._object = [];
		}
		if(!("_array" in ctx)) {
			ctx._array = [];
		}
		if(!("_number" in ctx)) {
			ctx._number = 0;
		}
		if(!("_boolean" in ctx)) {
			ctx._boolean = false;
		}
		if(!("_string" in ctx)) {
			ctx._string = "";
		}
		if(!("_keys" in ctx)) {
			ctx._keys = [];
		}
		if(!("_order" in ctx)) {
			ctx._order = [];
		}
	},
	"main_finish" : function(ctx,index,data) {
		var type = ctx._order.pop();
		if(type == 4) {
			var target = ctx._object.pop();
			ctx.result = target;
			console.log("-->",JSON.stringify( target ));
		} else if(type ==5) {
			var target = ctx._array.pop();
			ctx.result = target;
			console.log("-->",JSON.stringify( target ));
		}
	},
	"member_bk" : function(ctx,index,data) {
		ctx.key = true;
		//console.log(">> NEW MEMBER");
	},
	"member_ak" : function(ctx,index,data) {
		ctx.key = false;
	},
	"member_bv" : function(ctx,index,data) {
		
		//console.log(">> NEW VALUE");
	},
	"member_av" : function(ctx,index,data) {
		//console.log(">> VALUE SET");
		var type = ctx._order.pop();
		if(type == 0) {
			var key = ctx._keys.pop();
			ctx._object[ ctx._object.length-1 ][ key ] = ctx._boolean;
			//console.log("::::",JSON.stringify( ctx._object[ ctx._object.length-1 ] ) );
		} else if(type == 1) {
			var key = ctx._keys.pop();
			ctx._object[ ctx._object.length-1 ][ key ] = ctx._number;
			//console.log("::::",JSON.stringify( ctx._object[ ctx._object.length-1 ] ) );
		} else if(type == 2) {
			var key = ctx._keys.pop();
			ctx._object[ ctx._object.length-1 ][ key ] = ctx._string;
			//console.log("::::",JSON.stringify( ctx._object[ ctx._object.length-1 ] ) );
		} else if(type == 3) {
			var key = ctx._keys.pop();
			ctx._object[ ctx._object.length-1 ][ key ] = null;
			//console.log("::::",JSON.stringify( ctx._object[ ctx._object.length-1 ] ) );
		} else if(type == 4) {
			var key = ctx._keys.pop();
			var target = ctx._object.pop();
			ctx._object[ ctx._object.length-1 ][ key ] = target;
			//console.log("::::",JSON.stringify( ctx._object[ ctx._object.length-1 ] ) );
		} else if(type == 5) {
			var key = ctx._keys.pop();
			var target = ctx._array.pop();
			ctx._object[ ctx._object.length-1 ][ key ] = target;
			//console.log("::::",JSON.stringify( ctx._object[ ctx._object.length-1 ] ) );
		}
		
	},
	"array" : function(ctx,index,data) {
		ctx._array.push([]);
		//console.log(">> ARR BEGIN");
	},
	"value_in" : function(ctx,index,data) {
		var type = ctx._order.pop();
		if(type == 0) {
			ctx._array[ ctx._array.length-1 ].push(ctx._boolean);
			//console.log("::::",JSON.stringify( ctx._array[ ctx._array.length-1 ] ) );
		} else if(type == 1) {
			ctx._array[ ctx._array.length-1 ].push(ctx._number);
			//console.log("::::",JSON.stringify( ctx._array[ ctx._array.length-1 ] ) );
		} else if(type == 2) {
			ctx._array[ ctx._array.length-1 ].push(ctx._string);
			//console.log("::::",JSON.stringify( ctx._array[ ctx._array.length-1 ] ) );
		} else if(type == 3) {
			ctx._array[ ctx._array.length-1 ].push(null);
			//console.log("::::",JSON.stringify( ctx._array[ ctx._array.length-1 ] ) );
		} else if(type == 4) {
			var target = ctx._object.pop();
			ctx._array[ ctx._array.length-1 ].push(target);
			//console.log("::::",JSON.stringify( ctx._array[ ctx._array.length-1 ] ) );
		} else if(type == 5) {
			var target = ctx._array.pop();
			ctx._array[ ctx._array.length-1 ].push(target);
			//console.log("::::",JSON.stringify( ctx._array[ ctx._array.length-1 ] ) );
		}
	},
	"array_finish" : function(ctx,index,data) {
		//console.log(">> ARR END");
		ctx._order.push(5);
	},
	"object" : function(ctx,index,data) {
		ctx._object.push({});
		//console.log(">> OBJ BEGIN");
	},
	"object_finish" : function(ctx,index,data) {
		//console.log(">> OBJ END");
		ctx._order.push(4);
	},
	"string" : function(ctx,index,data) {
		var str = data[1];
		var str2 = str;
		do {
			str2 = str;
			str = str2.replace("\\n","\n");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\r","\r");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\t","\t");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\b","\b");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\f","\f");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\\"","\"");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\\\","\\");
		} while(str!=str2);
		do {
			str2 = str;
			str = str2.replace("\\/","\/");
		} while(str!=str2);
		var re = /\\u([0-9a-fA-F]{4,4})/;
		var val = re.exec(str);
		while(val!=null) {
			str = str.replace("\\u" + val[1],String.fromCharCode( parseInt(val[1],16) ) );
			val = re.exec(str);
		}
		
		if(ctx.key) {
			//console.log("STRING",ansi.fg.white + data[1] + ansi.fg.yellow);
			ctx._keys.push(str);
		} else {
			ctx._string = str;
			ctx._order.push(2);
		}
	},
	"number" : function(ctx,index,data) {
		//console.log(">> NUMBER");
		ctx._number = parseFloat( data[0] );
		ctx._order.push(1);
	},
	"boolean" : function(ctx,index,data) {
		//console.log(">> BOOLEAN");
		if(data[0] == "true") {
			ctx._boolean = true;
		} else if(data[0] == "false") {
			ctx._boolean = false;
		}
		ctx._order.push(0);
	},
	"null" : function(ctx,index,data) {
		//console.log(">> NULL");
		ctx._order.push(3);
	},
}