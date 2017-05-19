/*******************************************/
/* Set up static file server */
/* Include the static file webserverlibrary*/
var static = require('node-static');

/* Include the http server library */
var http = require('http');

/* Assume we are runing on Heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

/* If we aren't on heroku, then we need to readjust the port ad directory
 * infromation and we know that because port won't be set */
if(typeof port == 'undefined' || !port){
	directory = './public';
	port = 8080;
}

/* set up a static web-server that will deliver files from the filesystem */
var file = new static.Server(directory);

/* construct an http server that gots the files from the file server */
var app = http.createServer(
	function(request,response){
		request.addListener('end',
			function(){
				file.serve(request,response);
				}	
			).resume();
		}
    ).listen(port);

console.log('The server is running'); 

/******************************************/
/*         Set up the web socket          */

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
	function log(){
		var array = ['*** Sever log Message: '];
		for(var i = 0; i < arguments.length; i++){
			array.push(arguments[i]);
			console.log(arguments[i]);
		}
		socket.emit('log',array);
		socket.broadcast.emit('log',array);
	}
	log('A website connected to the server');
	
	socket.on('disconnect',function(socket){
		log('A website disconnected from the server');
	});
	
	/* this is the join_room command */
	/* paload:
	   {
	 		'room': room to join,
	  		'username': username of person joining 
	 	}
	 	join room_room_response:
	 	{ 
	 		'result: 'success',
	 		'room': room joined,
	 		'username: username that joined
	 		'membership': nuber of people in the room including the new one
	 		}
	 		or 
	 		{ 
	 		'result: 'fail',
	 		'message': failure message
	 		}
	 */
	 
	 
	socket.on('join_room',function(payload){
		log('server received a command','join_room',payload);
		if(('undefined'=== typeof payload) || !payload){
			var error_message = 'join_room had no payload, command aborted';
			log(erroe_message);
			socket.emit('join_room_response',   { 
													result: 'fail',
													message: eror_message
													});
			return;
		}
		
		var room = payload.room;
		if(('undefined'=== typeof room) || !room){
			var error_message = 'join_room didn\'t specify a room, command aborted';
			log(erroe_message);
			socket.emit('join_room_response',   { 
													result: 'fail',
													message: eror_message
													});
			return;
		}
		var username = payload.username;
		if(('undefined'=== typeof username) || !username){
			var error_message = 'join_room didn\'t specify a username, command aborted';
			log(erroe_message);
			socket.emit('join_room_response',   { 
													result: 'fail',
													message: eror_message
													});
			return;
		}
				
		socket.join(room);
		
		var roomObject = io.sockets.adapter.rooms[room];
		if(('undefined'=== typeof roomObject) || !roomObject){
			var error_message = 'join_room couldn\'t create a room (internal error), command aborted';
			log(error_message);
			socket.emit('join_room_response',   { 
													result: 'fail',
													message: eror_message
													});	
			return;
		}
		
		var numClients = roomObject.length;
		var success_data = {
									result: 'success',
									room: room,
									username: username,
									membership: (numClients + 1)
							};
		io.sockets.in(room).emit('join_room_response',success_data);
		log('Room ' + room + ' was just joined by '+ username);					
		
	});



	/* send_message command */
	/* paload:
	   {
	 		'room': room to join,
	  		'username': username of person joining 
	 	}
	 	join room_room_response:
	 	{ 
	 		'result: 'success',
	 		'room': room joined,
	 		'username: username that joined
	 		'membership': nuber of people in the room including the new one
	 		}
	 		or 
	 		{ 
	 		'result: 'fail',
	 		'message': failure message
	 		}
	 */

	socket.on('send_message',function(payload) {
		log('server received a command','send_message',payload);
		if(('undefined' === typeof payload) || !payload) {
			var error_message = 'send_message had no payload, command aborted';
			log(error_message);
			socket.emit('send_message_response',  { 
													result: 'fail',
													message: error_message
												   });
			return;
		}
		
		var room = payload.room;
		if(('undefined' === typeof room) || !room) {
			var error_message = 'send_message did not specify a room, command aborted';
			log(error_message);
			socket.emit('send_message_response',   { 
													result: 'fail',
													message: error_message
													});
			return;
		}
		
		var username = payload.username;
		if(('undefined' === typeof username) || !username) {
			var error_message = 'send_message did not specify a username, command aborted';
			log(error_message);
			socket.emit('send_message_response',   { 
													result: 'fail',
													message: error_message
													});
			return;
		}
		
		
		var message = payload.message;
		if(('undefined' === typeof message) || !message) {
			var error_message = 'send_message did not specify a message, command aborted';
			log(error_message);
			socket.emit('send_message_response',   { 
													result: 'fail',
													message: error_message
													});	
			return;
		}
		
		var success_data = {
									result: 'success',
									room: room,
									username: username,
									messege: message
							};
							
		io.sockets.in(room).emit('send_message_response',success_data);
		log('Message sent to room ' + room + ' by ' + username + 'successfully' +JSON.stringify(success_data));		
					
	});
	
});


