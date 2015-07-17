package WEB-INF.classes.DemoServ;
import javax.servlet.http.*;
import javax.servlet.*;
import java.lang.*;
import javax.jnlp.PersistenceService;
import javax.tools.JavaCompiler;
import gov.nasa.worldwindx.examples.FlatWorld;
import gov.nasa.worldwindx.examples.FlatWorldEarthquakes;
import gov.nasa.worldwindx.examples.GeoJSONLoader;
import gov.nasa.worldwindx.applications.worldwindow.*;
import gov.nasa.worldwindx.*;
import gov.nasa.worldwind.WorldWind;
import gov.nasa.worldwind.WorldWind.*;
import gov.nasa.worldwind.awt.WorldWindowGLCanvas;

import java.io.*;
public class DemoServ extends HttpServlet{
public void doGet(HttpServletRequest req,HttpServletResponse res)throws ServletException,IOException
{
res.setContentType("text/html");
PrintWriter pw=res.getWriter();
String name=req.getParameter("name");
pw.println("Welcome "+name);


}}
