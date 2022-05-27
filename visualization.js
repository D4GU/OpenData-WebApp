let dataset1;
let dataset2;
let dataset3;

$(document).ready(function () {
  $('.dropdown-item').click(function (e) {
    e.stopPropagation();
    $(this).siblings('.dropdown-item').removeClass('active')
    $(this).toggleClass('active');
  });
});

$("select").on("change", function() {
  updateValues('', '2011', null, this.value)
  switch(this.value){
    case ('dataset1') :
      return visibilitytoggler(1)
    case ('dataset2') :
      return visibilitytoggler(2)
    case ('dataset3') :
      return visibilitytoggler(3)
  }
});

function test () {
  console.log("Does this work?")
}

var mapContainer = d3.select('#map')
  .style("opacity", 0)
  .style("overflow-x", "hidden")

var statisticsContainer = d3.select('#statistics')
  .style("overflow-x", "visible")
  .style('pointer-events', 'none')


var mapsvg = mapContainer.append('svg')
  .attr("id", "mapsvg")
  .attr("width", 100 + "%")
  .attr("height", 100 + "%")
  .attr("viewBox", [-80, 415, 1250, 1])

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
  .scaleExtent([1, 2])
  .on("zoom", zoomed);

async function main() {
  createBar()
  await populateMap();
  setTimeout(function () {
    updateValues("Leistung_kw", 2011, 0, "dataset1")
    transitionMap();
  }, 600);

}

async function populateMap() {
  const ch = await d3.json("./node_modules/swiss-maps/2021-07/ch-combined.json");
  const countryCombinedData = await d3.json("./lib/preprocessing/countrycombined.json")
  dataset1 = countryCombinedData;
  country.selectAll("path")
    .data(topojson.feature(ch, ch.objects.country).features)
    .enter().append("path")
    .attr("class", "country")
    .attr("abbreviation", countryCombinedData.abbreviation[0])
    .attr("name", countryCombinedData.name[0])
    .attr("data", JSON.stringify(countryCombinedData))
    .attr("d", path)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick)


  const cantonsCombinedData = await d3.json("./lib/preprocessing/cantonscombined.json")
  var x = 0;
  dataset2 = cantonsCombinedData
  canton.selectAll("path")
    .data(topojson.feature(ch, ch.objects.cantons).features)
    .enter().append("path")
    .each(function (d) {

      d3.select(this)
        .attr("abbreviation", cantonsCombinedData.abbreviation[x])
        .attr("name", cantonsCombinedData.name[x])
        .attr("id", x)
      x++
    })

    .attr("class", "canton-boundaries")
    .attr("d", path)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick)


  const name = await d3.csv("./node_modules/swiss-maps/2021-07/municipalitiesV3.csv");
  const munciplaltiesData = await d3.json("./lib/preprocessing/municipalities.json")
  var y = 0;
  dataset3 = munciplaltiesData
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
    .on("click", handleClick);
  mapsvg.call(zoom);

}
// Piechart
var selection = undefined;

function colorselector (entry) {
  switch (entry) {
    case 'Wind':
      return 15
    case 'Hydropower':
      return 14
    case 'Photovoltaic':
      return 9
    case 'Biomass':
      return 6

    case 'Wind turbine':
      return 15
    case 'Attached photovoltaic plant':
      return 9
    case 'Integrated photovoltaic plant':
      return 8
    case 'Detached photovoltaic plant':
      return 7
    case 'Drinking water hydropower plant':
      return 14
    case 'Flow hydropower plant':
      return 13
    case 'Diversion hydropower plant':
      return 12
    case 'Doping hydropower plant':
      return 11
    case 'Steam hydropower plant':
      return 10
    case 'Sewage gas power plant':
      return 6
    case 'CHP power plant':
      return 5
    case 'Wastewater power plant':
      return 4
    case 'Waste incineration plant':
      return 3
    case 'Biomass utilization plant':
      return 4
    case 'Landfill gas plant':
      return 2
    case 'Not available':
      return 1
  }
}



