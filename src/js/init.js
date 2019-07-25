import go from './../res/go.js'
import Inspector from './../res/DataInspetor'
var myDiagram, myPalette
export default function init() {

  var GO = go.GraphObject.make;

  myDiagram =
    GO(go.Diagram, "myDiagramDiv", {
      "undoManager.isEnabled": true
    });

  var fill1 = "rgb(105,210,231)"
  var brush1 = "rgb(65,180,181)";

  var fill2 = "rgb(167,219,216)"
  var brush2 = "rgb(127,179,176)";

  var fill3 = "rgb(224,228,204)"
  var brush3 = "rgb(184,188,164)";

  var fill4 = "rgb(243,134,48)"
  var brush4 = "rgb(203,84,08)";

  function makePort(name, side) {
    return GO(go.Shape, "Rectangle", {
      fill: 'red', // not seen, by default; set to a translucent gray by showSmallPorts, defined below
      stroke: null,
      desiredSize: new go.Size(8, 8),
      alignment: side, // align the port on the main Shape
      alignmentFocus: side, // just inside the Shape
      portId: name, // declare this object to be a "port"
      fromSpot: side,
      toSpot: side, // declare where links may connect at this port
      fromLinkable: true,
      toLinkable: true, // declare whether the user may draw links to/from here
      cursor: "pointer", // show a different cursor to indicate potential link point
      margin: new go.Margin(-1, 0),
      mouseLeave: function (e, node) {
        node.fill = 'red'
      },
      mouseEnter: function (e, node) {
        node.fill = 'red'
      },
    });
  }

  myDiagram.nodeTemplateMap.add("",
    GO(go.Node, "Auto", {
        locationSpot: go.Spot.Center
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      GO(go.Shape, "Ellipse", {
          strokeWidth: 2,
          fill: fill1,
          name: "SHAPE",
        },
        new go.Binding("figure", "figure"),
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
          name: "TEXT"
        },
        new go.Binding("text", "text").makeTwoWay()
      ),
      makePort("t", go.Spot.Top),
      makePort("b", go.Spot.Bottom)
    )
  );

  myDiagram.addDiagramListener("ChangedSelection", function (diagramEvent) {
    var idrag = document.getElementById("infoDraggable");
    idrag.style.width = "";
    idrag.style.height = "";
  });

  myPalette = new go.Palette("myPaletteDiv");
  myPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;
  myDiagram.linkTemplate = GO(go.Link, {
      curve: go.Link.JumpGap ,
      relinkableFrom: true,
      relinkableTo: true
      // corner :0,
      // adjusting:go.Link.End
      // points: [1, 2, 3, 4, 5, 6],
      // resegmentable :true
    },
    new go.Binding("points").makeTwoWay(),
    GO(go.Shape, {
      stroke: 'black',
      strokeWidth: 1
    }),
  )
  myPalette.model = new go.GraphLinksModel([{
      text: "Lake",
      fill: fill1,
      stroke: brush1,
      figure: "Hexagon"
    },
    {
      text: "Ocean",
      fill: fill2,
      stroke: brush2,
      figure: "Rectangle"
    },
    {
      text: "Sand",
      fill: fill3,
      stroke: brush3,
      figure: "Diamond"
    },
    {
      text: "Goldfish",
      fill: fill4,
      stroke: brush4,
      figure: "Octagon"
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
        "figure": {
          show: false,
        }
      }
    });
  });
 $('#btn').on('click', function () {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
  })

}