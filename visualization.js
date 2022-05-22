
$(document).ready(function () {
  $('.dropdown-item').click(function (e) {
    e.stopPropagation();
    $(this).siblings('.dropdown-item').removeClass('active')
    $(this).toggleClass('active');
  });
});


var mapContainer = d3.select('#map')
  .style("opacity", 0)
  .style("overflow-x", "hidden")

var statisticsContainer = d3.select('#statistics')
  .style("overflow-x", "visible")
  .style('pointer-events', 'none')

// var statsvg = statisticsContainer.append('svg')
//   .attr("id", "statisticssvg")
//   .attr("width", 100 + "%")
//   .attr("height", 100 + "%")

var mapsvg = mapContainer.append('svg')
  .attr("id", "mapsvg")
  .attr("width", 100 + "%")
  .attr("height", 100 + "%")
  .attr("viewBox", [-10, 415, 1150, 1])

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
  setTimeout(function () {
    updateValues("Leistung_kw", 2011, 0, "dataset1")
    transitionMap();
  }, 600);
  
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
              .attr("id", name[y++]['id'])
          })
          .attr("class", "municipality-boundaries")
          .attr("d", path)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on("click", handleClick)
      })
    });
  });
  mapsvg.call(zoom);


}
// Piechart
function updateDonutChart(selection) {
    
    d3.select("svg#currentEnergydonut").remove()
    d3.select("svg#currentTypedonut").remove()

    let currentEnergy = "Anlage_energietraeger" + staticyear
    let currentAnlagenType = "Anlagentyp" + staticyear
    let EneryData = [];
    let TypeData = [];
    

    // staticyear
    // staticdataset

    var dwidth = 500
        dheight = 500
        dmargin = 170

    var radius = Math.min(dwidth, dheight) / 2 - dmargin

    // append the svg object to the div called 'my_dataviz'
    var dsvg = d3.select("div#statistics")
      .append("svg")
        .attr("id", "currentEnergydonut")
        .attr("width", dwidth)
        .attr("height", dheight)
        .style('pointer-events', 'none')
      .append("g")
        .attr("transform", "translate(" + dwidth / 2 + "," + dheight / 2 + ")")
        .style('pointer-events', 'none')

    var csvg = d3.select("div#statistics")
      .append("svg")
        .attr("id", "currentTypedonut")
        .attr("width", dwidth)
        .attr("height", dheight)
        .style('pointer-events', 'none')
      .append("g")
        .attr("transform", "translate(" + dwidth / 2 + "," + dheight / 2 + ")")
        .style('pointer-events', 'none')
    
      // Create dummy data
    
    // set the color scale
    var TypeColor = d3.scaleOrdinal()
      .domain(Object.keys(TypeData))
      .range(d3.schemeBlues[9])
    
    var EnergyColor = d3.scaleOrdinal()
      .domain(Object.keys(EneryData))
      .range(d3.schemePurples[5])

    // Compute the position of each group on the pie:
    var pie = d3.pie().value(d=> d.value)

    if(staticdataset == 'dataset1') {
      for([key, val] of Object.entries(window[staticdataset][currentEnergy][0][0])) {
        EneryData.push({
          name: key,
          value: val
        })

      }
      for([key, val] of Object.entries(window[staticdataset][currentAnlagenType][0][0])) {
        TypeData.push({
          name: key,
          value: val
        })
      }
    }if(staticdataset == 'dataset2') {
      try {
        for([key, val] of Object.entries(window[staticdataset][currentEnergy][selection.data()[0].id - 1][0])) {
          EneryData.push({
            name: key,
            value: val
          })
        }
        for([key, val] of Object.entries(window[staticdataset][currentAnlagenType][selection.data()[0].id - 1][0])) {
          TypeData.push({
            name: key,
            value: val
          })
        }
      } catch {
        // Unavailable text here
          
      }
    }if(staticdataset == 'dataset3') {
      try {
        for([key, val] of Object.entries(window[staticdataset][currentEnergy][selection.data()[0].id][0])) {
          EneryData.push({
            name: key,
            value: val
          })
        }
        for([key, val] of Object.entries(window[staticdataset][currentAnlagenType][selection.data()[0].id][0])) {
          TypeData.push({
            name: key,
            value: val
          })
        }
      } catch {
        // Unavailable text here
          
      }
    }
    console.log(TypeData)
    var EnergyData_ready = pie(EneryData)
    var TypeDataData_ready = pie(TypeData)

    var arc = d3.arc()
      .innerRadius(radius * 0.5)         // This is the size of the donut hole
      .outerRadius(radius * 0.8)

    var outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

    createEnergiePie(dsvg, EnergyData_ready, arc, EnergyColor, outerArc, radius);
    createTypePie(csvg, TypeDataData_ready, arc, TypeColor, outerArc, radius);
}