function updateDonutChart(temp) {

  if (temp == undefined) {
    if (selection == undefined) {
      return;
    }
    temp = selection;
  } else {
    selection = temp;
  }

  d3.select("svg#currentEnergydonut").remove()
  d3.select("svg#currentTypedonut").remove()

  let currentEnergy = "Anlage_energietraeger" + staticyear
  let currentAnlagenType = "Anlagentyp" + staticyear
  let EneryData = [];
  let TypeData = [];

  var dwidth = 550
  dheight = 550
  dmargin = 140


  var radius = Math.min(dwidth, dheight) / 2 - dmargin

  var dsvg = d3.select("div#statistics")
      .append("svg")
        .attr("id", "currentEnergydonut")
        .attr("viewBox", [100, -50, 550, 550])
        .attr("width", dwidth)
        .attr("height", dheight)
        .style("position", "absolute")
        .style("transform", "translate(-35px, -33%)")
        .style('pointer-events', 'none')
        .append("g")
        .attr("transform", "translate(" + dwidth / 2 + "," + dheight / 2 + ")")
        .style('pointer-events', 'none')

  var csvg = d3.select("div#statistics")
    .append("svg")
      .attr("id", "currentTypedonut")
      .attr("viewBox", [100, -50, 550, 550])
      .attr("width", dwidth)
      .attr("height", dheight)
      .style("position", "absolute")
      .style("transform", "translate(-35px,13%)")
      .style('pointer-events', 'none')
      .append("g")
      .attr("transform", "translate(" + dwidth / 2 + "," + dheight / 2 + ")")
      .style('pointer-events', 'none')

  // Create dummy data
  
  // set the color scale
  var TypeColor = d3.scaleOrdinal()
    .domain([15,14,13,12,11,10,9,8,7,6,5,4,3,2,1])
    .range(['#76b7b2','#4e79a7','#5f94cd','#70aff3', '#75aeff','#749bff','#edc949', '#ffe44e','#fffb4e','#9c755f','#c29176', '#e8ad8d', '#ffc49a','#ffd19a','#bab0ab'])

  // wind, hydro ,solar ,biomass ,unavailable
  // Compute the position of each group on the pie:
  var pie = d3.pie().value(d => d.value)
  var eCount = 0

  if (staticdataset == 'dataset1') {
    for ([key, val] of Object.entries(dataset1[currentEnergy][0][0])) {
      EneryData.push({
        name: key,
        value: val
      })

    eCount += val;
    }
    for ([key, val] of Object.entries(dataset1[currentAnlagenType][0][0])) {
      TypeData.push({
        name: key,
        value: val
      })
    }
  } if (staticdataset == 'dataset2') {
    try {
      for ([key, val] of Object.entries(dataset2[currentEnergy][selection.data()[0].id - 1][0])) {
        EneryData.push({
          name: key,
          value: val
        })
        eCount += val;
      }
      for ([key, val] of Object.entries(dataset2[currentAnlagenType][selection.data()[0].id - 1][0])) {
        TypeData.push({
          name: key,
          value: val
        })
      }
      
    } catch {
      // Unavailable text here

    }
  } if (staticdataset == 'dataset3') {
    try {
      for ([key, val] of Object.entries(dataset3[currentEnergy][selection.data()[0].id][0])) {
        EneryData.push({
          name: key,
          value: val
        })
      }
      for ([key, val] of Object.entries(dataset3[currentAnlagenType][selection.data()[0].id][0])) {
        TypeData.push({
          name: key,
          value: val
        })
        eCount += val;
      }
     
    } catch {
      // Unavailable text here

    }
  }
  
  var EnergyData_ready = pie(EneryData)
  var TypeDataData_ready = pie(TypeData)

  var arc = d3.arc()
    .innerRadius(radius * 0.4)       
    .outerRadius(radius * 0.8)

  var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)


  createEnergiePie(dsvg, EnergyData_ready, arc, TypeColor, dwidth, eCount);
  createTypePie(csvg, TypeDataData_ready, arc, TypeColor, dwidth, eCount);
}

function createEnergiePie(dsvg, data_ready, arc, color, width, count) {
  cx = 0
  dsvg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function (d) { 
      return (color(colorselector (d.data.name))); })
    .style('pointer-events', 'none')
    .style("opacity", 1);


  dsvg
    .selectAll('counts')
    .data(data_ready)
    .enter()
    .append('text')

    .text(function (d) {
      var pieValue = ((d.endAngle - d.startAngle) * 100) / (2 * Math.PI);
      if (pieValue < 4) {
        d3.select(this).remove()
      } else {
        return d.data.value
      }
    })
      .attr("transform", function (d) { return "translate(" + arc.centroid(d) + 1 + ")"; })
      .style("text-anchor", "middle")
      .style("font-weight", 800)
      .style("font-size", 12)
      .style('fill', 'black')
      .style("font-family", 'Times New Roman, Times, serif')

  
  dsvg.selectAll('Tags')
    .data(data_ready)
    .attr("class", "tag")
    .enter()
    .append("rect")
    .attr("transform", function (d, i) {
      return "translate(" + (width - 435) + "," + (i * 16 - 105) + ")";
    })
    .attr("stroke-width", "0.2px")
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", function (d, i) {
      return color(colorselector (d.data.name));
    })
  dsvg.selectAll('allLegends')
    .data(data_ready)
    .attr("class", "legend")
    .enter()
    .append("text")
    .text(function (d) {
      return d.data.value + "    " + d.data.name;
    })
    .attr("transform", function (d, i) {
      return "translate(" + (width - 430) + "," + (i * 16 - 104.5) + ")";
    })
    .style("font-size", 14)
    .attr("y", 10)
    .attr("x", 11)
    .style("font-weight", 600)
    .style("font-family", 'Times New Roman, Times, serif')

  d3.select("#currentEnergydonut > g").append("text")
  .text(function (d) {
    if (count > 0) {
      return "Energy type";
    } else {
      return ""
    }
  })
  .style("text-anchor", "middle")
  .style("font-size", 24)
  .attr("y", -114)
  .attr("x", 175)
  .style("font-weight", 600)
  .style("font-family", 'Times New Roman, Times, serif')

