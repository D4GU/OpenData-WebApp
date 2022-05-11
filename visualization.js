
$(document).ready(function() {
  $('.dropdown-item').click(function(e) {
    e.stopPropagation();
    $(this).siblings('.dropdown-item').removeClass('active')
    $(this).toggleClass('active');
  });
});


var mapContainer = d3.select('#map')
  .style("opacity", 0)
  .style("overflow-x","hidden")

var statisticsContainer = d3.select('#statistics')
  .style("overflow-x","hidden")

var statsvg = statisticsContainer.append('svg')
  .attr("id", "statisticssvg")
  .attr("width", 100 +"%")
  .attr("height", 100 + "%")

var mapsvg = mapContainer.append('svg')
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

var colorScaleBar = mapsvg.append("g")
  .attr("id", "colorScaleBar")

var country = mapsvg.append("g")
  .attr("visibility", "visible")
  .attr("id", "country")

var canton = mapsvg.append("g")
  .attr("visibility", "hidden")
  .attr("id", "canton")

var municipalities = mapsvg.append("g")
  .attr("visibility", "hidden")
  .attr("id", "municipality")

var tooltip = mapContainer.append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


const zoom = d3.zoom()
  .scaleExtent([1, 40])
  .on("zoom", zoomed);

function main() {
  createBar() 
  populateMap()
  mapsvg.call(zoom);
  transitionMap();
  setTimeout(function () {
    updateValues();
  }, 400);
  
}

function populateMap() {
  d3.json("./node_modules/swiss-maps/2021-07/ch-combined.json").then(function (ch) {
    
    d3.json("./lib/preprocessing/countrycombined.json").then(function (data) {
    window.dataset1 = data
    country.selectAll("path")
      .data(topojson.feature(ch, ch.objects.country).features)
      .enter().append("path")
      .attr("class", "country")
      .attr("abbreviation", data.abbreviation[0])
      .attr("name", data.name[0])
      .attr("data", JSON.stringify(data))
      .attr("d", path)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick)

    });  
    
    
    d3.json("./lib/preprocessing/cantonscombined.json").then(function (data) {
        var x = 0;
        window.dataset2 = data
        canton.selectAll("path")
          .data(topojson.feature(ch, ch.objects.cantons).features)
          .enter().append("path")
          .each(function (d) {

            d3.select(this)
              .attr("abbreviation", data.abbreviation[x])
              .attr("name", data.name[x])
              .attr("id", x)
            x++
          })
          
          .attr("class", "canton-boundaries")
          .attr("d", path)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick)
          
  
      });

      d3.csv("./node_modules/swiss-maps/2021-07/municipalitiesV3.csv").then(function (name) {
        d3.json("./lib/preprocessing/municipalities.json").then(function (data) {
        var y = 0;
        window.dataset3 = data
        municipalities.selectAll("path")
          .data(topojson.feature(ch, ch.objects.municipalities).features)
          .enter().append("path")
          .each(function () {
            d3.select(this)
              .attr("name", name[y]['name'])
              .attr("nameclean", name[y++]['nameclean'])
          })
          .attr("class", "municipality-boundaries")
          .attr("d", path)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick)
      })
      });
    });


}
// Underconstruction

function createBar() {
  var colors = d3.schemeBlues[9];

  var grad = colorScaleBar.append('defs')
    .append('linearGradient')
    .attr('id', 'grad')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%');

  grad.selectAll('stop')
    .data(colors)
    .enter()
    .append('stop')
    .style('stop-color', function(d){ return d; })
    .attr('offset', function(d,i){
      return 100 * (i / (colors.length - 1)) + '%';
    })

  colorScaleBar.append('rect')
    .attr('width', 25)
    .attr('height', 550)
    .style('border', 'none')
    .style('fill', 'url(#grad)')
    .raise()

  // d3.select('g#colorScaleBar rect').append('text')

  colorScaleBar.append('text')
    .attr('id', 'description')
    .attr('x', '0.5%')
    .attr('y', '-32px')
    .text('Placeholder')


  d3.select('g#colorScaleBar').raise()

}
function updateColorBar(min,max, title) {
  d3.select('g#colorScaleBar').select('text#description')
    .text(title)

    console.log([min, max*0.01,max*0.05 ,max*0.1, max*0.2, max*0.4, max*0.6, max*0.8, max])
  var x = d3.scaleLinear()
    .domain([min, max])
    .range([0, 550])
  
  var axis = d3.axisBottom(x);
  d3.select('g#colorScaleBar')
    .attr("class", "axis")
    .attr("width", 160)
    .attr("height", 40)
  .append("g")
    .attr("id", "g-runoff")
    
    .call(axis);

}



