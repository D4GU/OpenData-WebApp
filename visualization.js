var mapContainer = d3.select('#map')
  .style("opacity", 0)
  .style("overflow-x","hidden")

var svg = mapContainer.append('svg')
  .attr("id", "mapsvg")
  .attr("width", 100 +"%")
  .attr("height", 100 + "%")
  .attr("viewBox", [55, 360, 1080, 1])

var projection = d3.geoMercator()
  .center([-172.3, 47.2])
  .scale(11000)
  .rotate([-180, 0]);

var path = d3.geoPath()
  .projection(projection);

var country = svg.append("g")
  .attr("visibility", "visible")


var canton = svg.append("g")
  .attr("visibility", "hidden")


var municipalities = svg.append("g")
  .attr("visibility", "hidden")


var tooltip = mapContainer.append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .on("zoom", zoomed);

function main() {
  populateMap()
  svg.call(zoom);
  transitionMap()
}

function populateMap() {
  d3.json("./node_modules/swiss-maps/2021-07/ch-combined.json").then(function (ch) {
    d3.csv("./data/ogd6_kev-bezueger.csv").then(function(pt) {
      console.log(pt)
      d3.csv("./node_modules/swiss-maps/2021-07/cantonsV3.csv").then(function (name) {
        var x = 0;
        canton.selectAll("path")
          .data(topojson.feature(ch, ch.objects.cantons).features)
          .enter().append("path")
          .each(function (d) {
            d3.select(this)
              .attr("name", name[x++]['name'])
          })
          .attr("class", "canton-boundaries")
          .attr("d", path)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick)
  
  
      })
  
      d3.csv("./node_modules/swiss-maps/2021-07/municipalitiesV3.csv").then(function (name) {
        var y = 0;
        municipalities.selectAll("path")
          .data(topojson.feature(ch, ch.objects.municipalities).features)
          .enter().append("path")
          .each(function () {
            d3.select(this)
              .attr("name", name[y++]['name'])
          })
          .attr("class", "municipality-boundaries")
          .attr("d", path)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick)
      })
  
      country.selectAll("path")
        .data(topojson.feature(ch, ch.objects.country).features)
        .enter().append("path")
        .attr("class", "country")
        .attr("name", "Switzerland")
        .attr("d", path)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick)

    })
  });
}

function transitionMap() {
  $('#map').show()
  d3.select('#map')
    .attr("visibility", "visible")
    .transition()
    .duration(10000)
    .style("opacity", 100)

  d3.select("#loader")
    .transition()
    .style("opacity", 0)
    .duration(1000)
    .on("end", function () {
      $('#loader').hide()
    });
}

function handleMouseOver(d, i) {
  d3.select(this)
    .style("opacity", 0.9)
    .style("stroke","black")
    .raise()
    .transition()
      .duration(400)
        .attr("transform", "scale(1.002,1.002)")

  tooltip.transition()
    .duration(100)
    .style("opacity", .8);

  tooltip.html(d3.select(this).attr("name"))
    .style("left", (d['pageX'] - 400) + "px")
    .style("top", (d['pageY'] - 130) + "px")
    .style("padding", 3 + "px");
}

function handleMouseOut(d, i) {
  d3.select(this)
    .style("opacity", 1)
    .style("stroke","white")
    .transition()
      .duration(400)
        .attr("transform", "scale(1,1)")
        
  tooltip.transition()
    .duration('100')
    .style("opacity", 0);
}

function handleClick(d, i) {
  centroid = getBoundingBoxCenter(d3.select(this))
  d3.selectAll("path")
    .style("fill", "#343a40")
  d3.select(this)
    .style("fill", "orange")
  d.stopPropagation();
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(width/2, height/2).scale(5).translate(-centroid[0]+48, -centroid[1]+24),
    d3.pointer(d)
  )
}

function visibilitytoggler(d) {
  country.attr("visibility", "hidden")
  canton.attr("visibility", "hidden")
  municipalities.attr("visibility", "hidden")
  if (d == 1) {
    country.attr("visibility", "visible")
    reset()
  } if (d == 2) {
    canton.attr("visibility", "visible")
    reset()
  } if (d == 3) {
    municipalities.attr("visibility", "visible")
    reset()
  }
}

function zoomed({transform}) {
  country.attr("transform", transform);
  canton.attr("transform", transform);
  municipalities.attr("transform", transform);
}

function reset() {
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
  );
}

function getBoundingBoxCenter (selection) {
  var element = selection.node();
  var bbox = element.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

main();