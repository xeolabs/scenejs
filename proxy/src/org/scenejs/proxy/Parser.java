package org.scenejs.proxy;


import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.IOException;
import java.io.DataInputStream;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.StringTokenizer;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: lindsay
 * Date: 12/04/2010
 * Time: 5:40:32 PM
 * To change this template use File | Settings | File Templates.
 */

public class Parser {

    private final static String XML_SCHEMA = "http://www.w3.org/2001/XMLSchema";
    private final static String SCHEMA_LANG = "http://java.sun.com/xml/jaxp/properties/schemaLanguage";
    private final static String SCHEMA_SOURCE = "http://java.sun.com/xml/jaxp/properties/schemaSource";
    private final static String SCHEMA_FILEPATH = "/home/lindsay/xeolabs/projects/scenejs/proxy/schema/collada_schema_1_4.xml";

    private DocumentBuilder dBuilder;
    private Document doc;
    private StringBuilder sb;

    public static void main(String argv[]) {

        try {
            Parser parser = new Parser();
            String sceneJS = parser.parse("http://www.scenejs.org/library/v0.7/assets/examples/seymourplane_triangulate/seymourplane_triangulate.dae", "Gudn");
            System.out.println(sceneJS);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    Parser() throws ParserConfigurationException {
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        dbFactory.setNamespaceAware(true);
        dbFactory.setValidating(true);
        File schema = new File(SCHEMA_FILEPATH);
        try {
            dbFactory.setAttribute(SCHEMA_LANG, XML_SCHEMA);
            dbFactory.setAttribute(SCHEMA_SOURCE, schema);
        } catch (IllegalArgumentException x) {
            System.err.println("DOM Parser does not support validation.");
        }
        dBuilder = dbFactory.newDocumentBuilder();
    }

    public String parse(String urlStr, String assetId) throws IOException, SAXException {
        sb = new StringBuilder();

        URL url = new URL(urlStr);
        URLConnection urlConn = url.openConnection();
        urlConn.setDoInput(true);
        urlConn.setUseCaches(false);

        DataInputStream dis = new DataInputStream(urlConn.getInputStream());

        doc = dBuilder.parse(dis);
        doc.getDocumentElement().normalize();
        System.out.println("Root element :" + doc.getDocumentElement().getNodeName());

        if (assetId != null) {
            Element asset = doc.getElementById(assetId.trim());
            if (asset != null) {
                node(asset);
            } else {
                scene();
            }
        } else {
            scene();
        }
        dis.close();
        return sb.toString();
    }

    private void scene() {
        node((Element) doc.getElementsByTagName("scene").item(0));
    }

    private void node(Element e) {

        //System.out.println("node '" + node.getAttributes().getNamedItem("id"));

        NodeList nodeList = e.getChildNodes();

        for (int i = 0; i < nodeList.getLength(); i++) {
            Element child = (Element) nodeList.item(i);
            String name = child.getNodeName();

            if (name.equals("node")) {
                node(child);

            } else if (name.equals("matrix")) {
                matrix(child);

            } else if (name.equals("translate")) {
                translate(child);

            } else if (name.equals("rotate")) {
                rotate(child);

            } else if (name.equals("instance_node")) {
                node(instanced(child));

            } else if (name.equals("instance_visual_scene")) {
                node(instanced(child));

            } else if (name.equals("instance_geometry")) {
                geometry(instanced(child));
            }
        }

//        if (matrix != null) {
//
//        } else {
        sb.insert(0, "SceneJS.node(");
        sb.append(")");
        //}
    }

    private void rotate(Element r) {
        sb.insert(0, "SceneJS.rotate({");
        sb.append("})");
    }

    private void translate(Element t) {
        sb.insert(0, "SceneJS.translate({");
        parseStringArray(t);
        sb.append("})");
    }

    private void matrix(Node t) {
        sb.insert(0, "SceneJS.matrix({elements = \"");
        reorderMatrix(parseStringArray(t), (new int[]{0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15}));
        sb.append("\"})");
    }

    private void reorderMatrix(String[] str, int[] index) {
        for (int i = 0; i < index.length; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            sb.append(str[index[i]]);
        }
    }

    private String getTagValue(String sTag, Element eElement) {
        NodeList nlList = eElement.getElementsByTagName(sTag).item(0).getChildNodes();
        Node nValue = (Node) nlList.item(0);

        return nValue.getNodeValue();
    }

    private String[] parseStringArray(Node node) {
        StringTokenizer st = new StringTokenizer(node.getTextContent().trim());
        String[] array = new String[st.countTokens()];
        for (int i = 0; st.hasMoreTokens(); i++) {
            array[i] = st.nextToken().trim();
        }
        return array;
    }

    private int[] parseIntArray(Node node) {
        StringTokenizer st = new StringTokenizer(node.getTextContent().trim());
        int[] array = new int[st.countTokens()];
        for (int i = 0; st.hasMoreTokens(); i++) {
            array[i] = Integer.parseInt(st.nextToken().trim());
        }
        return array;
    }


    private void geometry(Element g) {

    }

    private void geometriesData(Element geometry) {
        List trianglesList = getTrianglesList(geometry);
    }

    private List getTrianglesList(Element geometry) {
        return mesh((Element) geometry.getElementsByTagName("mesh").item(0));
    }

    private List mesh(Element m) {
        System.out.println("%%%%%%%%%%%%%%%% mesh");
        List triangles = new ArrayList();
        NodeList pl = m.getElementsByTagName("polyList");
        for (int i = 0; i < pl.getLength(); i++) {

        }

        NodeList tl = m.getElementsByTagName("triangles");
        for (int i = 0; i < tl.getLength(); i++) {

        }
        return triangles;
    }

    private Element instanced(Element instance) {
        return doc.getElementById(instance.getAttribute("url").substring(1));
    }

    private List<Integer> getTrianglesFromPolyList(Element polyList) {
        List<Integer> triangles = new ArrayList<Integer>();
        NodeList inputs = polyList.getElementsByTagName("input");
        int maxOffset = getMaxOffset(inputs);
        int[] vCount = parseIntArray(polyList.getElementsByTagName("vcount").item(0));
        int[] faces = parseIntArray(polyList.getElementsByTagName("p").item(0));
        int base = 0;
        for (int i = 0; i < vCount.length; i++) {
            for (int j = 0; j < vCount[i] - 2; j++) {
                for (int k = 0; k < maxOffset; k++) {
                    triangles.add(faces[base + k]);
                }
            }
            base = base + (maxOffset + 1) * vCount[i];
        }
        return triangles;
    }

    private int getMaxOffset(NodeList inputs) {
        int maxOffset = 0;
        for (int n = 0; n < inputs.getLength(); n++) {
            int offset = Integer.parseInt(((Element) inputs.item(n)).getAttribute("offset"));
            if (offset > maxOffset) {
                maxOffset = offset;
            }
        }
        return maxOffset;
    }
}


