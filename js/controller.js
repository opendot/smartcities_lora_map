/**
 * Created by Cento on 13/04/2017.
 */

var app = angular.module('cityai', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
app.controller('cityaiController', function cityaiController($scope) {


    //datapoints array
    $scope.datapoints = [];
    //choose what value to plot
    $scope.datum = "temp";

    //update viz on
    $scope.$watch("datum",function(newVal, oldVal) {
        if(newVal != oldVal) {
            $scope.updateViz();
        }
    })

    //update viz here
    $scope.updateViz = function() {
        $scope.$broadcast("update", {data:$scope.datapoints, ref:$scope.datum});
    }


    var wsUri = "ws://192.168.1.58:3000/cable";

    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };

var ok = true;
    function onOpen(evt)
    {
        //subscribe to channel
        var payload = {
            command: "subscribe",
            identifier: JSON.stringify({ channel: "MessageChannel" })
        };

        var subscribe_command = JSON.stringify(payload);
        websocket.send(subscribe_command);

    }

    function onClose(evt)
    {
        console.log("DISCONNECTED");
    }

    function onMessage(evt)
    {
        //console.log(evt);
        var msg = JSON.parse(evt.data);

        if("identifier" in msg && msg.type!="confirm_subscription") {
            obj = _.find($scope.datapoints,function(d){return d.properties.id == msg.message.properties.id});
            if(obj && obj !== null) {
                obj.properties = msg.message.properties;
                obj.geometry = msg.message.geometry;
            }
            else{
                $scope.datapoints.push(msg.message);
            }
        }
        if(ok && $scope.datapoints.length>80) {
            $scope.datapoints.forEach(function (d, i) {
                console.log(d.lat, d.lon);
            })
            ok = false;
        }

        //update viz
        $scope.updateViz()
    }

    function onError(evt)
    {
        console.log("error");
    }

    function doSend(message)
    {
        websocket.send(message);
    }
});