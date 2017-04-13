/**
 * Created by Cento on 13/04/2017.
 */


app.directive('map', function () {
    return {
        restrict: 'AE',
        replace: true,
        template: '<div id="map"></div>',
        link: function (scope, elem, attrs) {

            mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
            mapboxgl.accessToken = 'pk.eyJ1IjoibGF1cmVraXJkdXIiLCJhIjoiY2oxZTJ5ZmVnMDAwNTMyanUzNHVleml3NSJ9.8xHBdXvjntJQkpiLLVEqVw';
            // 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
            var map = new mapboxgl.Map({
                container: 'map', // container id

                style: 'mapbox://styles/laurekirdur/cj1g4jyqg000t2sqrug7rqo3i',
                center: [9.22226, 45.44799],
                zoom: 13,
                pitch: 40,
                bearing: 20
            });

            init(map);

            scope.$on("update", function (ev, msg) {
                // console.log(msg);
                incomingFeatures = msg.data;
                updateNow = true;
                // runAnimation(map, data, extrusionLayer);
            })
        }
    };
});
