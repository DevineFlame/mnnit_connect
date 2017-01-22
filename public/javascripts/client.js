
    $("#idform").hide();
    $("#dcform").hide();
    $("#sendform").hide();

    $("#idform").submit(setMyId);
    $("#dcform").submit(connectTo);
    $("#sendform").submit(sendDirect);

    $("#setid").click(setMyId);
    $("#dc-connect").click(connectTo);
    $("#send").click(sendDirect);

    var ws = null;
    var user = "";
    var user2 = "";

    $("#ws-connect").click(function(){
        ws = new WebSocket("ws://127.0.0.1:8088");

        ws.onopen = function(e){    
            console.log("Websocket opened");
            $("#idform").show();
        }
        ws.onclose = function(e){   
            console.log("Websocket closed");
        }
        ws.onmessage = function(e){ 
            console.log("Websocket message received: " + e.data);

            var json = JSON.parse(e.data);

            if(json.action == "candidate"){
                if(json.to == user){
                  processIce(json.data);
                }
            } else if(json.action == "offer"){
                // incoming offer
                if(json.to == user){
                    user2 = json.from;
                    processOffer(json.data)
                }
            } else if(json.action == "answer"){
                // incoming answer
                if(json.to == user){
                    processAnswer(json.data);
                }
            } 
            // else if(json.action == "id"){
            //    userId = json.data;
            // } else if(json.action=="newUser"){
            //     if(userId!=null && json.data!=userId){

            //     }
            // }

        }
        ws.onerror = function(e){   
            console.log("Websocket error");
        }
    });

    function setMyId(e){
        e.preventDefault();
        user = $("#user").val();
        $("#dcform").show();
        return false;
    }

    //var config = {"iceServers":[{"url":"stun:stun.l.google.com:19302"}]};
    var config = {"iceServers":[]};
    var connection = {};

    var peerConnection;
    var dataChannel;



    function connectTo(e){
        e.preventDefault();
        user2 = $("#connectTo").val();
        openDataChannel();

        var sdpConstraints = { offerToReceiveAudio: true,  offerToReceiveVideo: false }
        peerConnection.createOffer(sdpConstraints).then(function (sdp) {
            peerConnection.setLocalDescription(sdp);
            sendNegotiation("offer", sdp);
            console.log("------ SEND OFFER ------");
        }, function (err) {
            console.log(err)
        });

    }

    function sendDirect(e){
        e.preventDefault();
        dataChannel.send($("#message").val());
        $('body').append('Me: <div class="message">'+$("#message").val()+'</div>');
        console.log("Sending over datachannel: " + $("#message").val());
        $("#message").val('');
    }

    function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
    }


    function openDataChannel (){
        peerConnection = new webkitRTCPeerConnection(config, connection);
        peerConnection.onicecandidate = function(e){
            if (!peerConnection || !e || !e.candidate) return;
            var candidate = event.candidate;
            sendNegotiation("candidate", candidate);
        }

        dataChannel = peerConnection.createDataChannel("datachannel", {reliable: false});

        dataChannel.onopen = function(){
            console.log("------ DATACHANNEL OPENED ------")
            $("#sendform").show();
        };
        dataChannel.onclose = function(){console.log("------ DC closed! ------")};
        dataChannel.onerror = function(){console.log("DC ERROR!!!")};

        peerConnection.ondatachannel = function (ev) {
            console.log('peerConnection.ondatachannel event fired.');
            ev.channel.onopen = function() {
                console.log('Data channel is open and ready to be used.');
            };
            ev.channel.onmessage = function(e){
                console.log("DC from ["+user2+"]:" +e.data);
                $('body').append(user2+': <div class="message from">'+e.data+'</div>')
            }
        };

        return peerConnection
    }

    function sendNegotiation(type, sdp){
        var json = { from: user, to: user2, action: type, data: sdp};
        ws.send(JSON.stringify(json));
        console.log("Sending ["+user+"] to ["+user2+"]: " + JSON.stringify(sdp));
    }

    function processOffer(offer){
        var peerConnection = openDataChannel();
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).catch(e => {
            console.log(e)
        });

        var sdpConstraints = {'mandatory':
            {
                'OfferToReceiveAudio': false,
                'OfferToReceiveVideo': false
            }
        };

        peerConnection.createAnswer(sdpConstraints).then(function (sdp) {
            return peerConnection.setLocalDescription(sdp).then(function() {            
                sendNegotiation("answer", sdp);
                console.log("------ SEND ANSWER ------");
            })
        }, function(err) {
            console.log(err)
        });
        console.log("------ PROCESSED OFFER ------");

    };

    function processAnswer(answer){

        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("------ PROCESSED ANSWER ------");
        return true;
    };

    function processIce(iceCandidate){
        peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate)).catch(e => {
            debugger
            console.log(e)
        })
    }



var desktopConstraints = { 

   video: { 
      mandatory: { 
         maxWidth:800,
         maxHeight:600   
      }  
   }, 
    
   audio: true 
}; 
 
//constraints for mobile browser 
var mobileConstraints = { 

   video: { 
      mandatory: { 
         maxWidth: 480, 
         maxHeight: 320, 
      } 
   }, 
    
   audio: true 
}
  
//if a user is using a mobile browser 
if(/Android|iPhone|iPad/i.test(navigator.userAgent)) { 
   var constraints = mobileConstraints;   
} else { 
   var constraints = desktopConstraints; 
}
  
function hasUserMedia() { 
   //check if the browser supports the WebRTC 
   return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia); 
}
  
if (hasUserMedia()) {
  
   navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia;
    
   //enabling video and audio channels 
   navigator.getUserMedia(constraints, function (stream) { 
      var video = document.querySelector('video');
        
      //inserting our stream to the video tag     
      video.src = window.URL.createObjectURL(stream);
        
   }, function (err) {}); 
} else { 
   alert("WebRTC is not supported"); 
}