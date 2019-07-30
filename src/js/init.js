import go from './../res/go.js'
import Inspector from './../res/DataInspetor'
export default function init() {
  var myDiagram, myPalette
  var GO = go.GraphObject.make;
  var brush = "#999";
  var fill_blank = "white";
  var fill_full = '#999'
  var color = '#999';

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
    });
  }

  function makeText(row, col, textType) {
    return GO(go.TextBlock, {
        margin: 5,
        maxSize: new go.Size(200, NaN),
        wrap: go.TextBlock.WrapFit,
        textAlign: "center",
        editable: true,
        font: "bold 10pt Helvetica, Arial, sans-serif",
        name: "TEXT",
        row: row,
        column: col,
      },
      new go.Binding("stroke", "color"),
      new go.Binding("text", textType).makeTwoWay()
    )
  }
  myDiagram.nodeTemplateMap.add("",
    GO(go.Node, "Table", {
        resizable: true,
        resizeObjectName: "SHAPE",
        rotatable: true,
        rotateObjectName: "SHAPE",
        selectionChanged: (e) => {
          if (e.isSelected) {
            for (var it in e.ports.ja.Db) {
              e.ports.ja.Db[it].value.fill = 'rgb(0,128,128)'
            }
          } else {
            for (var it in e.ports.ja.Db) {
              e.ports.ja.Db[it].value.fill = 'transparent'
            }
          }
        }
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      GO(go.Panel, 'Table',
        GO(go.Panel, 'Spot', {
            row: 1,
            column: 1
          },
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
          makePort("r", go.Spot.Right),
          makePort("tr", new go.Spot(1, 0.3)),
          makePort("t", go.Spot.Top),
          makePort("l", go.Spot.Left),
          makePort("tl", new go.Spot(0, 0.3)),
          makePort("b", go.Spot.Bottom),
        ),
        makeText(0, 1, 'textTop'), //top
        makeText(2, 1, 'textBottom'), //bottom
        makeText(1, 0, 'textLeft'), //left
        makeText(1, 2, 'textRight'), //right
      ), {
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
  var male_death_this = go.Geometry.parse("M3,3 L8,3 L8,8 L3,8 L3,3 M11,0 L0,11", true);
  var female_death_this = go.Geometry.parse("M15,6 m-5,0 a0,0 1 0,0 0,10 a0,0 1 0,0 0,-10 M20,0 L0,20", true);
  var male_death_other = go.Geometry.parse("M3,3 L8,3 L8,8 L3,8 L3,3 M11,0 L0,11", true);
  var female_death_other = go.Geometry.parse("M15,6 m-5,0 a0,0 1 0,0 0,10 a0,0 1 0,0 0,-10 M20,0 L0,20", true);
  var sex_link = go.Geometry.parse("M10,0 m-5,0 a0,0 1 0,0 0,10 a0,0 1 0,0 0,-10 F M6,5 m-1,0 a0,0 1 0,0 0,0.4 a0,0 1 0,0 0,-0.4", true);
  var sex_unknown = go.Geometry.parse("M10,0 L0,5 L10,10 L20,5 L10,0", true);
  var abortion = go.Geometry.parse("M10,10 m-5,0 a0,0 1 0,0 0,6 a0,0 1 0,0 0,-6 M5,0 L5,10", true);
  var nullipara = go.Geometry.parse("M0,1 L10,1 L10,2 L0,2 L0,1 M2,3 L8,3 L8,4 L2,4 L2,3 M0,10", true);
  myPalette.model = new go.GraphLinksModel([{
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: "Hexagon",
      tips: '正常女性'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: "Rectangle",
      tips: '正常男性'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: "Hexagon",
      tips: '女性患者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: "Rectangle",
      tips: '男性患者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      geometry: female_propositus,
      tips: '女性先证者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: 'Gate',
      geometry: male_propositus,
      tips: '男性先证者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      geometry: female_carrier,
      tips: '女性常染色体隐形基因携带者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: 'Gate',
      geometry: male_carrier,
      tips: '男性常染色体隐形基因携带者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      geometry: female_death_this,
      tips: '女性死于本病'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: 'Gate',
      geometry: male_death_this,
      tips: '男性死于本病'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      geometry: female_death_other,
      tips: '女性死于其他病'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: 'Gate',
      geometry: male_death_other,
      tips: '男性死于其他病'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      geometry: sex_link,
      tips: '性联锁隐形基因携带者'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: 'Gate',
      geometry: sex_unknown,
      tips: '性别不明正常人'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      geometry: abortion,
      tips: '流产'
    },
    {
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_full,
      color: color,
      figure: 'Gate',
      geometry: nullipara,
      tips: '婚后未生育'
    }
  ]);

  $(function () {
    // $("#paletteDraggable").draggable({
    //   handle: "#paletteDraggableHandle"
    // }).resizable({
    //   stop: function () {
    //     myPalette.layoutDiagram(true);
    //   }
    // });

    // $("#infoDraggable").draggable({
    //   handle: "#infoDraggableHandle"
    // });

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
  $('#pic').on('change', function () {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      myDiagram.add(
        GO(go.Part, 'Auto', {
            resizable: true,
            resizeObjectName: "PIC",
            rotatable: true,
            rotateObjectName: "PIC",
          },
          GO(go.Picture, this.result, {
            width: 200,
            height: 200,
            name: 'PIC'
          })
        )
      )
    }
  })
}