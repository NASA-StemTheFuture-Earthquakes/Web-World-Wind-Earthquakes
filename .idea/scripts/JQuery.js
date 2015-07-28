/**
 * Created by tylerwhitlock on 7/19/15.
 */

function eventWindowLoaded() {
    // Create a World Window for the canvas.
    var wwd = new WorldWind.WorldWindow("canvasOne");
    //array of layers to add
    var layers =
        [{layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(), enabled: true},
            {layer: new WorldWind.OpenStreetMapImageLayer(), enabled: true},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}];


    // Add some image layers to the World Window's globe.
    for (var i = 0; i < layers.length; i++) {
        layers[i].layer.enabled = layers[i].enabled;

        wwd.addLayer(layers[i].layer);
    }
    //var coord = new WorldWind.placePoint(80,180);
    /*/  var placemarkLayer = new WorldWind.RenderableLayer("Placemarks");
     var placemark = new WorldWind.Placemark(new WorldWind.Position(0.0, 0.0, 1e2));
     placemark.enabled = true;
     placemark.label = "glfsdfk";
     placemark.highlighted = true;
     placemark.alwaysOnTop = true;
     placemarkLayer.addRenderable(placemark);
     placemarkLayer.layer.enabled = placemarkLayer.enabled;
     wwd.addLayer(placemarkLayer);


     /*/


    var Layer = createLayer(wwd);
    Layer.enabled = true;
    Layer.alwaysOnTop = true;
    wwd.addLayer(Layer);
    wwd.redraw();
     //wwd.addLayer(new WorldWind.CompassLayer());
     //wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
     // wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
     // wwd.redraw();

     };


     /**
     * Created by tylerwhitlock on 7/21/15.
     */

