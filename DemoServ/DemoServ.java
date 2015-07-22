package DemoServ;

import gov.nasa.worldwind.formats.geojson.GeoJSONDoc;
import gov.nasa.worldwind.formats.geojson.GeoJSONEventParser;
import gov.nasa.worldwindx.examples.FlatWorldEarthquakes;
import gov.nasa.worldwindx.examples.GeoJSONLoader;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class DemoServ extends HttpServlet {
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String returnaddress = req.getRequestURL().toString();
        res.setContentType("text/html");
        this.getClass();
        PrintWriter pw = res.getWriter();
        String name = req.getParameter("name");

        //pw.println("Welcome " + name);
    }
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException{
        doGet(req, res);
    }


    public void setUpGeoJSON()
    {
        GeoJSONDoc geodoc = new GeoJSONDoc("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");
        GeoJSONEventParser geoparser = new GeoJSONEventParser();
        FlatWorldEarthquakes flatWorld = new FlatWorldEarthquakes();



        GeoJSONLoader coordinateloader = new GeoJSONLoader();
        //coordinateloader.createLayerFromGeoJSON("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");

    }
}
