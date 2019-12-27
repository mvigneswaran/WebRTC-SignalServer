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

// const https = require('https');

// const secureServer = https.createServer({
//     cert: fs.readFileSync('/path/to/cert.pem'),
//     key: fs.readFileSync('/path/to/key.pem')
// });

// const wss = new WebSocket.Server({
//     server: secureServer,
//     port: 8443
// }, () => {
//     console.log(`Signaling server is now listening on port 8443`);
// });

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

/**
 * Notes: Broadcast
 * It is used to broadcast sdp messages to all users
 */

wss.loginResponse = (ws, message) => {
    wss.clients.forEach((client) => {
        if (client === ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    });
}

wss.offerResponse = (ws, message) => {
    wss.clients.forEach((client) => {
        if (client === ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    });
}

wss.answerResponse = (ws, message) => {
    wss.clients.forEach((client) => {
        // if (client === ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        // }
    });
}

wss.leaveResponse = (ws, message) => {
    wss.clients.forEach((client) => {
        // if (client === ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        // }
    });
}

wss.candidateResponse = (ws, message) => {
    console.log("check1")
    wss.clients.forEach((client) => {
        console.log("check2")

        // if (client === ws && client.readyState === WebSocket.OPEN) {
            console.log("check3")

            client.send(JSON.stringify(message))
        // }
    });
}

wss.errorResponse = (ws, message) => {
    wss.clients.forEach((client) => {
        if (client === ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    });
}

wss.broadcast = (ws, data) => {
    wss.clients.forEach((socket) => {
        if (socket === ws) {
            socket.send(JSON.stringify(message));
        }
    });
}

wss.on('connection', (ws) => {

    console.log(`Client connected. Total connected clients: ${wss.clients.size}`);

    /**
     * Notes: Message
     * When Server gets a message from a connected user
     */

    ws.onmessage = (message) => {

        console.log("Message:" + JSON.stringify(message.data) + "\n");

        var msgData;

        //Accepting only JSON Messages
        try {
            msgData = JSON.parse(message.data);
        } catch (e) {
            console.log(`${LogInfo} Invalid JSON`);
            msgData = {};
        }

        /**
         * Notes:Types Of Message
         * 1.login
         * 2.offer
         * 3.answer
         * 4.candidate
         * 5.leave
         */

        switch (msgData.signalType) {

            /**
             * Notes:login
             * When a user tries to login
             */

            case "login":
                {
                    console.log(`${LogInfo} Signal Type: login\n Request: \n ${JSON.stringify(msgData)}`);

                    if (userSocket[msgData.fromUser]) {

                        /**
                         * Notes: Logged In User
                         * If anyone is logged in with this username then refuse
                         */

                        let updatedMsgData = JSON.parse(JSON.stringify(msgData));

                        updatedMsgData["success"] = "0";

                        // console.log(`${LogInfo} Signal Type: login\n Response: \n ${JSON.stringify(updatedMsgData)}`);

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
                }
                break;

            /**
             * Notes: offer
             * User A wants to call User B
             */

            case "offer":
                {
                    // console.log(`${LogInfo} Signal Type: offer\n Request: \n ${JSON.stringify(msgData)}`);

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

                        // console.log(`${LogInfo} Signal Type: offer\n Response: \n ${JSON.stringify(updatedMsgData)}`);

                        wss.offerResponse(conn, updatedMsgData);
                    }
                }
                break;

            /**
             * Notes: answer
             * User A sending answer to User B
            */

            case "answer":
                {
                    // console.log(`${LogInfo} Signal Type: answer\n Request: \n ${JSON.stringify(msgData)}`);

                    /**
                     * Notes: Sending answer
                     * If User A exists then send him answer details
                     */

                    var conn = userSocket[msgData.toUser];

                    if (conn != null) {
                        ws.toUser = msgData.toUser;

                        let updatedMsgData = JSON.parse(JSON.stringify(msgData))

                        // console.log(`${LogInfo} Signal Type: answer\n Response: \n ${JSON.stringify(updatedMsgData)}`);

                        wss.answerResponse(conn, updatedMsgData);
                    }
                }
                break;

            /**
             * Notes: candidate
             * Sending ICE Candidate to User
             */

            case "candidate":
                {
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
                }
                break;

            /**
             * Notes: leave
             * Disconnecting from user
             */

            case "leave":
                {
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
                }
                break;

            default:
                {
                    //   wss.broadcast(connection, message);
                    let updatedMsgData = {
                        type: "error",
                        message: "Command not found: " + msgData.type
                    }
                    console.log(`${LogInfo} Response: ${JSON.stringify(updatedMsgData)}`);
                    wss.errorResponse(ws, updatedMsgData)
                }
                break;

        }

    }

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

    ws.send(JSON.stringify({ signalType: "pingTest"})); 
    
});