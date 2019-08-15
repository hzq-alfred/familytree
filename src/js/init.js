import go from './../res/go.js'
import Inspector from './../res/DataInspetor'
import ResizeMultipleTool from './../res/ResizeMultipleTool'
import GuidedDraggingTool from './../res/GuidedDraggingTool'
export default function init() {
  var myDiagram, myPalette, myOverview;
  var GO = go.GraphObject.make;
  var brush = "black";
  var fill_blank = "white";
  var fill_full = 'black'
  var color = 'black';
  let selectPos = {};
  let keynum = -500;
  var submitflag = false;
  // 右键面板
  var cxElement = document.getElementById("contextMenu");
  var myContextMenu = GO(go.HTMLInfo, {
    show: showContextMenu,
    mainElement: cxElement
  });
  cxElement.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  }, false);

  // 绘画板
  myDiagram =
    GO(go.Diagram, "myDiagramDiv", {
      "undoManager.isEnabled": true,
      resizingTool: new ResizeMultipleTool(),
      draggingTool: new GuidedDraggingTool(),
      "draggingTool.horizontalGuidelineColor": "blue",
      "draggingTool.verticalGuidelineColor": "blue",
      "draggingTool.centerGuidelineColor": "green",
      "draggingTool.guidelineWidth": 1,
    });
  // myDiagram.layout=GO(go.TreeLayout)
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
  function makePort(name, align) {
    return GO(go.Shape, {
      fill: "transparent",
      strokeWidth: 0,
      width: 8,
      height: 8,
      alignment: align,
      portId: name,
      fromSpot: align,
      fromLinkable: true,
      toSpot: align,
      toLinkable: true,
      fromLinkableDuplicates: true, //from方向 重复连线
      toLinkableDuplicates: true, // to方向 重复连线
      cursor: "pointer",
      margin: new go.Margin(8, 4)
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
        font: "bold 22pt Helvetica, Arial, sans-serif",
        name: "TEXT",
        row: row,
        column: col,
      },
      new go.Binding("stroke", "color"),
      new go.Binding("text", textType).makeTwoWay()
    )
  }
  const makeNodeResizeShapeOption = (cursor, alignment) => ({
    cursor,
    alignment,
    desiredSize: new go.Size(4, 4),
    fill: '#764ba2',
    stroke: '#764ba2'
  })

  const nodeResizeAdornmentTemplate =
    // [1]
    GO(go.Adornment, go.Panel.Spot,
      GO(go.Placeholder),
      // [2]
      GO(go.Shape, makeNodeResizeShapeOption('nw-resize', go.Spot.TopLeft)),
      GO(go.Shape, makeNodeResizeShapeOption('ne-resize', go.Spot.TopRight)),
      GO(go.Shape, makeNodeResizeShapeOption('se-resize', go.Spot.BottomLeft)),
      GO(go.Shape, makeNodeResizeShapeOption('sw-resize', go.Spot.BottomRight))
    )

  myDiagram.nodeTemplateMap.add("",
    GO(go.Node, "Spot", {
        resizable: true,
        resizeObjectName: "SHAPE",
        resizeCellSize: new go.Size(9, 9),
        scale: 0.6,
        name: 'resizeNode',
        resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
        layerName: 'Foreground',
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
      GO(go.Shape, "Ellipse", {
          strokeWidth: 2,
          width: 60,
          height: 60,
          fill: 'white',
          name: "SHAPE",
          areaBackground: 'white',
        },
        new go.Binding("figure", "figure"),
        new go.Binding("geometry", "geometry"),
        new go.Binding("fill", "fill"),
        new go.Binding("stroke", "stroke"),
      ),
      makePort("r", go.Spot.Right),
      makePort("tr", new go.Spot(1, 0.25)),
      makePort("t", go.Spot.Top),
      makePort("l", go.Spot.Left),
      makePort("tl", new go.Spot(0, 0.25)),
      makePort("b", go.Spot.Bottom), {
        toolTip: GO("ToolTip",
          GO(go.TextBlock, {
              margin: 4
            },
            new go.Binding("text", "tips"))
        )
      },
    )
  );

  myDiagram.nodeTemplateMap.add("LinkLabel",
    GO("Node", {
        selectable: false,
        avoidable: false,
        layerName: "Foreground"
      },
      GO("Shape", {
        width: 1,
        height: 1,
        stroke: 'transparent',
        fill: 'transparent',
        portId: " ",
        fromLinkable: true,
        toLinkable: true,
        toSpot: go.Spot.Bottom,
        fromSpot: go.Spot.Bottom,
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
      layerName: 'Background',
    },
    GO("Shape", {
      stroke: 'black',
      isPanelMain: true,
      strokeWidth: 1,
    }),
  )
  myDiagram.linkTemplateMap.add("linkToLink",
    GO("Link", {
        relinkableFrom: true,
        relinkableTo: true,
      },
      GO("Shape", {
        stroke: color,
        strokeWidth: 1
      }),
    ));

  var male_propositus = go.Geometry.parse("M10,0 L10,10 L25,10 L25,0 L10,0 X M4.6,15 L9,12 L8.2,16.2 L4.6,15 X M6.6,15.6 L3.6,19.6", true);
  var female_propositus = go.Geometry.parse("M13,6 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 X M5.5,15 L9,12 L8,16.2 L5.5,15 X M7,15.6 L4.7,19.6", true);
  var male_carrier = go.Geometry.parse("M0,0 L5,0 L5,10 L0,10 L0,0 M5,0 L10,0 M10,10 L10,0 M5,10 L10,10", true);
  var female_carrier = go.Geometry.parse("F M10,0 m-5,0 a0,0 1 0,0 0,10 M5,0 L5,10 X M10,10 m-5,0 a0,0 1 0,0 0,-10", false);
  var male_death_this = go.Geometry.parse("M3,3 L8,3 L8,8 L3,8 L3,3 M11,0 L0,11", true);
  var female_death_this = go.Geometry.parse("M15,6 m-5,0 a0,0 1 0,0 0,10 a0,0 1 0,0 0,-10 M20,0 L0,20", true);
  var male_death_other = go.Geometry.parse("M3,3 L8,3 L8,8 L3,8 L3,3 M11,0 L0,11", true);
  var female_death_other = go.Geometry.parse("M15,6 m-5,0 a0,0 1 0,0 0,10 a0,0 1 0,0 0,-10 M20,0 L0,20", true);
  var male_link = go.Geometry.parse("M0,0 L10,0 L10,10 L0,10 L0,0  X M6,4.5 m-1,0 a0,0 1 0,0 0,1.2 a0,0 1 0,0 0,-1.2 F ", false);
  var female_link = go.Geometry.parse("M10,0 m-5,0 a0,0 1 0,0 0,10 a0,0 1 0,0 0,-10  X M6,4.5 m-1,0 a0,0 1 0,0 0,1.2 a0,0 1 0,0 0,-1.2 F ", false);
  var sex_unknown = go.Geometry.parse("M10,0 L0,5 L10,10 L20,5 L10,0", true);
  var abortion = go.Geometry.parse("M10,10 m-5,0 a0,0 1 0,0 0,6 a0,0 1 0,0 0,-6 M5,0 L5,10", true);
  var nullipara = go.Geometry.parse("M0,1 L10,1 L10,2 L0,2 L0,1 M2,3 L8,3 L8,4 L2,4 L2,3 M0,10", true);
  var nodeModel = [{
      stroke: brush,
      fill: fill_blank,
      figure: "Circle",
      tips: '正常女性',
    },
    {
      stroke: brush,
      fill: fill_blank,
      figure: "Square",
      tips: '正常男性'
    },
    {
      stroke: brush,
      fill: fill_full,
      figure: "Circle",
      tips: '女性患者'
    },
    {
      stroke: brush,
      fill: fill_full,
      figure: "Square",
      tips: '男性患者'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: female_propositus,
      tips: '女性先证者'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: male_propositus,
      tips: '男性先证者'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: female_carrier,
      tips: '女性常染色体隐形基因携带者'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: male_carrier,
      tips: '男性常染色体隐形基因携带者'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: female_death_this,
      tips: '女性死于本病'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: male_death_this,
      tips: '男性死于本病'
    },
    {
      stroke: brush,
      fill: fill_blank,
      geometry: female_death_other,
      tips: '女性死于其他病'
    },
    {
      stroke: brush,
      fill: fill_blank,
      geometry: male_death_other,
      tips: '男性死于其他病'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: female_link,
      tips: '女性性联锁隐形基因携带者'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: male_link,
      tips: '男性性联锁隐形基因携带者'
    },
    {
      stroke: brush,
      fill: fill_blank,
      geometry: sex_unknown,
      tips: '性别不明正常人'
    },
    {

      stroke: brush,
      fill: fill_full,
      geometry: abortion,
      tips: '流产'
    },
    {
      stroke: brush,
      fill: fill_full,
      geometry: nullipara,
      tips: '婚后未生育'
    }
  ]
  // 拖拽面板
  myPalette = new go.Palette("myPaletteDiv");
  myPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;
  myPalette.model = new go.GraphLinksModel(nodeModel);

  $(function () {
    if (parent.$('#treeData').data('data')) {
      myDiagram.model = go.Model.fromJson(parent.$('#treeData').data('data'))
    }
    myDiagram.model = GO(go.GraphLinksModel, {
      linkLabelKeysProperty: "labelKeys"
    });
    myDiagram.model.linkFromPortIdProperty = 'fromPort';
    myDiagram.model.linkToPortIdProperty = 'toPort';
    myDiagram.toolManager.linkingTool.archetypeLabelNodeData = {
      category: "LinkLabel"
    };

    $("#infoDraggable").draggable({
      handle: "#infoDraggableHandle",
      containment: 'body'
    });

    $('.logic div').on('click', function () {
      let height = parseInt($('.menu').children().eq($(this).data('index') - 1).css('height')) ? 0 : 70;
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

    $('#image').on('click', function () {
      $('#pic').click()
    })

    $('#download').on('click', function () {
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

    $('.background div').on('click', function () {
      $('.select').fadeOut('slow')
      setTimeout(() => {
        $('.select').fadeIn("slow")
      }, 100);
    })

    $('#parent').on('click', function () {
      selectPos.choice = 'parent'
    })

    $('#spouse').on('click', function () {
      selectPos.choice = 'spouse'
    })

    $('#children').on('click', function () {
      selectPos.choice = 'children'
    })
    myDiagram.addModelChangedListener(function (evt) {
      //过滤非isTransactionFinished的事件
      if (!evt.isTransactionFinished) return;
      var txn = evt.object;
      if (txn === null) return;
      // 循环所有事件变化
      txn.changes.each(function (e) {
        //过滤 非nodeDataArray 变化
        if (e.modelChange !== "nodeDataArray") return;
        if (e.change === go.ChangedEvent.Insert) {
          console.log(evt.propertyName + " added node with key: " + e.newValue.key);
        } else if (e.change === go.ChangedEvent.Remove) {
          // 过滤连线节点的变化(只关注 图形节点的变化)
          if (!e.oldValue.category) {
            // 被删除的节点 key
            let key = e.oldValue.key;
            let index;
            let parentobj, parentflag;
            let childrenobj, childrenflag;
            // 循环node节点数组
            // 删除节点时 需要把有相关关系一同删除
            myDiagram.model.nodeDataArray.map(item => {
              if (item.parent) {
                // 循环节点 parent关系
                item.parent.map((it, id) => {
                  // 若 节点parent中 有 删除节点的key
                  if (it === key) {
                    parentobj = item;
                    index = id;
                    parentflag = true;
                  }
                })
                if (parentflag) item.parent.splice(index, 1);
              }
              if (item.spouse) {
                if (item.spouse[0] === key) item.spouse = null
              }
              if (item.children) {
                item.children.map((it, id) => {
                  if (it === key) {
                    childrenobj = item;
                    index = id;
                    childrenflag = true;
                  }
                })
                if (childrenflag) {
                  if (item.children.length == 1) {
                    item.children = null
                  } else {
                    item.children.splice(index, 1)
                  }
                }
              }
            })
            if (parentobj) {
              myDiagram.model.linkDataArray.push({
                to: parentobj.parent[0],
                toPort: 'b',
                from: parentobj.key,
                fromPort: 't',
                labelKeys: [--keynum]
              })
            }
            // 若模板只剩下线的连接点,清空节点数组
            let onlyLinkable = myDiagram.model.nodeDataArray.every((item) => {
              return item.category
            })
            if (onlyLinkable) {
              myDiagram.model.nodeDataArray = []
            }
            myDiagram.model = go.Model.fromJson(myDiagram.model.toJson());
          } else {
            console.log('old', e.oldValue)
          }
        }
      });
    });
    $('.select').on('click', function () {
      $('.select').hide();
      let choosen = nodeModel[$(this).data('index') - 1]
      let node = {}; //生成节点
      for (let i in choosen) {
        if (choosen.hasOwnProperty(i)) {
          if (i !== ('parent' || 'spouse' || 'children' || 'sblings')) node[i] = choosen[i]
        }
      }

      let model = myDiagram.model;
      let select = model.nodeDataArray.filter((item) => {
        return item.key == selectPos.key
      })[0]; //选中节点
      let link = model.linkDataArray.filter((item) => {
        return item.from == selectPos.key || item.to == selectPos.key
      }) //节点对应 连接线段
      if (selectPos.choice == 'parent') {
        if (!select.parent || select.parent.length == 0) {
          node.loc = `${selectPos.x-75} ${selectPos.y-120}`;
          node.key = --keynum;
          model.nodeDataArray.push(node);
          model.nodeDataArray.push({
            category: "LinkLabel",
            key: --keynum
          })
          model.linkDataArray.push({
            to: node.key,
            toPort: 'b',
            from: selectPos.key,
            fromPort: 't',
            labelKeys: [keynum]
          })
          select.parent = [node.key];
          node.children = [select.key]
        } else if (select.parent.length == 1) {
          // 设定 节点key
          let toPort, fromPort
          let firstParentKey = select.parent[0];
          let firstParent = model.nodeDataArray.find((item) => {
            return item.key === firstParentKey
          })
          node.key = --keynum;

          node.spouse = [firstParentKey]

          model.nodeDataArray.map(item => {
            if (item.key == firstParentKey) {
              item.spouse = [node.key]
              if (item.loc.split(' ')[0] - select.loc.split(' ')[0] < 0) {
                node.loc = `${selectPos.x+75} ${selectPos.y-120}`;
                toPort = 'l';
                fromPort = 'r';
              } else {
                node.loc = `${selectPos.x-75} ${selectPos.y-120}`;
                toPort = 'r';
                fromPort = 'l';
              }
            }
          })
          model.nodeDataArray.push(node);
          model.nodeDataArray.push({
            category: "LinkLabel",
            key: --keynum
          })
          model.linkDataArray.push({
            to: node.key,
            toPort: toPort,
            from: firstParentKey,
            fromPort: fromPort,
            labelKeys: [keynum]
          })
          let allChildrenKey = firstParent.children;
          // 对应子女的连线对象
          let linkarr = [];
          for (let key of allChildrenKey) {
            let i = model.linkDataArray.filter(item => {
              return (item.from == key && item.fromPort == 't') || (item.to == key && item.toPort == 't')
            })
            linkarr.push(i)
            let [k] = model.nodeDataArray.filter(item => {
              return item.key == key
            })
            k.parent.push(node.key)
          }
          // 数组扁平化:二维转一维
          linkarr = linkarr.reduce((arr, cur) => {
            return arr.concat(cur)
          }, [])
          // 当前 父母之间的连线点 key
          let cur = keynum;
          for (let i of linkarr) {
            let index = model.linkDataArray.findIndex((item) => {
              return item === i
            })
            model.linkDataArray.splice(index, 1)

            model.linkDataArray.push({
              to: cur,
              toPort: ' ',
              from: i.from,
              fromPort: 't',
              labelKeys: --keynum
            })
          }
          node.children = allChildrenKey
        } else {
          alert('业务判断错误:父母不超2个')
        }
      } else if (selectPos.choice == 'spouse') {
        if (select.spouse) {
          alert('业务判断错误:夫妻不超1个')
        } else {
          node.loc = `${selectPos.x+150} ${selectPos.y}`;
          node.key = --keynum;
          model.nodeDataArray.push(node);
          model.nodeDataArray.push({
            category: "LinkLabel",
            key: --keynum
          })
          model.linkDataArray.push({
            to: node.key,
            toPort: 'l',
            from: selectPos.key,
            fromPort: 'r',
            labelKeys: [keynum]
          })
          node.spouse = [selectPos.key]
          select.spouse = [node.key]
          if (select.children) {
            let linkarr = [];
            for (let key of select.children) {
              let i = model.linkDataArray.filter(item => {
                return (item.from == key && item.fromPort == 't') || (item.to == key && item.toPort == 't')
              })
              linkarr.push(i)
              let [k] = model.nodeDataArray.filter(item => {
                return item.key == key
              })
              k.parent.push(node.key)
            }
            linkarr = linkarr.reduce((arr, cur) => {
              return arr.concat(cur)
            }, [])
            let cur = keynum;
            for (let i of linkarr) {
              let index = model.linkDataArray.findIndex((item) => {
                return item === i
              })
              model.linkDataArray.splice(index, 1)

              model.linkDataArray.push({
                to: cur,
                toPort: ' ',
                from: i.from,
                fromPort: 't',
                labelKeys: --keynum
              })
            }

            node.children = select.children
          }
        }
      } else if (selectPos.choice == 'children') {
        let spouseobj;
        if (select.spouse) {
          [spouseobj] = model.nodeDataArray.filter(item => {
            if (item.key == select.spouse[0]) return true;
          })
        }
        if (!select.children || select.children.length == 0) {
          node.loc = `${selectPos.x -75 } ${selectPos.y+120}`;
          node.key = --keynum;
          model.nodeDataArray.push(node);
          model.nodeDataArray.push({
            category: "LinkLabel",
            key: --keynum
          })
          if (!select.spouse) {
            model.linkDataArray.push({
              to: selectPos.key,
              toPort: 'b',
              from: node.key,
              fromPort: 't',
              labelKeys: [keynum]
            })
            node.parent = [select.key]
          } else {
            let linkable = model.linkDataArray.filter(item => {
              if ((item.to == select.key && item.from == select.spouse[0]) || (item.from == select.key && item.to == select.spouse[0])) return true;
            })
            model.linkDataArray.push({
              to: node.key,
              toPort: 't',
              from: linkable[0].labelKeys[0],
              fromPort: ' ',
              labelKeys: [keynum]
            })
            node.parent = [select.key, select.spouse[0]]
            spouseobj.children = [node.key]
          }
          select.children = [node.key];

        } else {
          let length = select.children.length;
          let firstChild = model.nodeDataArray.find(item => {
            return item.key == select.children[0]
          })
          let [x, y] = firstChild.loc.split(' ')

          node.loc = `${ +x +(200*length)} ${+y}`;
          node.key = --keynum;
          model.nodeDataArray.push(node);
          model.nodeDataArray.push({
            category: "LinkLabel",
            key: --keynum
          })

          if (!select.spouse) {
            model.linkDataArray.push({
              to: selectPos.key,
              toPort: 'b',
              from: node.key,
              fromPort: 't',
              labelKeys: [keynum]
            })
            node.parent = [select.key]
          } else {
            let linkable = model.linkDataArray.filter(item => {
              if ((item.to == select.key && item.from == select.spouse[0]) || (item.from == select.key && item.to == select.spouse[0])) return true;
            })
            model.linkDataArray.push({
              to: node.key,
              toPort: 't',
              from: linkable[0].labelKeys[0],
              fromPort: ' ',
              labelKeys: [keynum]
            })
            node.parent = [select.key, select.spouse[0]]
            spouseobj.children.push(node.key)
          }
          select.children.push(node.key);
        }
      }
      myDiagram.model = go.Model.fromJson(myDiagram.model.toJson());

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
      multipleSelection: true,
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
          type: 'color',
          show: false,
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
    selectPos.x = obj.position.x;
    selectPos.y = obj.position.y;
    selectPos.key = obj.key;
    if (!obj) return
    $('.select').hide()
    cxElement.style.display = "block";
    cxElement.style.left = Math.abs(diagram.position.x - obj.position.x) - 100 + 'px';
    cxElement.style.top = Math.abs(diagram.position.y - obj.position.y) + 50 >= 80 ? Math.abs(diagram.position.y - obj.position.y) + 50 + 'px' : '80px';
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
    if (!submitflag) {
      submitflag = true;
      $.ajax({
        type: 'post',
        data: form,
        contentType: false,
        processData: false,
        url: 'http://121.32.130.178:8896/api/FileService/UploadFile2?moduleTag=10&relativePath=FamilyFigure',
        success: function (data) {
          submitflag = false;
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
}