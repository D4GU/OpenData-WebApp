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
  console.log(getColorscale(0,1))
  populateMap()
  svg.call(zoom);
  transitionMap()
}

function populateMap() {
  d3.json("./node_modules/swiss-maps/2021-07/ch-combined.json").then(function (ch) {
      d3.csv("./lib/preprocessing/cantonscombined.csv").then(function (data) {
        var x = 0;
        canton.selectAll("path")
          .data(topojson.feature(ch, ch.objects.cantons).features)
          .enter().append("path")
          .each(function (d) {
            d3.select(this)
              .attr("abbreviation", data[x]['abbreviation'])
              .attr("name", data[x]['name'])
              .attr("LeistungKw11", data[x++]['2011_Leistung_kw'])
              // console.log(data)
             
              console.log(d3.select(this).data())
          })
          
          .attr("class", "canton-boundaries")
          .attr("d", path)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick)
          
  
      });

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

      d3.csv("./lib/preprocessing/countrycombined.csv").then(function (data) {
      country.selectAll("path")
        .data(topojson.feature(ch, ch.objects.country).features)
        .enter().append("path")
        .attr("class", "country")
        .attr("name", data[0].name)
        .attr("abbreviation", data[0].abbreviation)
        .attr("d", path)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick)

      });
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
    .style("opacity", 0.7)

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

        
  tooltip.transition()
    .duration('100')
    .style("opacity", 0);
}

function getColorscale(min, avg, max) {
  let colorScale = d3.scaleThreshold()
    .domain([min, max*0.25, avg, max*0.75,max])
    .range(d3.schemeBlues[7])
  return colorScale
}

function handleClick(d, i) {
  centroid = getBoundingBoxCenter(d3.select(this))
  d3.selectAll("path")
    .style("fill", "#343a40")
    .style("stroke-width",".3")
    .transition()
    .duration(400)
      .attr("transform", "scale(1,1)")
  d3.select(this)
    .style("fill", "orange")
    .style("stroke-width","2.5")
    .raise()
    .transition()
      .duration(400)
        .attr("transform", "scale(1.002,1.002)")
  d.stopPropagation();
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(width/2, height/2).scale(2).translate(-centroid[0]+120, -centroid[1]+85),
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