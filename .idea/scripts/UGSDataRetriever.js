	/*
	The following code can be used to parse data form the server.
	This code is not in a module format, and thus must be pasted to the desired location
	*/
	
	
	var dataReturn = [];       //This  will contain all the parsed data
	var xmlhttp = new XMLHttpRequest();
	var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=500";
	// The earthquake data is retrieved from the above URL using HTTP get.
	
   

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var data = JSON.parse(xmlhttp.responseText);
			myFunction(data);
		}
	}
	
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
	
	function myFunction(data) {
		
		var earthquakes = data['features'];

		for (i = 0; i< earthquakes.length; i++ ){
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
                    (24 * 60 * 60 * 1000);
			//How long ago the earthquake occured in terms of hours	
			earthquake.ageHours = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                    / (60 * 60 * 1000)));
					
			
			dataReturn.push(earthquake);
		
		}

       
	} 