mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
// 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style1: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    style2: 'mapbox://styles/mapbox/satellite-v9',
    style3: 'mapbox://styles/mapbox/light-v9',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [9.22226, 45.44799],
    zoom: 15,
    pitch: 70,
    bearing: 20
});

var radius = 20 / 1000;

function pointOnCircle(angle, lon, lat) {
    coordinates = [
    lat + Math.cos(angle) * radius,
    lon + Math.sin(angle) * radius];
    return {
        "type": "Point",
        "coordinates": coordinates
    };
}

function interpolate(p1, p2, factor) {
    var lon = p1[0] + factor * (p2[0] - p1[0]);
    var lat = p1[1] + factor * (p2[1] - p1[1]);
    return [lon, lat];
}

var features = [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [9.180069, 45.484647],
        },
        "properties": {
            height: 5
        }

    }, {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [9.222341, 45.44376]
        },
        "properties": {
            height: 15
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [9.186273, 45.461164]
        },
        "properties": {
            height: 9
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
        var pn = interpolate(
            features[F - 1].geometry.coordinates,
            features[F].geometry.coordinates,
            i / N);

        var f = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": pn
            }
        };
        interpolatedFeatures.push(f);
        allFeatures.push(f);
        completeLineStringArray.push(pn);
    };
    allFeatures = allFeatures.concat(interpolatedFeatures);
    allFeatures.push(features[F]);
    completeLineStringArray.push(features[F].geometry.coordinates);
}


map.on('load', function () {

    // Add a source and layer displaying a point which will be animated in a circle.

    displayPoints(map, allFeatures);
    displayInterpolatedPoints(map, interpolatedFeatures);

    displayBuildings(map);

    var extrusionLayer = extrude(map, completeLineStringArray);

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
    runAnimation(map, data, extrusionLayer);
});


var loadAndAnimate = function (map) {
    d3.json('https://www.mapbox.com/mapbox-gl-js/assets/data/hike.geojson', function (err, data) {
        if (err) throw err;
        runAnimation(map, data);
    });
}

var runAnimation = function (map, data, extrusionLayer) {

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
            "line-opacity": 0.25,
            "line-width": 3
        }
    });

    // setup the viewport
    map.jumpTo({
        'center': coordinates[0],
        'zoom': 15
    });
    //    map.setPitch(30);

    var savedFeatures = [].concat(extrusion.features);

    extrusionLayer.source.data = extrusion;
    console.log(extrusion)

    map.addLayer(extrusionLayer);

    var start;
    var current = 0;

    function step(timestamp) {

        if (!start) start = timestamp;
        var progress = (timestamp - start) / 1000;
        var i = Math.round(progress);
        var factor = progress - i;
        // console.log(timestamp, i, current);
        if (i < coordinates.length) {
            if (i > current) {
                var p = savedFeatures[i].properties;
                p.initialHeight = p.targetHeight === undefined ?
                    20 + 200 * Math.random(200) :
                    p.targetHeight;
                p.targetHeight = 20 + 200 * Math.random(200);
                current = i;
            }
            for (var n = 0; n < savedFeatures.length; n++) {
                var p = savedFeatures[n].properties;
                p.height = (1 - factor) * p.initialHeight + factor * p.targetHeight;
            }
            extrusion.features = savedFeatures.slice(0, i + 1);
            // [savedFeatures[i]];

            map.getSource('room-extrusion').setData(extrusion)
            data.features[0].geometry.coordinates.push(coordinates[i]);

            map.getSource('trace').setData(data);
            // map.setPitch(30+i);
            // map.setBearing(map.getBearing() + .5);
            map.panTo(coordinates[i]);
            //  i++;
        }
        // if (progress < 2000) {
        window.requestAnimationFrame(step);
        // }
    }

    window.requestAnimationFrame(step);
}

function displayPoints(map, features) {
    // DISPLAY POINTS
    map.addSource('point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features
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
}

function displayInterpolatedPoints(map, features) {

    // DISPLAY INTERPOLATED POINTS    
    map.addSource('interpolated-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features
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
    var h = 0.0001;
    var w = 0.00008;

    var features = [];

    completeLineStringArray.forEach(function (s, i) {
        const COLORS = ["orange", "#9999ff", "red"];
        var color = COLORS[(i % 3)];
        features.push({
            "type": "Feature",
            "properties": {
                "level": 1,
                "name": "Bird Exhibit",
                "height": 100 + 20 * i,
                "base_height": 0,
                "color": color
            },
            "geometry": {
                "coordinates": [[
                    [s[0] - h, s[1]],
                    [s[0], s[1] + w],
                    [s[0] + h, s[1]],
                    [s[0], s[1] - w],
                    [s[0] - h, s[1]]
                ]],
                "type": "Polygon"
            },
            "id": "06e8fa0b3f851e3ae0e1da5fc17e111e"
        })
    })


    extrusion = {
        "type": "FeatureCollection",
        "features": features
    };
    //  console.log("extrusion", extrusion);
    var layer = {
        'id': 'room-extrusion',
        'type': 'fill-extrusion',
        'source': {
            // Geojson Data source used in vector tiles, documented at
            // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
            'type': 'geojson'
                // , 'data': extrusion
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
    }
    return layer;
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