d3.select("#currentEnergydonut > g").append("text")

  .text(function (d) {
    if (count > 0) {
      return count;
    } else {
      return "Not Available"
    }
    
  })

  .style("text-anchor", "middle")
  .style("font-size", 26)
  .attr("y", 7)
  .attr("x", 2)
  .style("font-weight", 600)
  .style("font-family", 'Times New Roman, Times, serif')
  
}

function createTypePie(dsvg, data_ready, arc, color, width, count) {
  dsvg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
      .attr('d', arc)
      .attr('fill', function (d) { return color(colorselector (d.data.name)) })
      .style('pointer-events', 'none')
      .style("opacity", 1)
    .exit()

  dsvg
    .selectAll('counts')
    .data(data_ready)
    .enter()
    .append('text')

    .text(function (d) {
      var pieValue = ((d.endAngle - d.startAngle) * 100) / (2 * Math.PI);
      if (pieValue < 4) {
        d3.select(this).remove()
      } else {
        return d.data.value
      }
    })
    .attr("transform", function (d) { return "translate(" + arc.centroid(d) + 1 + ")"; })
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .style("font-weight", 800)
    .style('fill', 'black')
    .style("font-family", 'Times New Roman, Times, serif')

  dsvg.selectAll('Tags')
    .data(data_ready)
    .attr("class", "tag")
    .enter()
    .append("rect") 
    .attr("transform", function (d, i) {
      return "translate(" + (width - 435) + "," + (i * 16 - 105) + ")";
    })
    .attr("stroke-width", "0.2px")
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", function (d, i) {
      return color(colorselector (d.data.name));
    })

  dsvg.selectAll('allLegends')
    .data(data_ready)
    .attr("class", "legend")
    .enter()
    .append("text")
    .text(function (d) {
      return d.data.value + "    " + d.data.name;
    })
    .attr("transform", function (d, i) {
      return "translate(" + (width - 430) + "," + (i * 16 - 104.5) + ")";
    })
    .style("font-size", 14)
    .attr("y", 10)
    .attr("x", 11)
    .style("font-weight", 600)
    .style("font-family", 'Times New Roman, Times, serif')

    d3.select("#currentTypedonut > g").append("text")
    .text(function (d) {
      if (count > 0) {
        return "Power plant type";
      } else {
        return ""
      }
    })
    .style("text-anchor", "middle")
    .style("font-size", 24)
    .attr("y", -114)
    .attr("x", 202)
    .style("font-weight", 600)
    .style("font-family", 'Times New Roman, Times, serif')


  d3.select("#currentTypedonut > g").append("text")
  .text(function (d) {
    if (count > 0) {
      return count;
    } else {
      return "Not Available"
    }
  })
  .style("text-anchor", "middle")
  .style("font-size", 26)
  .attr("y", 7)
  .attr("x", 2)
  .style("font-weight", 600)
  .style("font-family", 'Times New Roman, Times, serif')
}
// Piechart

// Coloring
var nanColor = '#8f8d86'
var colorRange = ['#88bb88', '#ff8888']
var colorRanges = [
  ['#DCDCDC', '#ff7f0e'],
  ['#DCDCDC', '#d62728'],
  ['#DCDCDC', '#2ca02c']
]
function changeColorRange(staticattribute) {

  switch (staticattribute) {
    case 'Leistung_kw':
      colorRange = colorRanges[0]
      break;
    case 'Verguetung_chf':
      colorRange = colorRanges[1]
      break;
    case 'Produktion_kwh':
      colorRange = colorRanges[2]
      break;
    default:
      colorRange = colorRanges[0]
  }

}


// Colorbar and Updater

