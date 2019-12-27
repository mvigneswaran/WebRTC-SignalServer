
WebRTC-SignalServer

It is an node server.Light weight and fast communication between clients.

Now I have added for WEBRTC Signaling for two user communication.This signaling server is similar to chat communication.If any one idea or guides means please free to ask the questions.

This is contact Email Id
smvigneswaran@gmail.com.

Steps to use WEBRTC - Signal Server

1.Download the WebRTC-SignalServer

2.Then open your terminal and go to this current WebRTC-SignalServer location.And enter following command

  npm install npm

3.Then run the server by following command

  node server.js

Lets understand about WebRTC-SignalServer

WebRTC is an light weight Video Call RTC Communication.

Compare to pjsip it is an light weight API.

RTC SDP can understand only this three types like OFFER, ANSWER,PRANSWER

*This server is based on my customized requirement.
*There are two ways to communicate clients.They are data and string.Here I have preferred string communication.
*But it supports on any requirement.
*Anyone need guidance means please free to contact me my Email Id added above.

Lets look into the concept

/**
 * Notes: File System
 * It is used to read pem file like cert and key
 */

const fs = require('fs');

/**
 * Notes: WebSocket
 * It is used to connect websocket for signaling service
 */

const WebSocket = require('ws');

/**
 * Notes: Secured Server
 * https and WebSocket is used to establish secured server
 */

const https = require('https');

const secureServer = https.createServer({
    cert: fs.readFileSync('/path/to/cert.pem'),
    key: fs.readFileSync('/path/to/key.pem')
});

const wss = new WebSocket.Server({
    server: secureServer,
    port: 8443
}, () => {
    console.log(`Signaling server is now listening on port 8443`);
});

/**
 * Notes: Open Server
 * WebSocket is used to establish open Server
 */

const wss = new WebSocket.Server({
    port: 8080
}, () => {
    console.log(`Signaling server is now listening on port 8080`);
});

/**
 * Notes:
 * All connected users will stored in userObj Object
 * As of now used userObj object for temporarily
 * In future need database to verify user is available in db or not
 */

var userSocket = {};

var LogInfo = "WEBRTC-SignalServer: \n"

/**
 * Notes: WebSocket Connection
 * Connection
 * 1.Message
 * 1.1.Login
 * 1.2.Offer
 * 1.3.Answer
 * 1.4.ICE Candidate
 * 1.5.Leave
 * 2.Close
 * 2.1.Leave
 */
 
Connection Open:
 
wss.on('connection', (ws) => {
    console.log(`Client connected. Total connected clients: ${wss.clients.size}`);
            
Message:

ws.onmessage = (message) => {
     console.log("Message:" + JSON.stringify(message.data) + "\n");       

Login:
 
console.log(`${LogInfo} Signal Type: login\n Request: \n ${JSON.stringify(msgData)}`);

if (userSocket[msgData.fromUser]) {

    /**
     * Notes: Logged In User
     * If anyone is logged in with this username then refuse
     */

    let updatedMsgData = JSON.parse(JSON.stringify(msgData));

    updatedMsgData["success"] = "0";

    console.log(`${LogInfo} Signal Type: login\n Response: \n ${JSON.stringify(updatedMsgData)}`);

    wss.loginResponse(ws, updatedMsgData);

} else {

    /**
     * Notes: Logged In User
     * Save User connection on the server
     */
        
    userSocket[msgData.fromUser] = ws;
    ws.fromUser = msgData.fromUser;

    let updatedMsgData = JSON.parse(JSON.stringify(msgData));

    updatedMsgData["success"] = "1";

    console.log(`${LogInfo} Signal Type: login\n Response: \n ${JSON.stringify(updatedMsgData)}`);

    wss.loginResponse(ws, updatedMsgData);

}
  
Offer:
  
/**
 * Notes: offer
 * User A wants to call User B
 */
   
console.log(`${LogInfo} Signal Type: offer\n Request: \n ${JSON.stringify(msgData)}`);

/**
 * Notes: Sending offer
 * If User B exists then send him offer details
 */

var conn = userSocket[msgData.toUser];

if (conn != null) {

    /**
     * Notes: conn
     * Setting that User A connected with User B
     */

    ws.toUser = msgData.toUser;

    let updatedMsgData = JSON.parse(JSON.stringify(msgData))

    console.log(`${LogInfo} Signal Type: offer\n Response: \n ${JSON.stringify(updatedMsgData)}`);

    wss.offerResponse(conn, updatedMsgData);
}
     
Answer:
 
/**
 * Notes: answer
 * User A sending answer to User B
 */  
  
console.log(`${LogInfo} Signal Type: answer\n Request: \n ${JSON.stringify(msgData)}`);

/**
 * Notes: Sending answer
 * If User A exists then send him answer details
 */

var conn = userSocket[msgData.toUser];

if (conn != null) {
    ws.toUser = msgData.toUser;

    let updatedMsgData = JSON.parse(JSON.stringify(msgData))

    console.log(`${LogInfo} Signal Type: answer\n Response: \n ${JSON.stringify(updatedMsgData)}`);

    wss.answerResponse(conn, updatedMsgData);
}
  
Candidate:

console.log(`${LogInfo} Signal Type: candidate\n Request: \n ${JSON.stringify(msgData)}`);

/**
 * Notes: Sending candidate
 * Sending ICE Candidate to user if exists
 */

var conn = userSocket[msgData.toUser];

if (conn != null) {

    let updatedMsgData = JSON.parse(JSON.stringify(msgData))

    console.log(`${LogInfo} Signal Type: candidate\n Response: \n ${JSON.stringify(updatedMsgData)}`);

    wss.candidateResponse(conn, updatedMsgData);
}

Leave:

/**
 * Notes: leave
 * Disconnecting from user
 */

console.log(`${LogInfo} Signal Type: leave\n Request: \n ${JSON.stringify(msgData)}`);

/**
 * Notes:Disconnecting from
 * Disconnecting user from signaling server
 */

var conn = userSocket[msgData.toUser];

conn.toUser = null;

/**
 * Notes: conn
 * Notify the other user so he can disconnect his peer connection
 */

if (conn != null) {

    let updatedMsgData = JSON.parse(JSON.stringify(msgData))

    console.log(`${LogInfo} Signal Type: leave\n Response: \n ${JSON.stringify(updatedMsgData)}`);

    wss.leaveResponse(conn, updatedMsgData);
}

Default:

let updatedMsgData = {
    type: "error",
    message: "Command not found: " + msgData.type
}
console.log(`${LogInfo} Response: ${JSON.stringify(updatedMsgData)}`);
wss.errorResponse(ws, updatedMsgData)

Connection Close:

ws.onclose = () => {
    console.log(`Client disconnected. Total connected clients: ${wss.clients.size}`);

    if (ws.fromUser) {

        let updatedMsgData = {
            msgType: "other",
            signalType: "leave",
            fromUser: ws.fromUser,
            toUser: ""
        }

        delete userSocket[ws.fromUser];

        if (ws.toUser) {

            updatedMsgData["toUser"] = (ws.toUser != null && ws.toUser != "") ? ws.toUser : ""

            console.log(`${LogInfo} Response3: ${JSON.stringify(updatedMsgData)}`);

            if (ws != null) {
                console.log(`${LogInfo} Response4: ${JSON.stringify(updatedMsgData)}`);

                wss.leaveResponse(ws, updatedMsgData);
            }
        }
    }
}