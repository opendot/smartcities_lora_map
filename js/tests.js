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

var radius = 20 / 1000;

function pointOnCircle(angle, lon, lat) {
    coordinates = [
    lat + Math.cos(angle) * radius,
    lon + Math.sin(angle) * radius
   ];

    console.log("pointOnCircle", lon, lat, coordinates, angle);
    return {
        "type": "Point",
        "coordinates": coordinates
    };
}

var features = [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [9.180069, 45.484647]
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [9.222341, 45.44376]
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [9.186273, 45.461164]
        }
    }
];

var interpolatedFeatures = [];
var allFeatures = [features[0]];
var completeLineStringArray = [features[0].geometry.coordinates];

// TODO: calculate correct number of steps based on distance/time
var N = 30;

for (F = 1; F < features.length; F++) {
    for (var i = 1; i < N; i++) {
        var lon = features[F - 1].geometry.coordinates[0] + i / N * (features[F].geometry.coordinates[0] - features[F - 1].geometry.coordinates[0]);
        var lat = features[F - 1].geometry.coordinates[1] + i / N * (features[F].geometry.coordinates[1] - features[F - 1].geometry.coordinates[1]);
        // console.log(lon, lat);
        var f = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        };
        interpolatedFeatures.push(f);
        allFeatures.push(f);
        completeLineStringArray.push([lon, lat]);
    };
    allFeatures = allFeatures.concat(interpolatedFeatures);
    allFeatures.push(features[F]);
    completeLineStringArray.push(features[F].geometry.coordinates);
}



map.on('load', function () {

    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('point', {
        "type": "geojson",
        "data": {
            /* "type": "Point", "coordinates": [9.22226, 45.44799] */
            "type": "FeatureCollection",
            "features": allFeatures //features
        }

    });
    map.addLayer({
        "id": "point",
        "source": "point",
        "type": "circle",
        // 'type': 'fill-extrusion',
        "paint": {
            "circle-radius": 8,
            "circle-color": "#eeeeee"
        }
    });



    map.addSource('interpolated-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": interpolatedFeatures
        }
    });
    map.addLayer({
        "id": "interpolated-point",
        "source": "interpolated-point",
        "type": "circle",
        // 'type': 'fill-extrusion',
        "paint": {
            "circle-radius": 5,
            "circle-color": "#999944"
        }
    });


    displayBuildings(map);
  //  extrude(map,completeLineStringArray);


    function animateMarker(timestamp) {
        // Update the data to a new position based on the animation timestamp. The
        // divisor in the expression `timestamp / 1000` controls the animation speed.
        var point = pointOnCircle(timestamp / 1000, 9.22226, 45.44799);
        //console.log("moving", point);
        map.getSource('point').setData(point);

        // Request the next frame of the animation.
        requestAnimationFrame(animateMarker);
        console.log("SOURCE", map.getSource('point'));
    }

    // Start the animation.
    // animateMarker(0);
    //  loadAndAnimate(map);
    var data = {
        "type": "FeatureCollection",
        "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": completeLineStringArray
                }
            }
        ]
    };
    //
    runAnimation(map, data);
});


var loadAndAnimate = function (map) {
    d3.json('https://www.mapbox.com/mapbox-gl-js/assets/data/hike.geojson', function (err, data) {
        if (err) throw err;
        runAnimation(map, data);
    });
}

var runAnimation = function (map, data) {
    console.log(data);
    // save full coordinate list for later
    var coordinates = data.features[0].geometry.coordinates;

    // start by showing just the first coordinate
    data.features[0].geometry.coordinates = [coordinates[0]];

    map.addSource('trace', {
        type: 'geojson',
        data: data
    });
    map.addLayer({
        "id": "trace",
        "type": "line",
        "source": "trace",
        "paint": {
            "line-color": "yellow",
            "line-opacity": 0.75,
            "line-width": 5
        }
    });

    // setup the viewport
    map.jumpTo({
        'center': coordinates[0],
        'zoom': 14
    });
    map.setPitch(30);

    // on a regular basis, add more coordinates from the saved list and update the map
    var i = 0;
    var timer = window.setInterval(function () {
        if (i < coordinates.length) {
            data.features[0].geometry.coordinates.push(coordinates[i]);
            map.getSource('trace').setData(data);
            // map.setPitch(30+i);
            map.setBearing(map.getBearing() + 5);
            map.panTo(coordinates[i]);
            i++;
        } else {
            window.clearInterval(timer);
        }
    }, 400);
}

function displayBuildings(map) {
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .6
        }
    });
}
var extrusion;
function extrude(map, completeLineStringArray) {

      extrusion = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {
                "level": 1,
                "name": "Bird Exhibit",
                "height": 10,
                "base_height": 0,
                "color": "orange"
            },
            "geometry": {
                "coordinates": [[completeLineStringArray[0],
                               completeLineStringArray[1],
                               completeLineStringArray[2],
                               completeLineStringArray[0],
                               ]],
                "type": "Polygon"
            },
            "id": "06e8fa0b3f851e3ae0e1da5fc17e111e"
        }]
    };
    console.log("extrusion", extrusion);
    map.addLayer({
        'id': 'room-extrusion',
        'type': 'fill-extrusion',
        'source': {
            // Geojson Data source used in vector tiles, documented at
            // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
            'type': 'geojson',
            'data': extrusion // 'https://www.mapbox.com/mapbox-gl-js/assets/data/indoor-3d-map.geojson'
        },
        'paint': {
            // See the Mapbox Style Spec for details on property functions
            // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
            'fill-extrusion-color': {
                // Get the fill-extrusion-color from the source 'color' property.
                'property': 'color',
                'type': 'identity'
            },
            'fill-extrusion-height': {
                // Get fill-extrusion-height from the source 'height' property.
                'property': 'height',
                'type': 'identity'
            },
            'fill-extrusion-base': {
                // Get fill-extrusion-base from the source 'base_height' property.
                'property': 'base_height',
                'type': 'identity'
            },
            // Make extrusions slightly opaque for see through indoor walls.
            'fill-extrusion-opacity': 0.5
        }
    });
}

function shortestPath() {
    var url = "https://api.mapbox.com/matching/v5/mapbox/driving/" +
        "-117.1728265285492,32.71204416018209;" +
        "-117.17288821935652,32.712258556224;" +
        "-117.17293113470076,32.712443613445814;" +
        "-117.17292040586472,32.71256999376694;" +
        "-117.17298477888109,32.712603845608285;" +
        "-117.17314302921294,32.71259933203019;" + "-117.17334151268004,32.71254065549407" + "?access_token=" + "pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg";
    d3.json(url, function (err, data) {
        if (err) throw err;
        // do something with (map, data);
    });
}