function createEnergiePie(dsvg, data_ready, arc, color, outerArc, radius) {
  dsvg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
      .attr('d', arc)
      .attr('fill', function (d) { return (color(d.data)); })
      .attr("stroke", "black")
      .style('pointer-events', 'none')
      .style("stroke-width", "10px")
      .style("opacity", 0.9);

  dsvg
    .selectAll('allPolylines')
    .data(data_ready)
    .enter()
    .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .style('pointer-events', 'none')
      .attr("stroke-width", 1)
      .attr('points', function (d) {
        var posA = arc.centroid(d); // line insertion in the slice
        var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC];
      });

  dsvg
    .selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
      .text(function (d) { return d.data.name; })
      .attr('transform', function (d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('pointer-events', 'none')
      .style('text-anchor', function (d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? 'start' : 'end');
      });
}

function createTypePie(dsvg, data_ready, arc, color, outerArc, radius) {
  dsvg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function (d) { return (color(d.data)); })
      .attr("stroke", "black")
      .style('pointer-events', 'none')
      .style("stroke-width", "10px")
      .style("opacity", 0.9);

  dsvg
    .selectAll('allPolylines')
    .data(data_ready)
    .enter()
    .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .style('pointer-events', 'none')
      .attr("stroke-width", 1)
      .attr('points', function (d) {
        var posA = arc.centroid(d); // line insertion in the slice
        var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC];
    });

  dsvg
    .selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
      .text(function (d) { return d.data.name; })
      .attr('transform', function (d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('pointer-events', 'none')
      .style('text-anchor', function (d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? 'start' : 'end');
      });
}
// Piechart


// Colorbar and Updater

function createBar() {
  var colors = d3.schemeYlOrBr[9];

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
    .style('stop-color', function (d) { return d; })
    .attr('offset', function (d, i) {
      return 125 * (i / (colors.length - 1)) + '%';
    })

  colorScaleBar.append('rect')
    .attr('width', 25)
    .attr('height', 900)
    .style('border', 'none')
    .style('fill', 'url(#grad)')
    .raise()

  colorScaleBar.append('text')
    .attr('id', 'description')
    .attr('x', '0.5%')
    .attr('y', '-32px')
    .text('Placeholder')

  colorScaleBar.append('text')
    .attr('id', 'function')
    .attr('x', '66%')
    .attr('y', '-32px')
    .text('Placeholder')

  d3.select('g#colorScaleBar').raise()

}

function updateColorBar(min, max, title, fnc) {
  d3.select('g#colorScaleBar').select('text#description')
    .text(title)

  d3.select('g#colorScaleBar').select('text#function')
    .text(fnc)

  let x = d3.scaleLinear()
    .domain([min, max])
    .range([0, 900])

  d3.select('g#g-runoff').remove()


  let axis = d3.axisBottom(x);
  d3.select('g#colorScaleBar')
    .attr("class", "axis")
    .attr("width", 160)
    .attr("height", 40)
    .append("g")
    .attr("id", "g-runoff")
    .call(axis);

}


function getTitles() {
  var title;
  var fncname;

  switch (staticattribute) {
    case 'Leistung_kw':
      title = "Registered power (kW) in the year " + staticyear
      break;
    case 'Verguetung_chf':
      title = "Feed-in remunaration (CHF) in the year " + staticyear
      break;
    case 'Produktion_kwh':
      title = "Registered production (kWh) in the year " + staticyear
      break;
  }

  switch (staticfnc) {
    case 0:
      fncname = "Function: Maximum"
      break;
    case 1:
      fncname = "Function: Minimum"
      break;
    case 2:
      fncname = "Function: Mean"
      break;
    case 3:
      fncname = "Function: Standard deviation"
      break;
    case 4:
      fncname = "Function: Count"
      break;
    case 5:
      fncname = "Function: Summation"
      break;
  }

  return [title, fncname]
}



var staticattribute = "";
var staticyear = "";
var staticfnc = null;
var staticdataset = '';

