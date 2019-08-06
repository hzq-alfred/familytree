import go from './../res/go.js'
import Inspector from './../res/DataInspetor'
import ResizeMultipleTool from './../res/ResizeMultipleTool'
export default function init() {
  var myDiagram, myPalette, myOverview;
  var GO = go.GraphObject.make;
  var brush = "#999";
  var fill_blank = "white";
  var fill_full = '#999'
  var color = '#999';
  // 右键面板
  var cxElement = document.getElementById("contextMenu");
  var myContextMenu = GO(go.HTMLInfo, {
    show: showContextMenu,
    mainElement: cxElement
  });
  cxElement.addEventListener("contextmenu", function (e) {
    $('.select').hide()
    e.preventDefault();
    return false;
  }, false);

  // 绘画板
  myDiagram =
    GO(go.Diagram, "myDiagramDiv", {
      resizingTool: new ResizeMultipleTool(),
      "undoManager.isEnabled": true,
    });

  //  预览小面板
  myOverview =
    GO(go.Overview, 'overview', // the HTML DIV element for the Overview
      {
        observed: myDiagram,
        contentAlignment: go.Spot.Center,
        'box.resizable': true,
        // 'resizingTool': new OverviewResizingTool()
      });
  // 图形连接点 
  function makePort(name, side) {
    return GO(go.Shape, "Rectangle", {
      fill: 'transparent',
      stroke: 'transparent',
      desiredSize: new go.Size(8, 8),
      alignment: side,
      alignmentFocus: side,
      portId: name,
      fromLinkable: true, //from方向 链接
      toLinkable: true, //to方向 链接
      fromLinkableDuplicates: true, //from方向 重复连线
      toLinkableDuplicates: true, // to方向 重复连线
      cursor: "pointer",
      margin: new go.Margin(-1, 0),
    });
  }
  //  图形文本
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
        contextMenu: myContextMenu,
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
        width: 8,
        height: 8,
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

  myDiagram.linkTemplate = GO("Link", {
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      resegmentable: true,
      routing: go.Link.Orthogonal,
      corner: 5,
    },
    GO("Shape", {
      stroke: '#555',
      strokeWidth: 2
    }),
  )
  myDiagram.linkTemplateMap.add("linkToLink",
    GO("Link", {
        relinkableFrom: true,
        relinkableTo: true
      },
      GO("Shape", {
        stroke: color,
        strokeWidth: 2
      }),
    ));
  myDiagram.model = GO(go.GraphLinksModel, {
    linkLabelKeysProperty: "labelKeys"
  });
  myDiagram.toolManager.linkingTool.archetypeLabelNodeData = {
    category: "LinkLabel"
  };
  myDiagram.model.linkFromPortIdProperty = 'fromPort';
  myDiagram.model.linkToPortIdProperty = 'toPort';

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
  var nodeModel = [{
      textTop: "",
      textBottom: "",
      textLeft: "",
      textRight: "",
      stroke: brush,
      fill: fill_blank,
      color: color,
      figure: "Hexagon",
      tips: '正常女性',
      // key:'female'
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
  ]

  myPalette = new go.Palette("myPaletteDiv");
  myPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;
  myPalette.model = new go.GraphLinksModel(nodeModel);

  $(function () {
    if (parent.$('#treeData').data('data')) {
      myDiagram.model = go.Model.fromJson(parent.$('#treeData').data('data'))
    }

    $("#infoDraggable").draggable({
      handle: "#infoDraggableHandle",
      containment: 'body'
    });

    $('.logic div').on('click', function () {
      let height = parseInt($('.menu').children().eq($(this).data('index') - 1).css('height')) ? 0 : 120;
      $('.menu').children().eq($(this).data('index') - 1).animate({
        height: height
      }).siblings().animate({
        height: 0
      })
      $(this).addClass('active').siblings().removeClass('active');
    })

    $('#infoDraggableHandle').on('dblclick', function () {
      $('#myInfo').toggle();
    })
    // image
    $('#image').on('click', function () {
      $('#pic').click()
    })

    $('#download').on('click', function () {
      console.log(myDiagram.model.toJson())
      return
      downloadFile($('#myDiagramDiv canvas')[0].toDataURL("image/png"), '家系图')
    })

    $('#text').on('click', function () {
      myDiagram.add(
        GO(go.Part, "Vertical", GO(go.TextBlock, {
          text: "a Text Block",
          font: "bold 12pt Helvetica, Arial, sans-serif",
          editable: true,
          margin: 2
        }), )
      )
    })

    $('#save').on('click', Export)

    $('.background div').on('click',function(){
      $('.select').show()
    })
    $('.select').on('click', function () {
      myDiagram.model.nodeDataArray.push({
        textTop: "",
        textBottom: "",
        textLeft: "",
        textRight: "",
        stroke: brush,
        fill: fill_blank,
        color: color,
        figure: "Hexagon",
        tips: '正常女性',
        loc: '100 ,100',
        key: -100,
      }, )
      myDiagram.model = go.Model.fromJson(myDiagram.model.toJson())
    })

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
              width: 320,
              height: 320,
              name: 'PIC',
              imageStretch: go.GraphObject.Uniform
            })
          )
        )
      }
    })
    if (!IsPC()) {
      $('#overview').hide()
      $('#infoDraggable').hide()
    }
    // 属性面板
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
        "loc": {
          show: false,
        },
      }
    });
  });



  function showContextMenu(obj, diagram, tool) {
    if (!obj) return
    cxElement.style.display = "block";
    cxElement.style.left = document.body.clientWidth / 2 - 150 + "px";
    cxElement.style.top = document.body.clientHeight / 2 - 100 + "px";
  }

  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
      "SymbianOS", "Windows Phone",
      "iPad", "iPod"
    ];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  function downloadFile(content, fileName) { //下载base64图片
    var base64ToBlob = function (code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;
      let uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {
        type: contentType
      });
    };
    let aLink = document.createElement('a');
    let blob = base64ToBlob(content); //new Blob([content]);
    let evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.click();
  };

  function Export() {
    let canvas = $('#myDiagramDiv').find('canvas')[0];
    let ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    var lOffset = canvas.width,
      rOffset = 0,
      tOffset = canvas.height,
      bOffset = 0
    for (var i = 0; i < canvas.width; i++) {
      for (var j = 0; j < canvas.height; j++) {
        var pos = (i + canvas.width * j) * 4
        if (imgData[pos] !== 255 || imgData[pos + 1] !== 255 || imgData[pos + 2] !== 255 || imgData[pos + 3] !== 255) {
          // 说第j行第i列的像素不是透明的
          bOffset = Math.max(j, bOffset) // 找到有色彩的最底部的纵坐标
          rOffset = Math.max(i, rOffset) // 找到有色彩的最右端
          tOffset = Math.min(j, tOffset) // 找到有色彩的最上端
          lOffset = Math.min(i, lOffset) // 找到有色彩的最左端
        }
      }
    }
    let oldUrl = canvas.toDataURL();
    let originImage = new Image()
    originImage.src = oldUrl;
    let canvas2 = document.createElement('canvas');
    // 报告智能的图片为正方形,为了图片不变形,统一取 高宽中最大值, 图片高宽下限为150;
    let wh = Math.max(rOffset - lOffset, bOffset - tOffset) > 130 ? Math.max(rOffset - lOffset, bOffset - tOffset) + 20 : 150;
    canvas2.width = canvas2.height = wh;
    let ctx2 = canvas2.getContext('2d');
    originImage.onload = function () {
      ctx2.drawImage(originImage, lOffset - 10, tOffset - 10, rOffset + 10, bOffset + 10, 0, 0, rOffset - lOffset + 20, bOffset - tOffset + 20);
      let binary = atob(canvas2.toDataURL("image/png").split(',')[1]);
      let array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      let filedata = new Blob([new Uint8Array(array)], {
        type: 'image/jpeg'
      })

      submitPic(filedata)
    }
  }

  function submitPic(fileData) {
    let form = new FormData();
    form.append("bizType", "9");
    let fileOfBlob = new File([fileData], new Date() + '.jpg'); // 重命名了
    form.append("file", fileOfBlob);
    form.append("file", fileData); // 不重命名
    $.ajax({
      type: 'post',
      data: form,
      contentType: false,
      processData: false,
      url: 'http://121.32.130.178:8896/api/FileService/UploadFile2?moduleTag=10&relativePath=FamilyFigure',
      success: function (data) {
        var index = parent.layer.getFrameIndex(window.name);
        parent.$('#treeData').data('data', myDiagram.model.toJson())
        parent.$('#treeData').data('guid', JSON.parse(data.data)[0].GUID)
        parent.$('#treeData').data('img', JSON.parse(data.data)[0].FilePath)
        parent.$('#treeImg')[0].src = JSON.parse(data.data)[0].FilePath
        parent.layer.close(index)
      }
    });
  }
}