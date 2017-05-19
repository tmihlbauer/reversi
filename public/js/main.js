/* functions for general use */

/* this function returns the value associated with 'whichParam on the URL */ 

function getURLParameters(whichParam)
{
	var pageURL = window.location.search.substring(1);
	var pageURLVariables = pageURL.split('&');
	for(var i = 0; i < pageURLVariables[i].length; i++)
		{
		var parameterName = pageURLVariables[i].split('=');
		if(parameterName[0] == whichParam){
			return parameterName[1];
		}
	}
}

var username = getURLParameters('username');
if('undefined' == typeof username || !username){
	
	username = 'Anonymous_'+Math.floor(Math.random()*100);
	}

$('#messages').append('<h4>'+username+'</h4>');


/* Connect to the socket server */

var socket = io.connect();

socket.on('log',function(array){
	console.log.apply(console,array);
});