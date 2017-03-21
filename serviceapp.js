var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

WishMe = function(){
	var currentTime = new Date();
	var currentOffset = currentTime.getTimezoneOffset();
	var ISTOffset = 330;   // IST offset UTC +5:30 
	var myDate = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    if (myDate.getHours()>4 && myDate.getHours() < 12 ){ 
    return "Good Morning!"
	} else if (myDate.getHours() >= 12 && myDate.getHours() < 16 ) { 
	return "Good Afternoon!"; 
	} else if ( myDate.getHours() >= 16 && myDate.getHours() <= 22 ) { 
	return "Good Evening!";
	}else {
		return "I guess it is very late now, Anyway"
	} 
};

var connector = new builder.ChatConnector({appId:"", appPassword:""});
var bot = new builder.UniversalBot(connector);
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/69f922bb-7f9d-437d-8894-a98d2a6fe911?subscription-key=a544e8e344c947bbb85eb434961aea87&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

dialog.matches('Welcome', function (session, args) {
	console.log ('in greeting intent');	
	var username = session.message;
	session.send("Hello " +username.address.user.name+ ". " +WishMe());
	session.send("How can I help you?");
	session.endDialog();
});

dialog.matches('Issue', function (session, args, results) {
	console.log("in issue intent");
	var order = builder.EntityRecognizer.findEntity(args.entities, 'Order');
	var statuss = builder.EntityRecognizer.findEntity(args.entities, 'Order::status');
	var arrive = builder.EntityRecognizer.findEntity(args.entities, 'Order::arrive');
	var orderID = builder.EntityRecognizer.findEntity(args.entities, 'Order::OrderID');
	session.userData = {
		order   : order   ? order.entity   : "",
	    statuss : statuss ? order.entity   : "",
        arrive  : arrive  ? arrive.entity  : "",
        orderID : orderID ? orderID.entity : ""
	}
	if(session.userData.orderID == ""){
		session.beginDialog('/Ask OrderID');
	}else {
		session.send("Your order will be arriving on Monday");
	}
})

bot.dialog('/Ask OrderID', function (session, args, results){
	session.send("Please tell your order ID");
	session.endDialog();
})

dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");
    session.endDialog();	
});

dialog.matches('Where orderID', function (session, args, results) {
	session.send("Order ID will be there in the order confirmation message that was sent to you while ordering.");
	session.send("Or, you can go to our website Homepage --> My orders. Order ID is present on top of the respective ordered product. ")
    session.endDialog();
})

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || 8000, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
