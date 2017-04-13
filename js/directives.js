/**
 * Created by Cento on 13/04/2017.
 */


app.directive('map', function() {
    return {
        restrict: 'AE',
        replace: true,
        template: '<div id="map"></div>',
        link: function(scope, elem, attrs) {


        mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
    // 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style1: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
            style2: 'mapbox://styles/mapbox/satellite-v9',
            style3: 'mapbox://styles/mapbox/light-v9',
            style: 'mapbox://styles/mapbox/dark-v9',
            center: [9.22226, 45.44799],
            zoom: 13,
            pitch: 40,
            bearing: 20
        });

            
            
            
            
            
            
            scope.$on("update",function(ev,msg){
                console.log(ev,msg);
            })

        }
    };
});