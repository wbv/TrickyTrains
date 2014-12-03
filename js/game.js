var s = Snap(800,600);

// key-value objects which translate a color string to the needed colors.
// you could think of this as a theme, if you want.
var path_fill_color = {
    "red":   "#f00",
    "blue":  "#00f",
    "green": "#0f0",
    "gray":  "#666",
    "black": "#111",
};
var path_stroke_color = {
    "red":   "#555",
    "blue":  "#555",
    "green": "#555",
    "gray":  "#555",
    "black": "#555",
};
var path_empty_opacity = {
    "red":   0.35,
    "blue":  0.35,
    "green": 0.35,
    "gray":  0.20,
    "black": 0.35,
};
var path_filled_opacity = {
    "red":   0.95,
    "blue":  0.95,
    "green": 0.95,
    "gray":  0.95,
    "black": 0.95,
};

var location_color = {
    "normal": "#000",
    "selected": "#ddd",
    "suggested": "#000",
};

//* makeLocation()
// creates a circle and a text label at the given coordinates. The text label
// (the object returned by the Snap.text method) can be accessed by the the
// makeLocation-returned object's attribute of "label" (e.g. location_A.label).
// The optional offset arguments can place the label anywhere around the
// location
function makeLocation(name, x, y, label_x_offset, label_y_offset) {
    // label_x_offset and label_y_offset are optional arguments here,
    // the numbers on the far right are default values if they are undefined
    label_x_offset = label_x_offset || 10;
    label_y_offset = label_y_offset || -10;

    var container = s.g().attr({
        "id": name
    });
    container.id = name;

    var newlocation = s.circle(x, y, 8).attr({
        "fill": location_color["normal"],
        "stroke": "#000",
        "stroke-width": 2,
    });

    // create hover-behavior animation
    newlocation.hover(function () {
        newlocation.animate({r:10}, 300);
    }, function () {
        newlocation.animate({r:8}, 300);
    });

    // create the text label for your location
    newlocation.label = s.text(x + label_x_offset, y + label_y_offset, name);
    newlocation.label.attr({
        "font-weight": "bold"
    });

    // put the circle and text (label) inside the g element
    container.append(newlocation);
    container.append(newlocation.label);

    // attribute to make it easy to look at the location's SVG circle element
    container.point = newlocation;

    // attribute for an Array of neighboring locations.
    // this is populated when creating an path between locations
    container.neighbors = [];

    // attribute for an Array of connecting paths
    // this is populated when creating an path between locations
    container.paths = [];

    // attributes determining whether or not the location has been clicked,
    // and in what context. Selected means a start point, suggested locations
    // appear highlighted when a location is selected.
    container.selected = false;
    container.suggested = false;

    return container;
}

//* makePath()
// creates a path between two locations, given the locations, the number of
// blocks, and colors, which is either a one-element or two-element array.
// if two-element, then two routes are created parallel to each other in place
// of one, and each is given its corresponding color. Otherwise, one route is
// placed in between the locations, with its corresponding color.
//
// a path consists of a g element, containing one or two g-elements, each of
// which contains all the 'rect's which are the drawn blocks.
function makePath(location_start, location_end, weight, colors) {
    // x & y coordinates of start & end locations
    var s_x = parseFloat(location_start.point.attr("cx"));
    var s_y = parseFloat(location_start.point.attr("cy"));
    var e_x = parseFloat(location_end.point.attr("cx"));
    var e_y = parseFloat(location_end.point.attr("cy"));

    // by default, 0 degrees is "left".
    // subtract by 180 degrees to make 0 degrees = "right"
    var path_angle = Snap.angle(s_x, s_y, e_x, e_y) - 180;
    var block_length = Math.hypot((e_x - s_x), (e_y - s_y)) / weight;

    // this SVG "g" element will hold all the blocks
    var path = s.g().attr({
        "id": location_start.attr("id") + location_end.attr("id")
    });
    path.id = location_start.id + location_end.id;

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
                "stroke":       path_stroke_color[color],
                "stroke-width": 1,
                "fill":         path_fill_color[color],
                "fill-opacity": path_empty_opacity[color],
            });
            block.transform("rotate("+path_angle+","+s_x+","+s_y+")");
            route.append(block);
        }

        return route;
    }

    // create the appropriate number of paths
    if (colors.length == 2) {
        path.append(makeRoute(3, colors[0]));
        path.append(makeRoute(-3, colors[1]));
    } else if (colors.length == 1) {
        path.append(makeRoute(0, colors[0]));
    } else {
        console.log("makePath: invalid array size of colors given\n");
    }

    // add the appropriate neighbor location to each location
    location_start.neighbors.push(location_end);
    location_end.neighbors.push(location_start);

    // add this path to each location
    location_start.paths.push(path);
    location_end.paths.push(path);

    return path;
}

// Declaration of map elements
var locations = [
    location_A = makeLocation("A", 200, 100),
    location_B = makeLocation("B", 300, 200),
    location_C = makeLocation("C", 200, 300, -20), // put label off to the left
    location_D = makeLocation("D", 100, 200, -20), // ^
    location_E = makeLocation("E", 400, 400),
    location_F = makeLocation("F", 330, 77),
];
var paths = [
    path_AB = makePath(location_A, location_B, 3, ["blue"]),
    path_BE = makePath(location_B, location_E, 5, ["red"]),
    path_BD = makePath(location_B, location_D, 4, ["gray"]),
    path_CB = makePath(location_C, location_B, 3, ["black", "blue"]),
    path_CE = makePath(location_C, location_E, 6, ["green"]),
    path_AD = makePath(location_A, location_D, 4, ["gray", "gray"]),
    path_AF = makePath(location_A, location_F, 4, ["red"]),
    path_EF = makePath(location_E, location_F, 7, ["gray"]),
];

// rearranges the location SVG elements to appear on top of the routes
locations.forEach(function (l) { l.appendTo(s); });