/*/
    function createLayer(wwd) {
         "use strict"
         var EarthquakeLayer;
         EarthquakeLayer = function (worldWindow, name) {
             var wwd = worldWindow;
             var eLayer = new WorldWind.RenderableLayer(name); //creates the layer on which the earthquakes will be mapped
             var dContext = new worldWindow.drawContext;

             var placemark, highlightAttributes,
                 placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

             var xmlhttp = new XMLHttpRequest();
             var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=500";
             // The earthquake data is retrieved from the above URL using HTTP get.
             var Array = [];


             var data = JSON.parse(xmlhttp.responseText);
             if (data) {
                 myFunction(Array, data);
                 if (Array != null) {
                     xmlhttp.open("GET", url, true);
                     xmlhttp.send();


                     var colorSpect = [[255, 0, 0], [0, 255, 0]];


                     for (var i = 0; i < Array.length; i++) {
                         // Create the custom image for the placemark for each earthquake.
                         var canvas = document.createElement("canvas"),
                             ctx2d = canvas.getContext("2d"),
                             size = Array[i].magnitude * 5, c = size / 2 - 0.5, innerRadius = 0, outerRadius = Array[i].magnitude * 2.2;
                         canvas.width = size;
                         canvas.height = size;
                         ctx2d.fillStyle = new WorldWind.Color(1, 1, 1, 1)
                         //ctx2d.fillStyle = eLayer.Draw.GetColorSpectrum(Array[i].age / eLayer.Manage.Data[eLayer.Manage.Data.length - 1].age, colorSpect)


                         ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
                         ctx2d.fill();

                         // Create the placemark.
                         placemark = new WorldWind.Placemark(new WorldWind.Position(Array[i].latitude, Array[i].longitude, 1e2));
                         placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

                         // Create the placemark attributes for the placemark.
                         placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                         placemarkAttributes.imageScale = 1;
                         placemarkAttributes.imageColor = new WorldWind.Color(1, 1, 1, 1)

                         // Wrap the canvas created above in an ImageSource object to specify it as the placemark image source.
                         placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
                         placemark.attributes = placemarkAttributes;
                         // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
                         // the default highlight attributes so that all properties are identical except the image scale. You could
                         // instead vary the color, image, or other property to control the highlight representation.
                         highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                         highlightAttributes.imageScale = 1.2;
                         highlightAttributes.imageSource = new WorldWind.ImageSource(canvas);
                         placemark.highlightAttributes = highlightAttributes;

                         // Add the placemark to the layer.
                         eLayer.addRenderable(placemark);
                     }
                 }

             }

             eLayer.Manage = {


                 //adds things to the layer
                 Draw: {
                     //returns color based on the array and the fraction.
                     GetColorSpectrum: function (fraction, spectrumArrayColors, wwS) {
                         var format = (wwS === undefined) ? true : false;
                         //array looks like [[r,g,b],[r,g,b],...
                         var divisions = spectrumArrayColors.length - 1;
                         for (var i = 0; i < divisions; i++) {
                             if (fraction >= i / divisions && fraction <= (i + 1) / divisions) {
                                 var r = spectrumArrayColors[i][0] + fraction * (spectrumArrayColors[i + 1][0] - spectrumArrayColors[i][0]),
                                     g = spectrumArrayColors[i][1] + fraction * (spectrumArrayColors[i + 1][1] - spectrumArrayColors[i][1]),
                                     b = spectrumArrayColors[i][2] + fraction * (spectrumArrayColors[i + 1][2] - spectrumArrayColors[i][2]);

                                 if (format) {
                                     return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
                                 } else {
                                     return new WorldWind.Color(r / 255, g / 255, b / 255, 1)
                                 }

                             }
                         }

                     },
                     //draws all the earthquakes in eLayer.Manage.ParsedData onto the layer
                     Placemarks: function () {


                         var placemark, highlightAttributes,
                             placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

                         var colorSpect = [[255, 0, 0], [0, 255, 0]];


                         //adds all the earthquakes as renderables to the layer
                         for (var i = 0; i < Array.length; i++) {
                             // Create the custom image for the placemark for each earthquake.
                             var canvas = document.createElement("canvas"),
                                 ctx2d = canvas.getContext("2d"),
                                 size = Array[i].magnitude * 5, c = size / 2 - 0.5, innerRadius = 0, outerRadius = Array[i].magnitude * 2.2;
                             canvas.width = size;
                             canvas.height = size;

                             ctx2d.fillStyle = new WorldWind.Color(155,155,155, 1);
                             ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
                             ctx2d.fill();

                             // Create the placemark.
                             placemark = new WorldWind.Placemark(new WorldWind.Position(Array[i].latitude, Array[i].longitude, 1e2));
                             placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

                             // Create the placemark attributes for the placemark.
                             placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                             placemarkAttributes.imageScale = 1;
                             placemarkAttributes.imageColor = new WorldWind.Color(1, 1, 1, .55)

                             // Wrap the canvas created above in an ImageSource object to specify it as the placemark image source.
                             placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
                             placemark.attributes = placemarkAttributes;
                             // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
                             // the default highlight attributes so that all properties are identical except the image scale. You could
                             // instead vary the color, image, or other property to control the highlight representation.
                             highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                             highlightAttributes.imageScale = 1.2;
                             highlightAttributes.imageSource = new WorldWind.ImageSource(canvas);
                             placemark.highlightAttributes = highlightAttributes;

                             // Add the placemark to the layer.
                             eLayer.addRenderable(placemark);
                         }
                         wwd.redraw();
                     }
                 }
             }


             return eLayer
         };

         if (EarthquakeLayer != null) {
             EarthquakeLayer.layer.enabled = true;
             EarthquakeLayer.alwaysOnTop = true;
             wwd.addLayer(EarthquakeLayer);
         }
            return EarthquakeLayer;
     }
function myFunction(Array,data) {

    var earthquakes = data['features'];

    for (var i = 0; i < earthquakes.length; i++) {
        var quake = earthquakes[i];
        var geometry = quake['geometry'];
        var logistics = quake['properties'];

        var earthquake = {
            magnitude: Number(logistics['mag']),
            date_time: logistics['time'], 		// this variable contains time in millisecond since time 0 (1.1.1970)

            depth: Number(geometry['coordinates'][2]),
            latitude: Number(geometry['coordinates'][1]),
            longitude: Number(geometry['coordinates'][0])
        };

        // How long ago the earthquake occurred in terms of days
        earthquake.ageDay = Math.abs((new Date().getTime()) - new Date(earthquake.date_time).getTime()) /
            (24 * 3600000);
        //How long ago the earthquake occured in terms of hours
        earthquake.ageHours = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
            / (3600000)));


        Array.push(earthquake);

    }


}/*/