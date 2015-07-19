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
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}];
    // Add some image layers to the World Window's globe.
    for( var i = 0; i<layers.length; i++) {
        layers[i].layer.enabled = layers[i].enabled;

        wwd.addLayer(layers[i].layer);
    }
    //wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

    var coordinateController = new CoordinateController(wwd);

    wwd.redraw();
    //wwd.addLayer(new WorldWind.CompassLayer());
    //wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    // wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
}
$(document).ready(function() {
    $.get('someservlet', function (responseText) { // Execute Ajax GET request on URL of "someservlet" and execute the following function with Ajax response text...
        $('#somediv').text(responseText);
        //
    });
});