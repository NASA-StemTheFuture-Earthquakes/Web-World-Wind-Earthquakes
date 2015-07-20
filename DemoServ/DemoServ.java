package DemoServ;

import gov.nasa.worldwind.Configuration;
import gov.nasa.worldwind.WorldWind;
import gov.nasa.worldwind.avlist.AVList;
import gov.nasa.worldwind.event.SelectEvent;
import gov.nasa.worldwind.event.SelectListener;
import gov.nasa.worldwind.formats.geojson.GeoJSONPoint;
import gov.nasa.worldwind.geom.Angle;
import gov.nasa.worldwind.geom.Position;
import gov.nasa.worldwind.globes.EarthFlat;
import gov.nasa.worldwind.layers.*;
import gov.nasa.worldwind.render.*;
import gov.nasa.worldwind.util.Logging;
import gov.nasa.worldwind.util.WWUtil;
import gov.nasa.worldwind.view.orbit.BasicOrbitView;
import gov.nasa.worldwind.view.orbit.FlatOrbitView;
import gov.nasa.worldwindx.examples.ApplicationTemplate;
import gov.nasa.worldwindx.examples.ClickAndGoSelectListener;
import gov.nasa.worldwindx.examples.FlatWorldPanel;
import gov.nasa.worldwindx.examples.GeoJSONLoader;

import javax.media.opengl.GL2;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.swing.*;
import javax.swing.border.CompoundBorder;
import javax.swing.border.TitledBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.DoubleBuffer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.logging.Level;

