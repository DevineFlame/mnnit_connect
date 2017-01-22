
var path = require('path');
var express = require('express');
//var session = require('client-sessions');

var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser=require('body-parser');
var ws = require('ws');
var minimist = require('minimist');
var url = require('url');
var fs    = require('fs');
var https = require('https');
var db=require('./included/db_init.js');
var user_object=require('./included/user.js');



var app = express();
app.use(bodyParser());


app.use(cookieParser());

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));


app.post('/signup', function(req, res) {
 
  var user=req.body.user;
  var passwd=req.body.pass;
  var email=req.body.email;
  var post=[user,passwd,email,0];
 // console.log(post);
  user_object.is_user_exist(user,function(result){
    if(result===1){
      console.log("user exist----");
     res.send("user exist choose other name");
    }
    else {
      console.log("user does not exist");
      user_object.insert_user(post,function(result){
        if(result===1){
         console.log("inserted");
         res.redirect('index.html?msg=signup_success');
       }
         else{
            console.log("not inserted");
           res.redirect('error.html?msg=signup_fails');

         } 
      });
      
    }
  });
  
});



app.post('/login', function(req, res) {
 
  var user=req.body.user;
  var passwd=req.body.pass;

  var post=[user,passwd];
 // console.log(post);
  
      user_object.check_user(user,passwd,function(result){
        if(result.length>0){
         console.log("loging_successful");
        console.log(result[0].username); // set the sessions 

         req.session.user=result[0].username;
         req.session.passwd=result[0].password;
         req.session.active=result[0].active;
         req.session.email=result[0].email;

         console.log(req.session.user);

         user_object.update_status(user,passwd,1,function(result){

                     if(result==1)
                      console.log("user activated");
                    else{
                      console.log("user not activated");
                    }
         });
         res.redirect('home.html');
       }
         else{
            console.log("login failed");
           res.redirect('index.html?msg=login_fails');

         } 
      });
      
  
  });




app.get('/logout', function (req, res) {
  
          console.log("kuch to do",req.session.user);

  user_object.update_status(req.session.user,req.session.passwd,0,function(result){

                     if(result==1){
                      console.log("user deactivated");
                        req.session.destroy();
                        res.redirect('index.html');
                    }
                    else{
                      console.log("user not deactivated");
                    }
         });
       
  
});
  




















var argv = minimist(process.argv.slice(2), {
  default: {
      as_uri: "https://localhost:8443/",
      ws_uri: "ws://localhost:8888/rdy"
  }
});

var options =
{
  key:  fs.readFileSync('keys/server.key'),
  cert: fs.readFileSync('keys/server.crt')
};








/*

 * Definition of global variables.
 */

var pipelines = {};
var candidatesQueue = {};
var idCounter = 0;

function nextUniqueId() {
    idCounter++;
    return idCounter.toString();
}













/*
 * Server startup
 */

var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = https.createServer(options, app).listen(port, function() {
    console.log('rdy server started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});






















var wss = new ws.Server({
    server : server,
    path : '/one2one'
});

//all connected to the server users 
var users = {};
  
//when a user connects to our sever 
wss.on('connection', function(connection) {
  
   console.log("User connected");
  
   //when server gets a message from a connected user 
   connection.on('message', function(message) { 
    var data; 
    
      //accepting only JSON messages 
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }
    
      //switching type of the user message 
      switch (data.type) { 
         //when a user tries to login
         case "login": 
            console.log("User logged", data.name); 
        
            //if anyone is logged in with this username then refuse 
            if(users[data.name]) { 
               sendTo(connection, { 
                  type: "login", 
                  success: false 
               }); 
            } else { 
               //save user connection on the server 
               users[data.name] = connection; 
               connection.name = data.name; 
          
               sendTo(connection, { 
                  type: "login", 
                  success: true 
               }); 
            } 
        
            break;
        
         case "offer": 
            //for ex. UserA wants to call UserB 
            console.log("Sending offer to: ", data.name);
        
            //if UserB exists then send him offer details 
            var conn = users[data.name]; 
        
            if(conn != null) { 
               //setting that UserA connected with UserB 
               connection.otherName = data.name; 
          
               sendTo(conn, { 
                  type: "offer", 
                  offer: data.offer, 
                  name: connection.name 
               }); 
            }
        
            break;
        
         case "answer": 
            console.log("Sending answer to: ", data.name); 
            //for ex. UserB answers UserA 
            var conn = users[data.name]; 
        
            if(conn != null) { 
               connection.otherName = data.name; 
               sendTo(conn, { 
                  type: "answer", 
                  answer: data.answer 
               }); 
            } 
        
            break; 
        
         case "candidate": 
            console.log("Sending candidate to:",data.name); 
            var conn = users[data.name];
        
            if(conn != null) { 
               sendTo(conn, { 
                  type: "candidate", 
                  candidate: data.candidate 
               }); 
            } 
        
            break;
        
         case "leave": 
            console.log("Disconnecting from", data.name); 
            var conn = users[data.name]; 
            conn.otherName = null; 
        
            //notify the other user so he can disconnect his peer connection 
            if(conn != null) {
               sendTo(conn, { 
                  type: "leave" 
              }); 
            }
        
            break;
        
         default: 
            sendTo(connection, { 
               type: "error", 
               message: "Command not found: " + data.type 
            }); 
        
            break; 
      }
    
   }); 
  
   //when user exits, for example closes a browser window 
   //this may help if we are still in "offer","answer" or "candidate" state 
   connection.on("close", function() { 
  
      if(connection.name) { 
         delete users[connection.name]; 
      
         if(connection.otherName) { 
            console.log("Disconnecting from ", connection.otherName); 
            var conn = users[connection.otherName]; 
            conn.otherName = null;
        
            if(conn != null) { 
               sendTo(conn, { 
                  type: "leave" 
               }); 
            }
         } 
      }
    
   });  
  
   connection.send("Hello world");  
});
  
function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}


app.use(express.static(path.join(__dirname, 'static')));
