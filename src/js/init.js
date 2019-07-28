import go from './../res/go.js'
import Inspector from './../res/DataInspetor'
var myDiagram, myPalette
export default function init() {

  var GO = go.GraphObject.make;
  var brush = "#999";
  var fill_blank = "white";
  var fill_full = '#999'
  var color = '#111';

  myDiagram =
    GO(go.Diagram, "myDiagramDiv", {
      "undoManager.isEnabled": true
    });

  function makePort(name, side) {
    return GO(go.Shape, "Rectangle", {
      fill: 'transparent', // not seen, by default; set to a translucent gray by showSmallPorts, defined below
      stroke: 'transparent',
      desiredSize: new go.Size(8, 8),
      alignment: side, // align the port on the main Shape
      alignmentFocus: side, // just inside the Shape
      portId: name,
      fromLinkable: true,
      toLinkable: true,
      fromLinkableDuplicates: true,
      toLinkableDuplicates: true,
      cursor: "pointer",
      margin: new go.Margin(-1, 0),
      mouseLeave: function (e, node) {
        node.fill = 'transparent'
      },
      mouseEnter: function (e, node) {
        node.fill = 'rgb(0,128,128)'
      },
    });
  }

  myDiagram.nodeTemplateMap.add("",
    GO(go.Node, "Table", {
        locationSpot: go.Spot.Center,
        resizable: true
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      GO(go.Shape, "Ellipse", {
          strokeWidth: 2,
          width: 60,
          height: 60,
          fill: 'transparent',
          name: "SHAPE",
        },
        new go.Binding("figure", "figure"),
        new go.Binding("geometry", "geometry"),
        new go.Binding("fill", "fill"),
        new go.Binding("stroke", "stroke"),
      ),
      GO(go.TextBlock, {
          margin: 5,
          maxSize: new go.Size(200, NaN),
          wrap: go.TextBlock.WrapFit,
          textAlign: "center",
          editable: true,
          font: "bold 9pt Helvetica, Arial, sans-serif",
          name: "TEXT",
          stroke: 'blue'
        },
        new go.Binding("stroke", "color"),
        new go.Binding("text", "text").makeTwoWay()
      ),
      makePort("r", go.Spot.Right),
      makePort("tr", new go.Spot(1, 0.3)),
      makePort("t", go.Spot.Top),
      makePort("l", go.Spot.Left),
      makePort("tl", new go.Spot(0, 0.3)),
      makePort("b", go.Spot.Bottom), {
        toolTip: GO("ToolTip",
          GO(go.TextBlock, {
              margin: 4
            },
            new go.Binding("text", "tips"))
        )
      }
    )
  );

  myDiagram.nodeTemplateMap.add("LinkLabel",
    GO("Node", {
        selectable: false,
        avoidable: false,
        layerName: "Foreground"
      },
      GO("Shape", "Ellipse", {
        width: 4,
        height: 4,
        stroke: 'transparent',
        fill: 'transparent',
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer",
        mouseLeave: function (e, node) {
          node.fill = 'transparent';
          node.stroke = 'transparent';
        },
        mouseEnter: function (e, node) {
          node.fill = 'rgb(0,128,128)';
          node.stroke = 'rgb(0,128,128)';
        },
      })
    ));
  myDiagram.addDiagramListener("ChangedSelection", function (diagramEvent) {
    var idrag = document.getElementById("infoDraggable");
    idrag.style.width = "";
    idrag.style.height = "";
  });

  myPalette = new go.Palette("myPaletteDiv");
  myPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;
  myDiagram.linkTemplate = GO("Link", {
      relinkableFrom: true,
      relinkableTo: true,
      toShortLength: 2
    },
    GO("Shape", {
      stroke: "#000",
      strokeWidth: 2
    }),
  )

  myDiagram.linkTemplateMap.add("linkToLink",
    GO("Link", {
        relinkableFrom: true,
        relinkableTo: true
      },
      GO("Shape", {
        stroke: "#000",
        strokeWidth: 2
      })
    ));

  myDiagram.model = GO(go.GraphLinksModel, {
    linkLabelKeysProperty: "labelKeys"
  });
  var male_propositus = go.Geometry.parse("M10,0 L10,10 L25,10 L25,0 L10,0 M3,15 L9,12 L9,17 L3,15 M6,16 L3,20", true);
  var female_propositus = go.Geometry.parse("M13,6 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 M3,15 L8,12 L8,17 L3,15 M6,16 L4,20", true);
  var male_carrier = go.Geometry.parse("M0,0 L5,0 L5,10 L0,10 L0,0 M5,0 L10,0 M10,10 L10,0 M5,10 L10,10", true);
  var female_carrier = go.Geometry.parse("F M10,0 m-5,0 a0,0 1 0,0 0,10 M5,0 L5,10 X M10,10 m-5,0 a0,0 1 0,0 0,-10", false);
  myPalette.model = new go.GraphLinksModel([{
      text: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: "Hexagon",
      tips: '正常女性'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: "Rectangle",
      tips: '正常男性'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: "Hexagon",
      tips: '女性患者'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: "Rectangle",
      tips: '男性患者'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      geometry: female_propositus,
      tips: '女性先证者'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: 'Gate',
      geometry: male_propositus,
      tips: '男性先证者'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      geometry: female_carrier,
      tips: '女性常染色体隐形基因携带者'
    },
    {
      text: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: 'Gate',
      geometry: male_carrier,
      tips: '男性常染色体隐形基因携带者'
    }
  ]);

  $(function () {
    $("#paletteDraggable").draggable({
      handle: "#paletteDraggableHandle"
    }).resizable({
      stop: function () {
        myPalette.layoutDiagram(true);
      }
    });

    $("#infoDraggable").draggable({
      handle: "#infoDraggableHandle"
    });

    new Inspector('myInfo', myDiagram, {
      properties: {
        "key": {
          readOnly: true,
          show: Inspector.showIfPresent
        },
        "fill": {
          show: Inspector.showIfPresent,
          type: 'color'
        },
        "stroke": {
          show: Inspector.showIfPresent,
          type: 'color'
        },
        "color": {
          show: Inspector.showIfPresent,
          type: 'color'
        },
        "figure": {
          show: false,
        },
        "tips": {
          show: false,
        },
        "geometry": {
          show: false,
        },
        "from": {
          show: false,
        },
        "to": {
          show: false,
        },
        "labelKeys": {
          show: false,
        },
        "toPort": {
          show: false,
        },
        "fromPort": {
          show: false,
        },

      }
    });
  });

  myDiagram.toolManager.linkingTool.archetypeLabelNodeData = {
    category: "LinkLabel"
  };

  myDiagram.model.linkFromPortIdProperty = 'fromPort';
  myDiagram.model.linkToPortIdProperty = 'toPort';
}