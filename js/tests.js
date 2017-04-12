        mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
        // 'pk.eyJ1IjoiZ3VhcHBvbWFzdHJvIiwiYSI6ImNpcm1veml2dzAwNGZpMmt3MnBtZzA4MmYifQ.dJ4HXjGq69e9FRyafBLtMg';
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
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
                "coordinates": [9.221111, 45.44176]
            },
            "properties": {
                "title": "Mapbox DC",
                "icon": "monument"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [9.222341, 45.44376]
            },
            "properties": {
                "title": "Mapbox SF",
                "icon": "harbor"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [9.224341, 45.44976]
            },
            "properties": {
                "title": "Mapbox SF",
                "icon": "harbor"
            }
        }];

        var a = [1, 2, 3, 4, 5, 6];
        a.forEach(function(i) {
            var lon = 9.2 + i * 0.01111;
            var lat = 45.44176;
            console.log(lon);
            var f = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "title": "Mapbox DC",
                    "icon": "monument"
                }
            };
            features.push(f);
        });

        map.on('load', function() {

            // Add a source and layer displaying a point which will be animated in a circle.
            map.addSource('point', {
                "type": "geojson",
                "data": {
                    /* "type": "Point", "coordinates": [9.22226, 45.44799] */
                    "type": "FeatureCollection",
                    "features": features
                }
                //pointOnCircle(0, 9.22226, 45.44799)
            });
            console.log("ECCO", pointOnCircle(0, 9.22226, 45.44799));
            map.addLayer({
                "id": "point",
                "source": "point",
                "type": "circle",
                // 'type': 'fill-extrusion',
                "paint": {
                    "circle-radius": 8,
                    "circle-color": "#444444"
                }
            });

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
        });