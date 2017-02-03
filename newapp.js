var restify = require('restify');
var builder = require('botbuilder');
var https = require('https');

var data = "";

var connector = new builder.ChatConnector({appId:"", appPassword:""});
var bot = new builder.UniversalBot(connector);
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c592677c-d9ec-435d-bada-77008d9fc147?subscription-key=412111898d6f49a0b22467676f123ecb&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);
dialog.matches('ShoeSearch' , [ 
    function (session, args, next, results) {
	    console.log ('in shoesearch intent ');
	    var shoe = builder.EntityRecognizer.findEntity(args.entities, 'Shoe');
	    var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	    var brand = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_brand');
	    var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	    var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	    var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	    session.dialogData = {
		    shoe: shoe ? shoe.entity : "",
		    gender: gender ? capitalize(gender.entity) : "",
		    brand: brand ? capitalize(brand.entity) : "",
		    color: color ? capitalize(color.entity) : "",
		    type: type ? capitalize(type.entity) : "",
		    size: size ? size.entity : "",
		    path: "",
		    }
	    session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',session.dialogData.brand,session.dialogData.type,session.dialogData.color,session.dialogData.shoe,session.dialogData.gender,session.dialogData.size);		
	    builder.Prompts.choice(session, "Please select the gender?",["Men","Women"]);
	}, 
	function (session, args, next, results) {
		session.dialogData.gender = results.response.entity;
		session.send("You have selected %s",session.dialogData.gender);
    }
]);

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");	
});


// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.on('error', function() { console.log("error"); });
server.listen(process.env.port || 6000, function () {
    console.log('%s listening to %s', server.name, server.url); 
});