public class DemoServ extends HttpServlet {
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String returnaddress = req.getRequestURL().toString();
        res.setContentType("text/html");
        PrintWriter pw = res.getWriter();
        String name = req.getParameter("name");
        //res.
        //pw.println("Welcome " + name);
    }
    public static void main(String[] var0) {
        Configuration.setValue("gov.nasa.worldwind.avkey.InitialLatitude", Integer.valueOf(0));
        Configuration.setValue("gov.nasa.worldwind.avkey.InitialLongitude", Integer.valueOf(0));
        Configuration.setValue("gov.nasa.worldwind.avkey.InitialAltitude", Double.valueOf(5.0E7D));
        Configuration.setValue("gov.nasa.worldwind.avkey.GlobeClassName", EarthFlat.class.getName());
        Configuration.setValue("gov.nasa.worldwind.avkey.ViewClassName", FlatOrbitView.class.getName());
        ApplicationTemplate.start("World Wind USGS Earthquakes M 2.5+ - 7 days", WebWorldEarthquakes.AppFrame.class);
    }
    public void addEarthquakes() {
        // var USGSDataRetriever = new JSON

    }

    public class WebWorldEarthquakes extends ApplicationTemplate {
        protected static final String USGS_EARTHQUAKE_FEED_URL = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
        protected static final String USGS_EARTHQUAKE_MAGNITUDE = "mag";
        protected static final String USGS_EARTHQUAKE_PLACE = "place";
        protected static final String USGS_EARTHQUAKE_TIME = "time";
        protected static final long UPDATE_INTERVAL = 300000L;
        protected static final long MILLISECONDS_PER_MINUTE = 60000L;
        protected static final long MILLISECONDS_PER_HOUR = 3600000L;
        protected static final long MILLISECONDS_PER_DAY = 86400000L;

        public WebWorldEarthquakes() {
        }



        public class AppFrame extends gov.nasa.worldwindx.examples.ApplicationTemplate.AppFrame {
            private RenderableLayer eqLayer;
            private WebWorldEarthquakes.AppFrame.EqAnnotation mouseEq;
            private WebWorldEarthquakes.AppFrame.EqAnnotation latestEq;
            private GlobeAnnotation tooltipAnnotation;
            private JButton downloadButton;
            private JLabel statusLabel;
            private JLabel latestLabel;
            private WebWorldEarthquakes.AppFrame.Blinker blinker;
            private Timer updater;
            private long updateTime;
            private JComboBox magnitudeCombo;
            private AnnotationAttributes eqAttributes;
            private Color[] eqColors;

            public AppFrame() {
                super(true, true, false);
                this.eqColors = new Color[]{Color.RED, Color.ORANGE, Color.YELLOW, Color.GREEN, Color.BLUE, Color.GRAY, Color.BLACK};
                LayerList var1 = this.getWwd().getModel().getLayers();

                for (int var2 = 0; var2 < var1.size(); ++var2) {
                    if (var1.get(var2) instanceof SkyGradientLayer) {
                        var1.set(var2, new SkyColorLayer());
                    } else if (var1.get(var2) instanceof WorldMapLayer) {
                        ((Layer) var1.get(var2)).setMaxActiveAltitude(2.0E7D);
                    } else if (var1.get(var2) instanceof CompassLayer) {
                        ((Layer) var1.get(var2)).setMaxActiveAltitude(2.0E7D);
                    }
                }

                this.tooltipAnnotation = new GlobeAnnotation("", Position.fromDegrees(0.0D, 0.0D, 0.0D));
                Font var4 = Font.decode("Arial-Plain-16");
                this.tooltipAnnotation.getAttributes().setFont(var4);
                this.tooltipAnnotation.getAttributes().setSize(new Dimension(400, 0));
                this.tooltipAnnotation.getAttributes().setDistanceMinScale(1.0D);
                this.tooltipAnnotation.getAttributes().setDistanceMaxScale(1.0D);
                this.tooltipAnnotation.getAttributes().setVisible(false);
                this.tooltipAnnotation.setPickEnabled(false);
                this.tooltipAnnotation.setAlwaysOnTop(true);
                JPanel var3 = new JPanel();
                var3.setLayout(new BoxLayout(var3, 1));
                var3.add(this.makeEarthquakesPanel());
                var3.add(new FlatWorldPanel(this.getWwd()));
                this.getLayerPanel().add(var3, "South");
                this.getWwd().addSelectListener(new SelectListener() {
                    public void selected(SelectEvent var1) {
                        if (var1.getEventAction().equals("gov.nasa.worldwind.SelectEvent.Rollover")) {
                            AppFrame.this.highlight(var1.getTopObject());
                        }

                    }
                });
                this.getWwd().addSelectListener(new ClickAndGoSelectListener(this.getWwd(), WebWorldEarthquakes.AppFrame.EqAnnotation.class, 1000000.0D));
                this.updater = new Timer(1000, new ActionListener() {
                    public void actionPerformed(ActionEvent var1) {
                        long var2 = System.currentTimeMillis();
                        long var4 = var2 - AppFrame.this.updateTime;
                        if (var4 >= 300000L) {
                            AppFrame.this.updateTime = var2;
                            AppFrame.this.downloadButton.setText("Update");
                            AppFrame.this.startEarthquakeDownload();
                        } else {
                            long var6 = 300000L - var4;
                            int var8 = (int) Math.floor((double) var6 / 60000.0D);
                            int var9 = (int) ((var6 - (long) var8 * 60000L) / 1000L);
                            AppFrame.this.downloadButton.setText(String.format("Update (in %1$02d:%2$02d)", new Object[]{Integer.valueOf(var8), Integer.valueOf(var9)}));
                        }

                    }
                });
                this.updater.start();
            }

            private void highlight(Object var1) {
                if (this.mouseEq != var1) {
                    if (this.mouseEq != null) {
                        this.mouseEq.getAttributes().setHighlighted(false);
                        this.mouseEq = null;
                        this.tooltipAnnotation.getAttributes().setVisible(false);
                    }

                    if (var1 != null && var1 instanceof WebWorldEarthquakes.AppFrame.EqAnnotation) {
                        this.mouseEq = (WebWorldEarthquakes.AppFrame.EqAnnotation) var1;
                        this.mouseEq.getAttributes().setHighlighted(true);
                        this.tooltipAnnotation.setText(this.composeEarthquakeText(this.mouseEq));
                        this.tooltipAnnotation.setPosition(this.mouseEq.getPosition());
                        this.tooltipAnnotation.getAttributes().setVisible(true);
                        this.getWwd().redraw();
                    }

                }
            }

            private void setBlinker(WebWorldEarthquakes.AppFrame.EqAnnotation var1) {
                if (this.blinker != null) {
                    this.blinker.stop();
                    this.getWwd().redraw();
                }

                if (var1 != null) {
                    this.blinker = new WebWorldEarthquakes.AppFrame.Blinker(var1);
                }
            }

            private void setLatestLabel(WebWorldEarthquakes.AppFrame.EqAnnotation var1) {
                if (var1 != null) {
                    this.latestLabel.setText(this.composeEarthquakeText(var1));
                } else {
                    this.latestLabel.setText("");
                }

            }

            private String composeEarthquakeText(WebWorldEarthquakes.AppFrame.EqAnnotation var1) {
                StringBuilder var2 = new StringBuilder();
                var2.append("<html>");
                Number var3 = (Number) var1.getValue("mag");
                String var4 = (String) var1.getValue("place");
                if (var3 != null || !WWUtil.isEmpty(var4)) {
                    var2.append("<b>");
                    if (var3 != null) {
                        var2.append("M ").append(var3).append(" - ");
                    }

                    if (var4 != null) {
                        var2.append(var4);
                    }

                    var2.append("</b>");
                    var2.append("<br/>");
                }

                Number var5 = (Number) var1.getValue("time");
                if (var5 != null) {
                    long var6 = this.updateTime - var5.longValue();
                    var2.append(this.timePassedToString(var6));
                    var2.append("<br/>");
                }

                var2.append(String.format("%.2f", new Object[]{Double.valueOf(var1.getPosition().elevation)})).append(" km deep");
                var2.append("</html>");
                return var2.toString();
            }

            protected String timePassedToString(long var1) {
                long var3;
                if (var1 > 86400000L) {
                    var3 = var1 / 86400000L;
                    return var3 + (var3 > 1L ? " days ago" : " day ago");
                } else if (var1 > 3600000L) {
                    var3 = var1 / 3600000L;
                    return var3 + (var3 > 1L ? " hours ago" : " hour ago");
                } else if (var1 > 60000L) {
                    var3 = var1 / 60000L;
                    return var3 + (var3 > 1L ? " minutes ago" : " minute ago");
                } else {
                    return "moments ago";
                }
            }

            private JPanel makeEarthquakesPanel() {
                JPanel var1 = new JPanel();
                var1.setLayout(new BoxLayout(var1, 1));
                JPanel var2 = new JPanel(new GridLayout(0, 1, 0, 0));
                var2.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                JButton var3 = new JButton("Zoom on latest");
                var3.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent var1) {
                        if (AppFrame.this.latestEq != null) {
                            Position var2 = AppFrame.this.latestEq.getPosition();
                            BasicOrbitView var3 = (BasicOrbitView) AppFrame.this.getWwd().getView();
                            var3.addPanToAnimator(new Position(var2, 0.0D), Angle.ZERO, Angle.ZERO, 1000000.0D);
                        }

                    }
                });
                var2.add(var3);
                var1.add(var2);
                JPanel var4 = new JPanel(new GridLayout(0, 1, 0, 0));
                var4.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                JButton var5 = new JButton("Reset Global View");
                var5.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent var1) {
                        Double var2 = Configuration.getDoubleValue("gov.nasa.worldwind.avkey.InitialLatitude");
                        Double var3 = Configuration.getDoubleValue("gov.nasa.worldwind.avkey.InitialLongitude");
                        Double var4 = Configuration.getDoubleValue("gov.nasa.worldwind.avkey.InitialAltitude");
                        Position var5 = Position.fromDegrees(var2.doubleValue(), var3.doubleValue(), 0.0D);
                        BasicOrbitView var6 = (BasicOrbitView) AppFrame.this.getWwd().getView();
                        var6.addPanToAnimator(new Position(var5, 0.0D), Angle.ZERO, Angle.ZERO, var4.doubleValue());
                    }
                });
                var4.add(var5);
                var1.add(var4);
                JPanel var6 = new JPanel(new GridLayout(0, 1, 0, 0));
                var6.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                this.downloadButton = new JButton("Update");
                this.downloadButton.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent var1) {
                        AppFrame.this.startEarthquakeDownload();
                    }
                });
                this.downloadButton.setEnabled(false);
                var6.add(this.downloadButton);
                var1.add(var6);
                JPanel var7 = new JPanel(new GridLayout(0, 1, 0, 0));
                var7.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                this.statusLabel = new JLabel();
                this.statusLabel.setPreferredSize(new Dimension(200, 20));
                this.statusLabel.setVerticalAlignment(0);
                var7.add(this.statusLabel);
                var1.add(var7);
                JPanel var8 = new JPanel(new GridLayout(0, 2, 0, 0));
                var8.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                var8.add(new JLabel("Min Magnitude:"));
                this.magnitudeCombo = new JComboBox(new String[]{"2.5", "3", "4", "5", "6", "7"});
                this.magnitudeCombo.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent var1) {
                        AppFrame.this.applyMagnitudeFilter(Double.parseDouble((String) AppFrame.this.magnitudeCombo.getSelectedItem()));
                    }
                });
                var8.add(this.magnitudeCombo);
                var1.add(var8);
                JPanel var9 = new JPanel(new GridLayout(0, 2, 0, 0));
                var9.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                var9.add(new JLabel("Latest:"));
                final JCheckBox var10 = new JCheckBox("Animate");
                var10.setSelected(true);
                var10.addActionListener(new ActionListener() {
                    public void actionPerformed(ActionEvent var1) {
                        if (var10.isSelected()) {
                            AppFrame.this.setBlinker(AppFrame.this.latestEq);
                        } else {
                            AppFrame.this.setBlinker((WebWorldEarthquakes.AppFrame.EqAnnotation) null);
                        }

                    }
                });
                var9.add(var10);
                var1.add(var9);
                JPanel var11 = new JPanel(new GridLayout(0, 1, 0, 0));
                var11.setBorder(BorderFactory.createEmptyBorder(4, 4, 4, 4));
                this.latestLabel = new JLabel();
                this.latestLabel.setPreferredSize(new Dimension(200, 60));
                this.latestLabel.setVerticalAlignment(1);
                var11.add(this.latestLabel);
                var1.add(var11);
                var1.setBorder(new CompoundBorder(BorderFactory.createEmptyBorder(9, 9, 9, 9), new TitledBorder("Earthquakes")));
                var1.setToolTipText("Earthquakes controls.");
                return var1;
            }

            private void startEarthquakeDownload() {
                WorldWind.getScheduledTaskService().addTask(new Runnable() {
                    public void run() {
                        AppFrame.this.downloadEarthquakes("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");
                    }
                });
            }

            private void downloadEarthquakes(String var1) {
                if (this.downloadButton != null) {
                    this.downloadButton.setEnabled(false);
                }

                if (this.statusLabel != null) {
                    this.statusLabel.setText("Updating earthquakes...");
                }

                RenderableLayer var2 = (RenderableLayer) this.buildEarthquakeLayer(var1);
                if (var2.getNumRenderables() > 0) {
                    LayerList var3 = this.getWwd().getModel().getLayers();
                    if (this.eqLayer != null) {
                        var3.remove(this.eqLayer);
                    }

                    this.eqLayer = var2;
                    this.eqLayer.addRenderable(this.tooltipAnnotation);
                    ApplicationTemplate.insertBeforePlacenames(this.getWwd(), this.eqLayer);
                    this.getLayerPanel().update(this.getWwd());
                    this.applyMagnitudeFilter(Double.parseDouble((String) this.magnitudeCombo.getSelectedItem()));
                    if (this.statusLabel != null) {
                        this.statusLabel.setText("Updated " + (new SimpleDateFormat("EEE h:mm aa")).format(new Date()));
                    }
                } else if (this.statusLabel != null) {
                    this.statusLabel.setText("No earthquakes");
                }

                if (this.downloadButton != null) {
                    this.downloadButton.setEnabled(true);
                }

            }

            private Layer buildEarthquakeLayer(String var1) {
                GeoJSONLoader var2 = new GeoJSONLoader() {
                    protected void addRenderableForPoint(GeoJSONPoint var1, RenderableLayer var2, AVList var3) {
                        try {
                            AppFrame.this.addEarthquake(var1, var2, var3);
                        } catch (Exception var5) {
                            Logging.logger().log(Level.WARNING, "Exception adding earthquake", var5);
                        }

                    }
                };
                RenderableLayer var3 = new RenderableLayer();
                var3.setName("Earthquakes");
                var2.addSourceGeometryToLayer(var1, var3);
                return var3;
            }

            private void addEarthquake(GeoJSONPoint var1, RenderableLayer var2, AVList var3) {
                if (this.eqAttributes == null) {
                    this.eqAttributes = new AnnotationAttributes();
                    this.eqAttributes.setLeader("gov.nasa.worldwind.avkey.ShapeNone");
                    this.eqAttributes.setDrawOffset(new Point(0, -16));
                    this.eqAttributes.setSize(new Dimension(32, 32));
                    this.eqAttributes.setBorderWidth(0.0D);
                    this.eqAttributes.setCornerRadius(0);
                    this.eqAttributes.setBackgroundColor(new Color(0, 0, 0, 0));
                }

                WebWorldEarthquakes.AppFrame.EqAnnotation var4 = new WebWorldEarthquakes.AppFrame.EqAnnotation(var1.getPosition(), this.eqAttributes);
                var4.setAltitudeMode(Integer.valueOf(1));
                var4.setValues(var3);
                Number var5 = (Number) var4.getValue("mag");
                Number var6 = (Number) var4.getValue("time");
                int var7 = 6;
                if (var6 != null) {
                    var7 = (int) ((this.updateTime - var6.longValue()) / 86400000L);
                    if (this.latestEq != null) {
                        Number var8 = (Number) this.latestEq.getValue("time");
                        if (var8.longValue() < var6.longValue()) {
                            this.latestEq = var4;
                        }
                    } else {
                        this.latestEq = var4;
                    }
                }

                var4.getAttributes().setTextColor(this.eqColors[Math.min(var7, this.eqColors.length - 1)]);
                var4.getAttributes().setScale(var5.doubleValue() / 10.0D);
                var2.addRenderable(var4);
            }

            private void applyMagnitudeFilter(double var1) {
                this.latestEq = null;
                this.setBlinker((WebWorldEarthquakes.AppFrame.EqAnnotation) null);
                this.setLatestLabel((WebWorldEarthquakes.AppFrame.EqAnnotation) null);
                Iterable var3 = this.eqLayer.getRenderables();
                Iterator var4 = var3.iterator();

                while (var4.hasNext()) {
                    Renderable var5 = (Renderable) var4.next();
                    if (var5 instanceof WebWorldEarthquakes.AppFrame.EqAnnotation) {
                        WebWorldEarthquakes.AppFrame.EqAnnotation var6 = (WebWorldEarthquakes.AppFrame.EqAnnotation) var5;
                        Number var7 = (Number) var6.getValue("mag");
                        Number var8 = (Number) var6.getValue("time");
                        boolean var9 = var7.doubleValue() >= var1;
                        var6.getAttributes().setVisible(var9);
                        if (var9) {
                            if (this.latestEq != null) {
                                Number var10 = (Number) this.latestEq.getValue("time");
                                if (var10 != null && var8 != null && var10.longValue() < var8.longValue()) {
                                    this.latestEq = var6;
                                }
                            } else {
                                this.latestEq = var6;
                            }
                        }
                    }
                }

                this.setBlinker(this.latestEq);
                this.setLatestLabel(this.latestEq);
                this.getWwd().redraw();
            }

            private class Blinker {
                private WebWorldEarthquakes.AppFrame.EqAnnotation annotation;
                private double initialScale;
                private double initialOpacity;
                private int steps;
                private int step;
                private int delay;
                private Timer timer;

                private Blinker(WebWorldEarthquakes.AppFrame.EqAnnotation var2) {
                    this.steps = 10;
                    this.step = 0;
                    this.delay = 100;
                    this.annotation = var2;
                    this.initialScale = this.annotation.getAttributes().getScale();
                    this.initialOpacity = this.annotation.getAttributes().getOpacity();
                    this.timer = new Timer(this.delay, new ActionListener() {
                        public void actionPerformed(ActionEvent var1) {
                            Blinker.this.annotation.getAttributes().setScale(Blinker.this.initialScale * (double) (1.0F + 7.0F * ((float) Blinker.this.step / (float) Blinker.this.steps)));
                            Blinker.this.annotation.getAttributes().setOpacity(Blinker.this.initialOpacity * (double) (1.0F - (float) Blinker.this.step / (float) Blinker.this.steps));
                            Blinker.this.step = Blinker.this.step == Blinker.this.steps ? 0 : Blinker.this.step + 1;
                            AppFrame.this.getWwd().redraw();
                        }
                    });
                    this.start();
                }

                private void stop() {
                    this.timer.stop();
                    this.step = 0;
                    this.annotation.getAttributes().setScale(this.initialScale);
                    this.annotation.getAttributes().setOpacity(this.initialOpacity);
                }

                private void start() {
                    this.timer.start();
                }
            }

            private class EqAnnotation extends GlobeAnnotation {
                private DoubleBuffer shapeBuffer;

                public EqAnnotation(Position var2, AnnotationAttributes var3) {
                    super("", var2, var3);
                }

                protected void applyScreenTransform(DrawContext var1, int var2, int var3, int var4, int var5, double var6) {
                    double var8 = var6 * this.computeScale(var1);
                    GL2 var10 = var1.getGL().getGL2();
                    var10.glTranslated((double) var2, (double) var3, 0.0D);
                    var10.glScaled(var8, var8, 1.0D);
                }

                protected void doDraw(DrawContext var1, int var2, int var3, double var4, Position var6) {
                    if (var1.isPickingMode()) {
                        this.bindPickableObject(var1, var6);
                    }

                    this.applyColor(var1, this.getAttributes().getTextColor(), 0.6D * var4, true);
                    byte var7 = 32;
                    if (this.shapeBuffer == null) {
                        this.shapeBuffer = FrameFactory.createShapeBuffer("gov.nasa.worldwind.avkey.ShapeEllipse", (double) var7, (double) var7, 0, (DoubleBuffer) null);
                    }

                    GL2 var8 = var1.getGL().getGL2();
                    var8.glTranslated((double) (-var7 / 2), (double) (-var7 / 2), 0.0D);
                    FrameFactory.drawBuffer(var1, 6, this.shapeBuffer);
                }
            }
        }
    }



}
