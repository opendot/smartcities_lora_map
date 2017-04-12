/**
 * Created by Cento on 12/04/2017.
 */
// Let the library know where WebSocketMain.swf is:
WEB_SOCKET_SWF_LOCATION = "/bower_components/gimite/we-socket-js/WebSocketMain.swf";

// Write your code in the same way as for native WebSocket:
var ws = new WebSocket("ws://example.com:10081/");
ws.onopen = function() {
    ws.send("Hello");  // Sends a message.
};
ws.onmessage = function(e) {
    // Receives a message.
    alert(e.data);
};
ws.onclose = function() {
    alert("closed");
};