function updateValues(attribute, year, fnc, dataset) {

  if (attribute != '') {
    staticattribute = attribute;
  }
  if (year != '') {
    staticyear = year;
  }
  if (fnc != null) {
    staticfnc = fnc;
  }
  if (dataset != '') {
    staticdataset = dataset
  }

  let identifier = staticattribute + staticyear

  let selection = d3.selectAll('g#country').selectAll("*")
  let selection2 = d3.selectAll('g#canton').selectAll("*")
  let selection3 = d3.selectAll('g#municipality').selectAll("*")

  console.log(identifier + " " + staticfnc + " " + staticdataset)

  var localmax2 = 0;
  var localmin2 = 1000000000000000;

  for (let x = 0; x < Object.keys(window.dataset2[identifier]).length; x++) {
    if (localmax2 < window.dataset2[identifier][x][staticfnc]) {
      localmax2 = window.dataset2[identifier][x][staticfnc]
    }
    if (localmin2 > window.dataset2[identifier][x][staticfnc]) {
      localmin2 = window.dataset2[identifier][x][staticfnc]
    }
  }

  var localmax3 = 0;
  var localmin3 = 100000000000000;

  x = 0;
  for (entry in window.dataset3[identifier]) {
    try {
      if (localmax3 < window.dataset3[identifier][entry][staticfnc]) {
        localmax3 = window.dataset3[identifier][entry][staticfnc]
      }
      if (localmin3 > window.dataset3[identifier][entry][staticfnc]) {
        localmin3 = window.dataset3[identifier][entry][staticfnc]
      }
    } catch (error) {
      // console.log("Ignored:", error)
    }
  }

  if (staticdataset == 'dataset1') {
    updateColorBar(0, window.dataset1[identifier][0][staticfnc], getTitles()[0], getTitles()[1])
  } if (staticdataset == 'dataset2') {
    updateColorBar(localmin2, localmax2, getTitles()[0], getTitles()[1])
  } if (staticdataset == 'dataset3') {
    updateColorBar(localmin3, localmax3, getTitles()[0], getTitles()[1])
  }

  var colorScale1 = getColorscale(0, window.dataset1[identifier][0][staticfnc])
  var colorScale2 = getColorscale(localmin2, localmax2)
  var colorScale3 = getColorscale(localmin3, localmax3)

  selection
    .attr("currentObs", window.dataset1[identifier][0][staticfnc])
    .style("fill", function (d) {
      return colorScale1(window.dataset1[identifier][0][staticfnc])
    })

  selection2
    .each(function () {
      selectionID = parseInt(d3.select(this).attr("id"))

      d3.select(this)
        .attr("currentObs", window.dataset2[identifier][selectionID][staticfnc])
        .style("fill", function (d) {
          return colorScale2(window.dataset2[identifier][selectionID][staticfnc])
        })
    })

  selection3
    .each(function () {
      munId = d3.select(this).attr("id")

      d3.select(this)
        .attr("currentObs", function (d) {
          if (munId in window.dataset3[identifier]) {
            try {
              return window.dataset3[identifier][munId][staticfnc]
            } catch (error) {
              // console.log( error)
              return 0
            }
          } else {
            return 0
          }
        })
        .style("fill", function (d) {
          if (munId in window.dataset3[identifier]) {
            try {
              return colorScale3(window.dataset3[identifier][munId][staticfnc])
            } catch (error) {
              return colorScale3(0)
            }
          } else {
            return colorScale3(0)
          }
        })
    })

}


// Colorbar and Updater

function transitionMap() {
  $('#map').show()
  d3.select('#map')
    .attr("visibility", "visible")
    .transition()
    .duration(7000)
    .style("opacity", 100)

  d3.select("#loader")
    .transition()
    .style("opacity", 0)
    .duration(500)
    .on("end", function () {
      $('#loader').hide()
    });
}

function handleMouseOver(d, i) {
  d3.select(this)
    .style("opacity", 0.7)

  tooltip.transition()
    .duration(100)
    .style("opacity", 0.90);

  tooltip.html(d3.select(this).attr("name") + "<br>Value: " + Number(d3.select(this).attr("currentObs")).toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"))
    .style("left", (d['pageX'] - 130) + "px")
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
  let colorScale = d3.scaleThreshold()
    .domain([min, max * 0.2, max * 0.4, max * 0.6, max * 0.8, max])
    .range(d3.schemeYlOrBr[7])
  return colorScale
}

function handleClick(d, i) {
  centroid = getBoundingBoxCenter(d3.select(this))
  updateDonutChart(d3.select(this))
  d3.selectAll("path")
    .style("stroke-width", ".3")
    .transition()
    .duration(400)
    .attr("transform", "scale(1,1)")
  d3.select(this)
    .style("stroke-width", "2.5")
    .raise()
    .transition()
    .duration(400)
    .attr("transform", "scale(1.002,1.002)")
  d.stopPropagation();
  mapsvg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(width / 2, height / 2).scale(2).translate(-centroid[0] + 120, -centroid[1] + 85),
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

function zoomed({ transform }) {
  country.attr("transform", transform);
  canton.attr("transform", transform);
  municipalities.attr("transform", transform);
}

function reset() {
  
  d3.select("svg#currentEnergydonut")
    .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove()

  d3.select("svg#currentTypedonut")
    .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove()
      
  mapsvg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(mapsvg.node()).invert([width / 2, height / 2])
  );
}

function getBoundingBoxCenter(selection) {
  var element = selection.node();
  var bbox = element.getBBox();
  return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

main();