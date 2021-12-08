function loadDemo1(){
  data = data1;
  init();
}

function loadDemo2(){
  data = data2;
  init();
}

document.getElementById('inputfile')
            .addEventListener('change', function() {
              
            var fr=new FileReader();
            fr.onload=function(){
                console.log(fr.result);
                data = JSON.parse(fr.result);
                init();
            }
              
            fr.readAsText(this.files[0]);
        })

var diagram;
function init(){
if(diagram) {
  diagram.div = null;
  diagram.div = null;
}
var $ = go.GraphObject.make;  // for conciseness in defining templates

diagram = $(go.Diagram, "myDiagramDiv",  // Diagram refers to its DIV HTML element by id
  {
    layout: $(go.TreeLayout,  // the layout for the entire diagram
      {
        angle: 90,
        arrangement: go.TreeLayout.ArrangementHorizontal,
        isRealtime: false
      })
  });


diagram.nodeTemplate =
  $(go.Node, "Auto",
    { // when the user clicks on a Node, highlight all Links coming out of the node
      // and all of the Nodes at the other ends of those Links.
      click: function (e, node) {
        // highlight all Links and Nodes coming out of a given Node
        var diagram = node.diagram;
        diagram.startTransaction("highlight");
        // remove any previous highlighting
        diagram.clearHighlighteds();
        // for each Link coming out of the Node, set Link.isHighlighted
        node.findLinksOutOf().each(function (l) { l.isHighlighted = true; });
        // for each Node destination for the Node, set Node.isHighlighted
        node.findNodesOutOf().each(function (n) { n.isHighlighted = true; });
        diagram.commitTransaction("highlight");
      },
      toolTip:  // define a tooltip for each node that displays the color as text
        $("ToolTip",
          $(go.TextBlock, { margin: 4 },
            new go.Binding("text", "uniqueName"))
        )  // end ov
    },
    $(go.Shape, "RoundedRectangle",
      { fill: "white" },
      new go.Binding("fill", "color"),  // shape.fill = data.color
    ),

    $(go.Panel, "Table",
      { defaultAlignment: go.Spot.Center, margin: 4 },
      $(go.RowColumnDefinition, { column: 1, width: 4 }),
      $(go.TextBlock,
        { row: 0, column: 0, columnSpan: 3, alignment: go.Spot.Center },
        { font: "bold 12pt sans-serif" },
        new go.Binding("text", "text")),
      $(go.TextBlock, new go.Binding("text", "name"),
        { row: 1, column: 0 })
    )

    //  $(go.TextBlock,
    //   { row: 0 },
    //   new go.Binding("text", "text")),  // textblock.text = data.key

    // $(go.TextBlock,
    //   { background: "lightgray", margin: 16 },
    //   new go.Binding("text", "name"))
  );

diagram.linkTemplate =
  $(go.Link,
    { toShortLength: 4, curve: go.Link.Bezier },
    $(go.Shape,
      // the Shape.stroke color depends on whether Link.isHighlighted is true
      new go.Binding("stroke", "isHighlighted", function (h) {return h ? "green" : "black"; })
        .ofObject(),
      // the Shape.strokeWidth depends on whether Link.isHighlighted is true
      new go.Binding("strokeWidth", "isHighlighted", function (h) { return h ? 3 : 1; })
        .ofObject()),
    $(go.Shape,
      {
        toArrow: "Standard",
        strokeWidth: 0
      },
      // // the Shape.fill color depends on whether Link.isHighlighted is true
      new go.Binding("fill", "isHighlighted", function (h) { return h ? "green" : "black"; })
        .ofObject()
      ),
  );

  diagram.linkTemplateMap.add('outboundLink',
      $(go.Link,
        {
          adjusting: go.Link.End,
          curve: go.Link.Bezier
        },
        $(go.Shape,// the link path shape
          { isPanelMain: true, strokeWidth: 1, stroke:"#00897b" }), {
          selectionAdornmentTemplate:
            $(go.Adornment,
              $(go.Shape,
                { isPanelMain: true, stroke: 'dodgerblue', strokeWidth: 1 })
            ) 
        }
      ));

var nodeDataArray = [
  // { key: "Alpha" },
  // { key: "Beta", group: "Omega" },
  // { key: "Gamma", group: "Omega" },
  // { key: "Omega", isGroup: true },
  // { key: "Delta" }
];

var linkDataArray = [
  // { from: "Alpha", to: "Beta" },  // from outside the Group to inside it
  // { from: "Beta", to: "Gamma" },  // this link is a member of the Group
  // { from: "Omega", to: "Delta" }  // from the Group to a Node
];

data.groups.forEach(group => {
  nodeDataArray.push({
    key: "group_" + group.id,
    text: group.class,
    isGroup: true
  });

  group.nodes.forEach(node => {
    var nodeId = "group_" + group.id + "node_" + node.id;
    nodeDataArray.push({
      key: nodeId,
      text: node.class,
      name: !node.name ? '' : node.name,
      group: "group_" + group.id,
      uniqueName: node.uniqueName ? node.uniqueName : !node.name ? node.class : node.name,
      fill: "green"
    });

    if (node.children) {
      node.children.forEach(child => {
        linkDataArray.push({
          from: nodeId,
          to: "group_" + child[0] + "node_" + child[1]
        });
      });
    }

    if (node.outboundConnections) {
      node.outboundConnections.forEach(outboundConnection => {
        if (Array.isArray(outboundConnection)) {
          linkDataArray.push({
            from: nodeId,
            to: "group_" + outboundConnection[0][0] + "node_" + outboundConnection[0][1],
            category: "outboundLink"
          });
        }
      });
    }

  });

});
diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

}

init();