function updateValues() {
  let selection = d3.selectAll('g#country').selectAll("*")
  let selection2 = d3.selectAll('g#canton').selectAll("*")
  let selection3 = d3.selectAll('g#municipality').selectAll("*")
  

  var localmax = 0;
  var localmin = window.dataset2.Leistung_kw2011[0][0];

  for (let x = 0; x<Object.keys(window.dataset2.Leistung_kw2011).length; x++) {
    if (localmax < window.dataset2.Leistung_kw2011[x][0]) {
      localmax = window.dataset2.Leistung_kw2011[x][0]
    }
    if (localmin > window.dataset2.Leistung_kw2011[x][0]) {
      localmin = window.dataset2.Leistung_kw2011[x][0]
    }
  }

  var colorScale1= getColorscale(0, window.dataset1.Leistung_kw2011[0][0])
  var colorScale2 = getColorscale(localmin, localmax)

  selection
    .transition()
    .duration(1000)
    .attr("currentObs", window.dataset1["Leistung_kw2011"][0][0])
    .style("fill", function (d) {
      return colorScale1(window.dataset1.Leistung_kw2011[0][0])
    })

  selection2
    .each(function () {
      selectionID = parseInt(d3.select(this).attr("id"))

      d3.select(this)
        .transition()
        .duration(1000)
        .attr("currentObs", window.dataset2["Leistung_kw2011"][selectionID][0])
        .style("fill", function (d) {
          return colorScale2(window.dataset2["Leistung_kw2011"][selectionID][0])
        })
    })
  
    selection3
    .each(function () {
      selectionName = d3.select(this).attr("nameclean")
      d3.select(this)
        .transition()
        .duration(1000)
        .attr("currentObs", function(d) {
          if (selectionName in window.dataset3["Leistung_kw2011"]){
            return window.dataset3["Leistung_kw2011"][selectionName][0]
          } else {
            return "N/A"
          }
      
      })
        .style("fill", function (d) {
          if (selectionName in window.dataset3["Leistung_kw2011"]){
            return colorScale2(window.dataset3["Leistung_kw2011"][selectionName][0])
          } else {
            return colorScale2(0)
          }
        })
    })
 

  updateColorBar(localmin, localmax, Object.keys(window.dataset2)[5])


}

 


// Underconstruction

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

  tooltip.html(d3.select(this).attr("name") + "<br>Value: " + d3.select(this).attr("currentObs") )
    .style("left", (d['pageX'] - 400) + "px")
    .style("top", (d['pageY'] - 130) + "px")
    .style("padding", 2 + "px")
    .style("padding", 2 + "py");
}

function handleMouseOut(d, i) {
  d3.select(this)
    .style("opacity", 1)

        
  tooltip.transition()
    .duration('100')
    .style("opacity", 0);
}

function getColorscale(min, max) {
  console.log(d3.schemeBlues[9])
  let colorScale = d3.scaleThreshold()
    .domain([min,max*0.01,max*0.05 ,max*0.1, max*0.2, max*0.4, max*0.6, max*0.8, max])
    .range(d3.schemeBlues[9])
  return colorScale
}

function handleClick(d, i) {
  centroid = getBoundingBoxCenter(d3.select(this))
  d3.selectAll("path")
    .style("stroke-width",".3")
    .transition()
    .duration(400)
      .attr("transform", "scale(1,1)")
  d3.select(this)
    .style("stroke-width","2.5")
    .raise()
    .transition()
      .duration(400)
        .attr("transform", "scale(1.002,1.002)")
  d.stopPropagation();
  mapsvg.transition().duration(750).call(
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
  mapsvg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(mapsvg.node()).invert([width / 2, height / 2])
  );
}

function getBoundingBoxCenter (selection) {
  var element = selection.node();
  var bbox = element.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

main();