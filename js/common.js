var wsUri = "ws://192.168.2.67:3000/cable/";
var output;

function init()
{
    output = document.getElementById("output");
    testWebSocket();
}

function testWebSocket()
{
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt)
{
    writeToScreen("CONNECTED");

    var payload = {
        command: "subscribe",
    identifier: JSON.stringify({ channel: "MessageChannel" })
    };

    var subscribe_command = JSON.stringify(payload);
    websocket.send(subscribe_command);
    
    //doSend("WebSocket rocks");
}

function onClose(evt)
{
    writeToScreen("DISCONNECTED");
}

function onMessage(evt)
{
    writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data+'</span>');
    //websocket.close();
}

function onError(evt)
{
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message)
{
    writeToScreen("SENT: " + message);
    websocket.send(message);
}

function writeToScreen(message)
{
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

window.addEventListener("load", init, false);
