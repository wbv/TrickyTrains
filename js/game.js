var s = Snap("#svg");

// key-value objects which translate a color string to the needed colors.
// you could think of this as a theme, if you want.
var route_fill_color = {
    "red":   "#f00",
    "blue":  "#00f",
    "green": "#0f0",
    "gray":  "#666",
    "black": "#111"
}
var route_stroke_color = {
    "red":   "#555",
    "blue":  "#555",
    "green": "#555",
    "gray":  "#555",
    "black": "#ddd"
}
var route_fill_opacity = {
    "red":   0.75,
    "blue":  0.75,
    "green": 0.75,
    "gray":  0.50,
    "black": 0.75
}

function makeNode(name, x, y) {
    var newnode = s.circle(x, y, 10).attr({
        "id": name
    });

    newnode.hover(function () {
        newnode.animate({r:15}, 300);
    }, function () {
        newnode.animate({r:10}, 300);
    });

    return newnode;
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
    var s_x = parseFloat(node_start.attr("cx"));
    var s_y = parseFloat(node_start.attr("cy"));
    var e_x = parseFloat(node_end.attr("cx"));
    var e_y = parseFloat(node_end.attr("cy"));

    // by default, 0 degrees is "left". this makes 0 degrees = "right"
    var path_angle = Snap.angle(s_x, s_y, e_x, e_y) - 180;
    var block_length = Math.hypot((e_x - s_x), (e_y - s_y)) / weight;

    // this SVG "g" element will hold all the blocks
    var edge = s.g().attr({
        "id": node_start.attr("id") + node_end.attr("id")
    });

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
                "fill-opacity": route_fill_opacity[color],
                "strokeWidth": 1
            });
            block.transform("rotate("+path_angle+","+s_x+","+s_y+")");
            route.append(block);
        }

        return route;
    }

    if (colors.length == 2) {
        edge.append(makeRoute(3, colors[0]));
        edge.append(makeRoute(-3, colors[1]));
    } else if (colors.length == 1) {
        edge.append(makeRoute(0, colors[0]));
    } else {
        console.log("makeEdge: invalid array size of colors given\n");
    }

    return edge;
}

// Declaration of map elements
var nodes = [
    node_A = makeNode("A", 200, 100),
    node_B = makeNode("B", 300, 200),
    node_C = makeNode("C", 200, 300),
    node_D = makeNode("D", 100, 200),
    node_E = makeNode("E", 400, 400),
];
var edges = [
    edge_AB = makeEdge(node_A, node_B, 3, ["blue"]),
    edge_BE = makeEdge(node_B, node_E, 5, ["red"]),
    edge_BD = makeEdge(node_B, node_D, 4, ["gray"]),
    edge_CB = makeEdge(node_C, node_B, 3, ["black", "blue"]),
    edge_CE = makeEdge(node_C, node_E, 6, ["green"]),
    edge_AD = makeEdge(node_A, node_D, 4, ["gray", "gray"]),
];

// modify nodes to do things
nodes.forEach(function (n, index) {
    // rearranges the nodes to appear on top of the routes
    n.appendTo(s);
});
