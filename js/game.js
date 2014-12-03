var s = Snap(800,600);

// key-value objects which translate a color string to the needed colors.
// you could think of this as a theme, if you want.
var route_fill_color = {
    "red":   "#f00",
    "blue":  "#00f",
    "green": "#0f0",
    "gray":  "#666",
    "black": "#111",
}
var route_stroke_color = {
    "red":   "#555",
    "blue":  "#555",
    "green": "#555",
    "gray":  "#555",
    "black": "#555",
}
var route_empty_opacity = {
    "red":   0.35,
    "blue":  0.35,
    "green": 0.35,
    "gray":  0.20,
    "black": 0.35,
}
var route_filled_opacity = {
    "red":   0.95,
    "blue":  0.95,
    "green": 0.95,
    "gray":  0.95,
    "black": 0.95,
}

//* makeNode()
// a Node in this context refers to a location on the game map. This function
// creates a circle and a text label at the given coordinates. The text label
// (the object returned by the Snap.text method) can be accessed by the the
// makeNode-returned object's attribute of "label" (e.g. Node_A.label). The
// optional offset arguments can place the label anywhere around the node
function makeNode(name, x, y, label_x_offset, label_y_offset) {
    // label_x_offset and label_y_offset are optional arguments here,
    // the numbers on the far right are default values if they are undefined
    label_x_offset = label_x_offset || 10;
    label_y_offset = label_y_offset || -10;

    var container = s.g().attr({
        "id": name
    });
    container.id = name;

    var newnode = s.circle(x, y, 8);

    // create hover-behavior animation
    newnode.hover(function () {
        newnode.animate({r:10}, 300);
    }, function () {
        newnode.animate({r:8}, 300);
    });

    // create the text label for your location
    newnode.label = s.text(x + label_x_offset, y + label_y_offset, name);
    newnode.label.attr({
        "font-weight": "bold"
    });

    // put the circle and text (label) inside the g element
    container.append(newnode);
    container.append(newnode.label);

    // define an attribute to make it easy to look at the node's circle
    container.point = newnode;

    // define an attribute for an Array of neighboring nodes.
    // this is populated when creating an edge between location nodes
    container.neighbors = [];

    // define an attribute for an Array of connecting paths
    // this is populated when creating an edge between location nodes
    container.paths = [];

    return container;
}

//* makeEdge()
// creates an edge between two nodes, given the nodes, the number of blocks,
// and colors, which is either a one-element or two-element array.
// if two-element, then two routes are created parallel to each other in place
// of one, and each is given its corresponding color. Otherwise, one route is
// placed in between the nodes, with its corresponding color.
//
// an edge consists of a g element, containing one or two g-elements, each of
// which contains all the 'rect's which are the drawn blocks.
function makeEdge(node_start, node_end, weight, colors) {
    // x & y coordinates of start & end nodes
    var s_x = parseFloat(node_start.point.attr("cx"));
    var s_y = parseFloat(node_start.point.attr("cy"));
    var e_x = parseFloat(node_end.point.attr("cx"));
    var e_y = parseFloat(node_end.point.attr("cy"));

    // by default, 0 degrees is "left".
    // subtract by 180 degrees to make 0 degrees = "right"
    var path_angle = Snap.angle(s_x, s_y, e_x, e_y) - 180;
    var block_length = Math.hypot((e_x - s_x), (e_y - s_y)) / weight;

    // this SVG "g" element will hold all the blocks
    var edge = s.g().attr({
        "id": node_start.attr("id") + node_end.attr("id")
    });
    edge.id = node_start.id + node_end.id;

    // helper function to draw the individual blocks of a single color
    function makeRoute(offset, color) {
        var route = s.g();

        for (var i = 0; i < weight; i++) {
            var block = s.rect(s_x + (i * block_length),
                               s_y - 3 + offset,
                               block_length,
                               6,
                               2);
            block.attr({
                "stroke":       route_stroke_color[color],
                "fill":         route_fill_color[color],
                "fill-opacity": route_empty_opacity[color],
                "strokeWidth": 1
            });
            block.transform("rotate("+path_angle+","+s_x+","+s_y+")");
            route.append(block);
        }

        return route;
    }

    // create the appropriate number of paths
    if (colors.length == 2) {
        edge.append(makeRoute(3, colors[0]));
        edge.append(makeRoute(-3, colors[1]));
    } else if (colors.length == 1) {
        edge.append(makeRoute(0, colors[0]));
    } else {
        console.log("makeEdge: invalid array size of colors given\n");
    }

    // add the appropriate neighbor node to each node
    node_start.neighbors.push(node_end);
    node_end.neighbors.push(node_start);

    // add this path to each node
    node_start.paths.push(edge);
    node_end.paths.push(edge);

    return edge;
}

// Declaration of map elements
var nodes = [
    node_A = makeNode("A", 200, 100),
    node_B = makeNode("B", 300, 200),
    node_C = makeNode("C", 200, 300, -20), // put label off to the left
    node_D = makeNode("D", 100, 200, -20), // ^
    node_E = makeNode("E", 400, 400),
    node_F = makeNode("F", 330, 77),
];
var edges = [
    edge_AB = makeEdge(node_A, node_B, 3, ["blue"]),
    edge_BE = makeEdge(node_B, node_E, 5, ["red"]),
    edge_BD = makeEdge(node_B, node_D, 4, ["gray"]),
    edge_CB = makeEdge(node_C, node_B, 3, ["black", "blue"]),
    edge_CE = makeEdge(node_C, node_E, 6, ["green"]),
    edge_AD = makeEdge(node_A, node_D, 4, ["gray", "gray"]),
    edge_AF = makeEdge(node_A, node_F, 4, ["red"]),
    edge_EF = makeEdge(node_E, node_F, 7, ["gray"]),
];

// modify nodes to do things
nodes.forEach(function (n, index) {
    // rearranges the nodes to appear on top of the routes
    n.appendTo(s);
});
