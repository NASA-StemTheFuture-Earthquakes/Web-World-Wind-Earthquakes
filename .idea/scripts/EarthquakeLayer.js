/**
 * Created by tylerwhitlock on 7/21/15.
 */


define(['http://worldwindserver.net/webworldwind/worldwindlib.js'
    ,'Cylinder'], function(ww, Cylinder) {
    'use strict';
    var EarthquakeLayer = function (worldWindow,name) {
        var wwd = worldWindow;
        var eLayer = new WorldWind.RenderableLayer(name); //creates the layer on which the earthquakes will be mapped
        var dContext = new worldWindow.drawContext;

        var data = new WorldWind.coords;
        var array =dContext.createDataArray(worldWindow.getJSON("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson", data, worldWindow.jsonpCallback()));

        //manages most of what goes on in the layer. See methods of Manage for more details.
        eLayer.Manage = {

            //determines whether to draw columns or placemarks
            setDisplayType: function (arg) {
                eLayer.Manage.Draw.display = arg
            },

            //adds things to the layer
            Draw: {
                //returns color based on the array and the fraction.
                GetColorSpectrum: function (fraction,spectrumArrayColors,wwS){
                    var format = (wwS === undefined) ? true : false;
                    //array looks like [[r,g,b],[r,g,b],...
                    var divisions = spectrumArrayColors.length-1;
                    for (var i = 0; i < divisions; i++){
                        if (fraction >= i/divisions && fraction <= (i+1)/divisions){
                            var r = spectrumArrayColors[i][0]+fraction*(spectrumArrayColors[i+1][0]-spectrumArrayColors[i][0]),
                                g = spectrumArrayColors[i][1]+fraction*(spectrumArrayColors[i+1][1]-spectrumArrayColors[i][1]),
                                b = spectrumArrayColors[i][2]+fraction*(spectrumArrayColors[i+1][2]-spectrumArrayColors[i][2]);

                            if (format){
                                return "rgb("+ Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
                            }else{
                                return new WorldWind.Color(r/255,g/255,b/255,1)
                            }

                        }
                    }

                },
                //draws all the earthquakes in eLayer.Manage.ParsedData onto the layer
                Placemarks: function () {
                    eLayer.Manage.Animations.canAnimate = true;
                    eLayer.Layer.clearLayer();
                    var placemark, highlightAttributes,
                        placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
                        Array = eLayer.Manage.ParsedData;
                    var colorSpect = [[255,0,0],[0,255,0]];


                    //adds all the earthquakes as renderables to the layer
                    for (var i = 0; i < Array.length; i++){
                        // Create the custom image for the placemark for each earthquake.
                        var canvas = document.createElement("canvas"),
                            ctx2d = canvas.getContext("2d"),
                            size = Array[i].magnitude*5 , c = size / 2  - 0.5, innerRadius = 0, outerRadius = Array[i].magnitude*2.2;
                        canvas.width = size;
                        canvas.height = size;

                        ctx2d.fillStyle = eLayer.Manage.Draw.GetColorSpectrum(Array[i].age/eLayer.Manage.Data[eLayer.Manage.Data.length-1].age,colorSpect)
                        ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
                        ctx2d.fill();

                        // Create the placemark.
                        placemark = new WorldWind.Placemark(new WorldWind.Position(Array[i].lat, Array[i].long, 1e2));
                        placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

                        // Create the placemark attributes for the placemark.
                        placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                        placemarkAttributes.imageScale = 1;
                        placemarkAttributes.imageColor = new WorldWind.Color(1,1,1,.55)

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
                },

                Columns: function (grid) {
                    //grid should be size of gridsquare
                    var format = (grid === undefined) ? true : false;

                    eLayer.Layer.clearLayer();

                    var earthRadiusInfo = {
                        earthRadiusInKm : 6317,
                        earthRadiusInM : 6317 * 1000,
                    }

                    var EarthToCartesian = function (longitude, latitude) {
                        var R  = earthRadiusInfo.earthRadiusInKm;
                        var x = R * Math.cos(latitude) * Math.cos(longitude);
                        var y = R * Math.cos(latitude) * Math.sin(longitude);
                        var z = R * Math.sin(latitude);
                        return {
                            x : x,
                            y : y,
                            z : z
                        };
                    };

                    var CartesianToEarth = function (x, y, z) {
                        var R = earthRadiusInfo.earthRadiusInKm;
                        var lat = Math.asin(z /  R);
                        var long = Math.atan2(x, y);
                        return new WorldWind.Location(lat, long);
                    };

                    var ThreeDimensionalCyclinder = function (color, center, radius, height) {
                        return new Cylinder(color, center, radius, height);
                    }

                    var colorSpect = [[255,0,0],[0,255,0]];

                    eLayer.Manage.Animations.canAnimate = false
                    var Array = eLayer.Manage.ParsedData,
                        column,
                        MapTo;
                    for (var i = 0; i < Array.length; i++){
                        if (format){
                            MapTo = new WorldWind.Location(Array[i].lat, Array[i].long)
                        } else {
                            MapTo = new WorldWind.Location(Math.round(Array[i].lat/grid)*grid, Math.round(Array[i].long/grid)*grid)
                        }

                        column = ThreeDimensionalCyclinder(
                            eLayer.Manage.Draw.GetColorSpectrum(Array[i].age/eLayer.Manage.Data[eLayer.Manage.Data.length-1].age,colorSpect,true),
                            MapTo,.12,
                            Array[i].magnitude *5e5);
                        eLayer.addRenderable(column);
                    }
                    wwd.redraw();
                },
            },

            //adds the data to the layer (does not draw on the layer). Stores all data in eLayer.Manage.Data as array of earthquake objects
            createDataArray: function (JSONFile) {
                eLayer.Manage.Data = JSONFile;
                eLayer.Manage.parseDataArrayMag(2);//parse out most of the insignificant earthquakes.
            },

            //shows the array of all earthquake objects and returns it if needed
            showDataArray:function(){
                console.log(eLayer.Manage.Data);
                return eLayer.Manage.Data
            },

            //filters the data array to eLayer.Manage.ParsedData which contains earthquakes that meet or exceed the argument.
            parseDataArrayMag: function (val) {

                eLayer.Manage.ParsedData = eLayer.Manage.Data.filter(function(earthquake) {
                    return earthquake.magnitude >= val;
                });


                if (eLayer.Manage.Draw.display === 'columns'){
                    eLayer.Manage.Draw.Columns();
                } else if (eLayer.Manage.Draw.display === 'placemarks'){
                    eLayer.Manage.Draw.Placemarks();
                } else {
                    eLayer.Manage.Draw.Placemarks();
                }

            },

            //controls animated placemarks
            Animations: {

                //animates argument renderable.
                animate: function (renderable) {
                    if (!eLayer.Manage.Animations.canAnimate){
                        return
                    }

                    if (eLayer.Manage.ParsedData.length > 0 && eLayer.Manage.Animations.animating === true) {
                        eLayer.Manage.Animations.stopAnimation();

                    } else if (!eLayer.Manage.ParsedData.length > 0){
                        return
                    }

                    //saves the renderable memory location
                    eLayer.Manage.Animations.animated = renderable;

                    var INDEX = 0;

                    //grabs the interval key and begins animation
                    eLayer.Manage.Animations.animated.Key = window.setInterval(function () {
                        //changes alpha of the placemark
                        renderable.attributes.imageColor = new WorldWind.Color(1,1,1,1 - INDEX/20);
                        renderable.highlightAttributes.imageColor = new WorldWind.Color(1,1,1,1 - INDEX/20);
                        renderable.attributes.imageScale = 2* (.5+INDEX/20);
                        renderable.highlightAttributes.imageScale = 2.8* (.5+INDEX/20);
                        INDEX++;
                        //animation resets after 20
                        if (INDEX > 20){
                            INDEX = 0;
                        }
                        eLayer.Manage.Animations.animating = true;
                        wwd.redraw();
                    },50)
                },

                //self explanatory
                stopAnimation: function () {

                    //stops animation
                    clearTimeout(eLayer.Manage.Animations.animated.Key);

                    //restore original properties
                    eLayer.Manage.Animations.animated.attributes.imageScale = 1;
                    eLayer.Manage.Animations.animated.highlightAttributes.imageScale = 1.2;
                    eLayer.Manage.Animations.animated.attributes.imageColor = new WorldWind.Color(1,1,1,.55)
                    eLayer.Manage.Animations.animated.highlightAttributes.imageColor = new WorldWind.Color(1,1,1,.55);

                    eLayer.Manage.Animations.animating = false;
                }
            }
        };

//contains various layer functions
        eLayer.Layer = {
            //clears the layer for the earthquake data to be refreshed or changed
            clearLayer: function () {
                eLayer.removeAllRenderables();
            }
        };
        return eLayer
    };

    return EarthquakeViewLayer;

});


/**
 * Created by Matthew on 6/16/2015.
 */




































define(['http://worldwindserver.net/webworldwind/worldwindlib.js',
        'http://worldwindserver.net/webworldwind/examples/LayerManager.js',
        'http://worldwindserver.net/webworldwind/examples/CoordinateController.js',
        'UGSDataRetriever', 'QueryParameterExtractor', 'EarthquakeViewLayer',
        'TectonicPlatesLayer', 'PlateBoundaryDataProvider',
        'TectonicPlateLabelLayer', 'Tour', 'TourManager','CommandsPanel'],
    function (ww,
              LayerManager,
              CoordinateController,
              UGSDataRetriever,
              QueryParameterExtractor,
              EarthquakeViewLayer,
              TectonicPlatesLayer,
              PlateBoundaryDataProvider,
              TectonicPlateLabelLayer,
              Tour,
              TourManager,
              CommandsPanel)  {
        "use strict";
        // Tell World Wind to log only warnings.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create the World Window.
        var wwd = new WorldWind.WorldWindow("canvasOne");


         // Added imagery layers.

        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: false},
            {layer: new WorldWind.OpenStreetMapImageLayer(null), enabled: false},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }
        var arrowLay = new WorldWind.RenderableLayer()

        //displays info of highlighted earthquake in eData division, also sets the significant earthquake when clicked
        var displayInfo = function (layer) {

            //location to display the info
            var display = $('#eData');

            //finds the highlighted renderable
            for (var i in layer.renderables) {

                if (layer.renderables[i].highlighted) {
                    display.empty();
                    display.append('<p>' + layer.Manage.ParsedData[i].info + '</p>');
                }

            }
        };

        var newLayer = new EarthquakeViewLayer(wwd,"Data Display");
        newLayer.Manage.setDisplayType('placemarks');

        var newColumns = new EarthquakeViewLayer(wwd,"Data Display Columns");
        newColumns.Manage.setDisplayType('columns');

        // get the data from the data provider for the plate boundaries
        var plateDataProvider = new PlateBoundaryDataProvider();

        // use the data retrieved from the data provider as a three dimensional
        // array to draw the tectonic plates
        var tectonicPlates = new TectonicPlatesLayer(plateDataProvider.records);
        var tectonicPlatesLabels = new TectonicPlateLabelLayer();

        //uses the REST API available on the USGS website to retrieve
        //earthquake data from the last 30 days
        var dataRetriever = new UGSDataRetriever();
        console.log('Loading USGS Data');
        //waits for the data to be retrieved and parsed and then passes it to the earthquake layer.
        dataRetriever.retrieveRecords(function(arg) {
            console.log('Loaded');



            //passes the retrieved data to the layer
            newLayer.Manage.createDataArray(arg);
            wwd.addLayer(tectonicPlates);
            wwd.addLayer(newLayer);
            newColumns.Manage.createDataArray(arg);
            wwd.addLayer(newColumns);
            newColumns.enabled = false


            //wait for the slider to be ready
            $('#magnitudeSlider').ready(function() {

                //instantiate the slider
                var magSlider = $('#magnitudeSlider').slider({
                    formatter: function(value) {
                        return 'Current value: ' + value;
                    }
                });
                magSlider.on('slideStop',function(arg){

                    //passes slider value to the layer
                    newLayer.Manage.parseDataArrayMag(arg.value);
                    newColumns.Manage.parseDataArrayMag(arg.value);

                    //again animates the most recent displayed earthquake. When the renderables change, the renderable ceases to be animated.
                    newLayer.Manage.Animations.animate(newLayer.renderables[0]);

                    //log the changes to the list of earthquakes
                    commandsPanel.resetData();
                });

                var goToAnimator = new WorldWind.GoToAnimator(wwd);

                function magnitudeRestrict(qs) {
                    var mag = qs['magnitude'];
                    if(mag !== undefined) {
                        mag = Number(mag);
                        newLayer.Manage.parseDataArrayMag(mag);
                        newLayer.Manage.Animations.animate(newLayer.renderables[0]);
                        magSlider.slider('setValue',mag);
                    }
                }

                // Add mechanism for handling uri query parameters
                function goToCallback(qs) {

                    var long = undefined;
                    var lat = undefined;

                    function goToUsersLocation(position) {
                        long = position.coords.longitude;
                        lat = position.coords.latitude;
                        var alt = (qs['altitude'] !== undefined) ? qs["altitude"] : 1527000;
                        var pos = new WorldWind.Position(lat, long, alt);
                        console.log('going to ', pos);
                        goToAnimator.goTo(pos);
                        console.log('lat ...', lat);
                        console.log('long ...', long);
                    }

                    function goToDefaultLocation(err) {
                        console.log('going to default or iframe specified location');
                        var alt = (qs['altitude'] !== undefined) ? qs["altitude"] : 1000000;
                        long = (qs['longitude'] !== undefined) ? qs['longitude'] : 0.0;
                        lat = (qs['latitude'] !== undefined) ? qs['latitude'] : 0.0;
                        var pos = new WorldWind.Position(lat, long, alt);
                        console.log('going to ', pos);
                        goToAnimator.goTo(pos);
                    }

                    function customLocationDefined() {
                        return qs['longitude'] || qs['latitude'];
                    }

                    if(customLocationDefined()) {
                        console.log('iframe defines location');
                        goToDefaultLocation(null);
                    } else if(navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(goToUsersLocation, goToDefaultLocation);
                    } else {
                        goToDefaultLocation(null);
                    }



                }

                function isNumberThere(qs) {
                    if(qs['anumber'] !== undefined) {
                        console.log(qs['anumber']);
                    }
                }

                //function magnitudeFilter(qs) {
                //    if(qs['magnitude'] !== undefined) {
                //        markerLayer.parseDesiredEarthquakesByMag(Number(qs['magnitude']));
                //    }
                //}

                var queryParamsCallbacks = [
                    isNumberThere,
                    goToCallback,
                    magnitudeRestrict
                ];
                var queryParamaterExtractor = new QueryParameterExtractor(queryParamsCallbacks);
                console.log(queryParamaterExtractor);
                console.log(queryParamaterExtractor.getParams());

                //parses and draws earthquakes on layer. Set minimum visible magnitude to the default value of the slider
                newLayer.Manage.parseDataArrayMag(magSlider.slider('getValue'));

                //animates most recent earthquake. the first renderable in the layer is the most recent earthquake
                newLayer.Manage.Animations.animate(newLayer.renderables[0]);
                console.log('quakes ', arg);


                //this is all commands panel stuff

                //function that sorts an array and tracks the indexes change
                function sortWithIndeces(toSortI,property) {
                    var toSort = toSortI.slice();
                    for (var i = 0; i < toSort.length; i++) {
                        toSort[i] = [toSort[i], i];
                    }
                    if (property){toSort.sort(function (left, right) {
                        return left[0][property] < right[0][property] ? -1 : 1;
                    });
                    } else {
                        toSort.sort(function (left, right) {
                            return left[0] < right[0] ? -1 : 1;
                        });
                    }

                    toSort.sortIndices = [];
                    for (var j = 0; j < toSort.length; j++) {
                        toSort.sortIndices.push(toSort[j][1]);
                        toSort[j] = toSort[j][0];
                    }
                    return toSort;
                }

                //for commands panel layer.
                var ShowChanges = function (layerArg,INDEX) {
                    var layer = layerArg;
                    var display = $('#eData');
                    display.empty();
                    display.append('<p>' + layerArg.Manage.ParsedData[INDEX].info + '</p>');
                    layerArg.Manage.Animations.animate(layerArg.renderables[INDEX])
                    var positionAlias = Object.create(layerArg.Manage.ParsedData[INDEX].position);
                    positionAlias.altitude = 2000000;
                    goToAnimator.cancel();
                    goToAnimator.goTo(positionAlias);

                };

                var quakesInTour = arg.filter(function(quake) {
                    return quake.magnitude >= 5;
                });

                function getQuakePosition(quake) {
                    return new WorldWind.Position(quake.lat, quake.long, 100000);
                }

                var magnitudeTour = new Tour('Magnitude Tour',quakesInTour, getQuakePosition, function(q1, q2) {
                    return Math.ceil(q1.magnitude - q2.magnitude);
                });
                var magnitudeTourManager = new TourManager(magnitudeTour, goToAnimator);

                var timeTour = new Tour('Time tour', quakesInTour, getQuakePosition, function(q1, q2) {
                    var t1 = q1.time;
                    var t2 = q2.time;
                    if(t1 < t2) {
                        return -1;
                    } else if (t1 > t2) {
                        return 1;
                    }
                    return 0;
                });
                var timeTourManager = new TourManager(timeTour, goToAnimator);

                var commandsPanel = new CommandsPanel(wwd,newLayer);

                //create a 1-1 map from the indexes of the array sorted by time to the array sorted by magnitude
                var indexis = sortWithIndeces(commandsPanel.layer.Manage.ParsedData,'magnitude').sortIndices;
                var OrIndexMtD = function (ind) {
                    return indexis[ind];
                };

                //the inverse function
                var indexis2 = sortWithIndeces(indexis).sortIndices;
                var OrIndexDtM = function (ind) {
                    return indexis2[ind];
                };

                //recalculate the mapping
                commandsPanel.resetData = function() {
                    commandsPanel.FocusedEarthquake = 0;
                    indexis = sortWithIndeces(commandsPanel.layer.Manage.ParsedData,'magnitude').sortIndices;
                    indexis2 = sortWithIndeces(indexis).sortIndices;
                };
                //repeated code for buttons
                //this variable contains the functions that will be applied in the same order as the buttons are in the array.
                var self = commandsPanel;
                //list of buttons id,name
                var buttonsForCPanel = [
                    ['CPanelUp','Greater Magnitude'],
                    ['CPanelDown','Lesser Magnitude'],
                    ['CPanelRight','Newer Earthquake'],
                    ["CPanelLeft",'Older Earthquake'],
                    ['StartTour','Start Tour'],
                    ['NewestEarth','Newest Earthquake']
                ];
                for (var i = 0; i<buttonsForCPanel.length; i++){
                    commandsPanel.addButton(buttonsForCPanel[i])
                };
                var buttonFunctionsForCPanel = [
                    function (event) {
                        if (OrIndexDtM(self.FocusedEarthquake)+1 < self.layer.Manage.ParsedData.length){
                            self.FocusedEarthquake = OrIndexMtD(OrIndexDtM(self.FocusedEarthquake) + 1);
                        }
                        ShowChanges(commandsPanel.layer,self.FocusedEarthquake);
                    },
                    function (event) {
                        if (OrIndexDtM(self.FocusedEarthquake) > 0){
                            self.FocusedEarthquake = OrIndexMtD(OrIndexDtM(self.FocusedEarthquake) - 1);
                        }
                        ShowChanges(commandsPanel.layer,self.FocusedEarthquake);
                    },
                    function (event) {
                        if (self.FocusedEarthquake+1 < self.layer.Manage.ParsedData.length){
                            self.FocusedEarthquake = self.FocusedEarthquake + 1;
                        }
                        ShowChanges(commandsPanel.layer,self.FocusedEarthquake);
                    },
                    function (event) {
                        if (self.FocusedEarthquake - 1 > 0) {
                            self.FocusedEarthquake = self.FocusedEarthquake - 1;
                        }
                        ShowChanges(commandsPanel.layer,self.FocusedEarthquake);
                    },
                    function (event) {
                        if (!magnitudeTourManager.tourRun) {
                            magnitudeTourManager.startTour();
                            console.log('running');
                            $(event.target).attr('class','btn btn-danger');
                            $(event.target).text("Stop Touring");
                            magnitudeTourManager.addCallback(function(t){
                                $(event.target).attr('class','btn btn-primary');
                                $(event.target).text("Start Tour");
                            });
                        }else{
                            magnitudeTourManager.stopTour();
                            console.log('stopped');
                            $(event.target).attr('class','btn btn-primary');
                            $(event.target).text("Start Tour");
                        }

                    },
                    function(event){
                        ShowChanges(commandsPanel.layer,self.FocusedEarthquake = 0);
                    }
                ];
                for (var i = 0; i<buttonFunctionsForCPanel.length; i++){
                    commandsPanel.addFunctionToButton(buttonsForCPanel[i][0],buttonFunctionsForCPanel[i]);
                };

                commandsPanel.FocusedEarthquake = 0;
                commandsPanel.synchronizeLayerList();
                commandsPanel.initMouseClickListener();

                // Uncomment to initiate tours
                //magnitudeTourManager.startTour();
                //timeTourManager.startTour();

            });

            //crude implementation to display the info of the earthquake highlighted
            document.getElementById("canvasOne").onmousemove = function tss () {
                displayInfo(newLayer);
                displayInfo(newColumns);
            };

            // Create a layer manager for controlling layer visibility.
            var layerManger = new LayerManager(wwd);
        });

        // Draw the World Window for the first time.
        wwd.redraw();

        // Create a coordinate controller to update the coordinate overlay elements.
        var coordinateController = new CoordinateController(wwd);

        //
        var highlightController = new WorldWind.HighlightController(wwd);

    });