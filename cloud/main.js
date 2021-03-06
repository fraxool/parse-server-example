Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('declineFromUserRequest', function(request, response) {
	Parse.initialize(process.env.APP_ID, '', process.env.MASTER_KEY);
	Parse.serverURL = "https://mysnap.herokuapp.com/parse";	
	
	Parse.Cloud.useMasterKey();
	
	var userTargetId = request.params.userTargetId;
	var toUserId = request.params.toUserId;
	
	// Get the user to update
	var query = new Parse.Query(Parse.User);
      	query.equalTo("objectId", userTargetId);

      	query.first({
		success: function(quser) {
			
			// -- Remove request from "from" user array
			quser.remove("requestUserIds", toUserId);
			
			quser.save();
			response.success("From User UPDATED");
			
		},
		error: function(err) {
			response.error(err);
		}
      	});
});

Parse.Cloud.define('acceptFromUserRequest', function(request, response) {
	Parse.initialize(process.env.APP_ID, '', process.env.MASTER_KEY);
	Parse.serverURL = "https://mysnap.herokuapp.com/parse";	
	
	Parse.Cloud.useMasterKey();
	
	var userTargetId = request.params.userTargetId;
	var toUserId = request.params.toUserId;
	
	// Get the user to update
	var query = new Parse.Query(Parse.User);
      	query.equalTo("objectId", userTargetId);

      	query.first({
		success: function(quser) {
			
			// -- Remove request from "from" user array
			quser.remove("requestUserIds", toUserId);
			
			// -- Add friend to "from" user array
			quser.addUnique("friendUserIds", toUserId);
			
			quser.save();
			response.success("From User UPDATED");
			
		},
		error: function(err) {
			response.error(err);
		}
      	});
});

Parse.Cloud.define('sendPush', function(request, response) {
	var sendNotification = function(data) {
		var headers = {
	    	"Content-Type": "application/json",
	    	"Authorization": "Basic " + process.env.ONE_SIGNAL_REST_API
	  	};
	  
	  	var options = {
	    	host: "onesignal.com",
	    	port: 443,
			path: "/api/v1/notifications",
	    	method: "POST",
	    	headers: headers
	  	};
	  
	  	var https = require('https');
	  	var req = https.request(options, function(res) {  
	  		res.on('data', function(data) {
	    		console.log("Response:");
	      		console.log(JSON.parse(data));
	   		});
	  	});
	  
	  	req.on('error', function(e) {
	  		console.log("ERROR:");
	    	console.log(e);
	  	});
	  
	  	req.write(JSON.stringify(data));
	  	req.end();
	};
	
	var message = { 
		app_id: process.env.ONE_SIGNAL_APP_ID,
	  	contents: {"en": "English Message"},
	  	included_segments: ["All"]
	};
	
	sendNotification(message);
});

/*
Parse.Cloud.define('sendPush', function(request, response) {
	
	Parse.initialize(process.env.APP_ID, '', process.env.MASTER_KEY);
	Parse.serverURL = "https://mysnap.herokuapp.com/parse";
	
	// request has 2 parameters: params passed by the client and the authorized user
	var userTo = request.params.userTo;
	
	// extract out the channel to send
	var message = request.params.message;
	
	// use to custom tweak whatever payload you wish to send
	var query = new Parse.Query(Parse.User);
      	query.equalTo("objectId", userTo);

	 // Get the first user which matches the above constraints.
      	query.first({
		success: function(quser) {
			var pushQuery = new Parse.Query(Parse.Installation);
			pushQuery.equalTo("user", quser);
	
			// Note that useMasterKey is necessary for Push notifications to succeed.
			Parse.Push.send({
				where: pushQuery,      // for sending to a specific channel
				data: {
					"alert": message, 
					"content-available": 1,
					"notifType": 1
			  	}
			}, { 
				success: function() {
				console.log("#### PUSH OK");
				response.success("PUSH SENT");
			}, 	error: function(error) {
				console.log("#### PUSH ERROR" + error.message);
				response.error("error => " + error.message);
			}, useMasterKey: true});
		},
		error: function(err) {
			response.error(err);
		}
	});
	

	
});
*/