function createBar() {
  //var colors = d3.schemeYlOrBr[9];


  var grad = colorScaleBar.append('defs')
    .append('linearGradient')
    .attr('id', 'grad')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%');
  

  grad.selectAll('stop')
    .data(colorRange)
    .enter()
    .append('stop')
    .style('stop-color', function (d) { return d; })
    .attr('offset', function (d, i) {
      return 125 * (i / (colorRange.length - 1)) + '%';
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
  d3.select('g#colorScaleBar').selectAll("*").remove();
  
  createBar()
  d3.select('g#colorScaleBar').select('text#description')
    .text(title)

  d3.select('g#colorScaleBar').select('text#function')
    .text(fnc)

  let x = d3.scaleLog()
    .domain([min, max])
    .range([0, 900])
    .base(10)

  d3.select('g#g-runoff').remove()

  let axis = d3.axisBottom(x)
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

function colorizeSelection (value, colorScaleFnc, flag) {
  color = nanColor
  if (value < 1 && value > 0) {
    value = Math.ceil(value)
  }
  value = parseInt(value)
  if (value != 0 && isFinite(value) && !isNaN(value)) {
    color = colorScaleFnc(Math.log10(value))
  }
  return color
} 

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

  changeColorRange(staticattribute)

  // Key to access precalculated sets
  let identifier = staticattribute + staticyear

  let selection = d3.selectAll('g#country').selectAll("*")  
  let selection2 = d3.selectAll('g#canton').selectAll("*")
  let selection3 = d3.selectAll('g#municipality').selectAll("*")

  var localValues2 = [];
  var localValues3 = [];

  for (let cantonIndex = 0; cantonIndex < Object.keys(dataset2[identifier]).length; cantonIndex++) {
    value = parseInt(dataset2[identifier][cantonIndex][staticfnc])
    if (value > 0 && isFinite(value) && !isNaN(value)) {
      localValues2.push(value)
    }
  }
  for (entry in dataset3[identifier]) {
    try {
      value = parseInt(dataset3[identifier][entry][staticfnc])
      if (value > 0 && isFinite(value) && !isNaN(value)) {
        localValues3.push(value)
      }
    } catch (e) {

    }
  }

  if (staticdataset == 'dataset1') {
    updateColorBar(0, dataset1[identifier][0][staticfnc], getTitles()[0], getTitles()[1])
  } if (staticdataset == 'dataset2') {
    updateColorBar(d3.min(localValues2), d3.max(localValues2), getTitles()[0], getTitles()[1])
  } if (staticdataset == 'dataset3') {
    updateColorBar(d3.min(localValues3), d3.max(localValues3), getTitles()[0], getTitles()[1])
  }

  var colorScale1 = getColorscale(0, dataset1[identifier][0][staticfnc])
  //var colorScale2 = getColorscale(localmin2, localmax2)
  localValues2 = localValues2.map(x => Math.log10(x))
  var colorScale2 = d3
  .scaleLinear()
  .domain([
    d3.min(localValues2),
    d3.max(localValues2)
  ])
  .range(colorRange);
  
  
  //var colorScale3 = getColorscale(localmin3, localmax3)
  localValues3 = localValues3.map(x => Math.log10(x))
  var colorScale3 = d3
  .scaleLinear()
  .domain([
    d3.min(localValues3),
    d3.max(localValues3)
  ])
  .range(colorRange); 


  selection
    .attr("currentObs", dataset1[identifier][0][staticfnc])
    .style("fill", function (d) {
      return colorScale1(dataset1[identifier][0][staticfnc])
    })

  selection2
    .each(function () {
      selectionID = parseInt(d3.select(this).attr("id"))

      d3.select(this)
        .attr("currentObs", dataset2[identifier][selectionID][staticfnc])
        .style("fill", function (d) {
          return colorizeSelection(dataset2[identifier][selectionID][staticfnc], colorScale2, 2)
        })
    })

  selection3
    .each(function () {
      munId = d3.select(this).attr("id")

      d3.select(this)
        .attr("currentObs", function (d) {
          if (munId in dataset3[identifier]) {
            try {
              return dataset3[identifier][munId][staticfnc]
            } catch (error) {
              // console.log( error)
              return 0
            }
          } else {
            return 0
          }
        })
        .style("fill", function (d) {
          if (munId in dataset3[identifier]) {
            try {
              return colorizeSelection(dataset3[identifier][munId][staticfnc], colorScale3, 3)
            } catch (error) {
              return colorizeSelection(0, colorScale3, 3)
            }
          } else {
            return colorizeSelection(0, colorScale3, 3)
          }
        })
    })
    updateDonutChart()
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