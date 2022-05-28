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
  updateValues('', '', null, this.value)
  switch(this.value){
    case ('dataset1') :
      return visibilitytoggler(1)
    case ('dataset2') :
      return visibilitytoggler(2)
    case ('dataset3') :
      return visibilitytoggler(3)
  }
});


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
  .style("opacity", 0)

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
    .attr("transform", "scale(0.65) translate(570,60)")


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

// time diagramm
function areaChart() {
  var margin = {top: 10, right: 30, bottom: 30, left: 50}
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// var width = 800
// height = 800
// margin = 140
d3.select("svg#graph1").remove()
d3.select("svg#graph2").remove()
d3.select("svg#graph3").remove()
data = dataset1
ready_dataL = [[]]
ready_dataP = [[]]
ready_dataV = [[]]

for (var [key, value] of Object.entries(data)) {
  if (key.includes('Leistung') &&  staticfnc == 0) {
    ready_dataL[0].push({
      date : new Date(key.substring(11,15)),
      value: value[0][0]
    })
  } if (key.includes('Leistung') &&  staticfnc == 1) {
    ready_dataL[0].push({
      date : new Date(key.substring(11,15)),
      value: value[0][1]
    })
  } if (key.includes('Leistung') &&  staticfnc == 2) {
    ready_dataL[0].push({
      date : new Date(key.substring(11,15)),
      value: value[0][2]
    })
  } if (key.includes('Leistung') && staticfnc == 3) {
    ready_dataL[0].push({
      date : new Date(key.substring(11,15)),
      value: value[0][3]
    })
  } if (key.includes('Leistung') && staticfnc == 4) {
    ready_dataL[0].push({
      date : new Date(key.substring(11,15)),
      value: value[0][4]
    })
  } if (key.includes('Leistung') && staticfnc == 5) {
    ready_dataL[0].push({
      date : new Date(key.substring(11,15)),
      value: value[0][5]
    })
  } if (key.includes('Produktion') &&  staticfnc == 0) {
    ready_dataP[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][0]
    })
  } if (key.includes('Produktion') &&  staticfnc == 1) {
    ready_dataP[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][1]
    })
  } if (key.includes('Produktion') &&  staticfnc == 2) {
    ready_dataP[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][2]
    })
  } if (key.includes('Produktion') && staticfnc == 3) {
    ready_dataP[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][3]
    })
  } if (key.includes('Produktion') && staticfnc == 4) {
    ready_dataP[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][4]
    })
  } if (key.includes('Produktion') && staticfnc == 5) {
    ready_dataP[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][5]
    })
  } if (key.includes('Verguetung') &&  staticfnc == 0) {
    ready_dataV[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][0]
    })
  } if (key.includes('Verguetung') &&  staticfnc == 1) {
    ready_dataV[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][1]
    })
  } if (key.includes('Verguetung') &&  staticfnc == 2) {
    ready_dataV[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][2]
    })
  } if (key.includes('Verguetung') && staticfnc == 3) {
    ready_dataV[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][3]
    })
  } if (key.includes('Verguetung') && staticfnc == 4) {
    ready_dataV[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][4]
    })
  } if (key.includes('Verguetung') && staticfnc == 5) {
    ready_dataV[0].push({
      date : new Date(key.substring(14,18)),
      value: value[0][5]
    })
  }
   
  
}

// append the svg object to the body of the page
  createGraph(margin, ready_dataL, 1, 0, 540, "Possible Output",'#feaa60');
  createGraph(margin, ready_dataP, 2, 375, 540, "Production", '#88c688');
  createGraph(margin, ready_dataV, 3, 750, 540, "Remunaration", '#e27172');
}



var selection = undefined;
function createGraph(margin, ready_data, id, posx, posy, title, color) {

  var dsvg = d3.select("div#statistics")
    .append("svg")
    .attr("id", "graph" + id)
    .attr("viewBox", [-20, -20, 500, 500])
    .style("x", 200)
    .style("position", "absolute")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(ready_data[0], function (d) { return d.date; }))
    .range([0, width]);
    dsvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(ready_data[0], function (d) { return +d.value; })])
    .range([height, 0]);
    dsvg.append("g")
    .call(d3.axisLeft(y));



    dsvg.append("path")
    .datum(ready_data[0])
    .attr("fill", color)
    .attr("stroke", color)
    .attr("stroke-width", 1.5)
    .attr("d", d3.area()
      .x(function (d) { return x(d.date); })
      .y0(function() {
        return y(0);
      })
      .y1(function (d) { 
        if(d.value < 0) {
          return y(0)
        } else {
          return y(d.value); 
        }
      })
    );

  d3.select('#graph' + id)
    .attr("transform", "translate("+posx+","+posy+")");

  d3.select("#graph"+id+" > g").append("text")

  .text(title)
  .style("text-anchor", "middle")
  .style("font-size", 26)
  .attr("y", 20)
  .attr("x", 190)
  .style("font-weight", 600)
  .style("font-family", 'Roboto, sans-serif')
}

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

// Piechart
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
  d3.select("#mapsel").remove()

  let currentEnergy = "Anlage_energietraeger" + staticyear
  let currentAnlagenType = "Anlagentyp" + staticyear
  let EneryData = [];
  let TypeData = [];

  var dwidth = 550
  dheight = 550
  dmargin = 140


  var radius = Math.min(dwidth, dheight) / 2 - dmargin

  if (start == 0) {
    d3.select("div#statistics")
      .style("opacity", 0)
    start++
  }


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
      // console.log("error")
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


  createEnergiePie(dsvg, EnergyData_ready, arc, TypeColor, dwidth, eCount, selection);
  createTypePie(csvg, TypeDataData_ready, arc, TypeColor, dwidth, eCount);
}

function createEnergiePie(dsvg, data_ready, arc, color, width, count) {
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
      .style("font-family", 'Roboto, sans-serif')

  
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
    .style("font-family", 'Roboto, sans-serif')

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
  .style("font-family", 'Roboto, sans-serif')


d3.select("#currentEnergydonut > g").append("text")

  .text(function (d) {
    if (count > 0) {
      return count;
    } else {
      return "No selection or data"
    }
    
  })

  .style("text-anchor", "middle")
  .style("font-size", 26)
  .attr("y", 7)
  .attr("x", 2)
  .style("font-weight", 600)
  .style("font-family", 'Roboto, sans-serif')

  d3.select("#currentEnergydonut > g").append("text")
  
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
    .style("font-family", 'Roboto, sans-serif')

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
    .style("font-family", 'Roboto, sans-serif')

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
    .style("font-family", 'Roboto, sans-serif')


  d3.select("#currentTypedonut > g").append("text")
  .text(function (d) {
    if (count > 0) {
      return count;
    } else {
      return ""
    }
  })
  .style("text-anchor", "middle")
  .style("font-size", 26)
  .attr("y", 7)
  .attr("x", 2)
  .style("font-weight", 600)
  .style("font-family", 'Roboto, sans-serif')
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
    .attr('y2', '100%')
    
  

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
    .attr('x', '60%')
    .attr('y', '-32px')
    .text('Placeholder')

  d3.select('g#colorScaleBar').raise()

}

function updateColorBar(min, max, title, fnc, dataset) {
  switch(dataset){
    case(1) :
      d3.select('#colorScaleBar')
        .style('opacity', 0)
      break;
    case(2) :
      d3.select('#colorScaleBar')
        .style('opacity', 100)
      break;
    case(3) :
      d3.select('#colorScaleBar')
        .style('opacity', 100)
      break;
  }

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

var start = 0;
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
  if (dataset != '' && staticdataset != dataset) {
    staticdataset = dataset
  }

  changeColorRange(staticattribute)

  // Key to access precalculated sets
  let identifier = staticattribute + staticyear
  console.log(identifier, staticdataset, staticfnc)
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
    updateColorBar(0, dataset1[identifier][0][staticfnc], getTitles()[0], getTitles()[1], 1)
  } if (staticdataset == 'dataset2') {
    updateColorBar(d3.min(localValues2), d3.max(localValues2), getTitles()[0], getTitles()[1], 2)
  } if (staticdataset == 'dataset3') {
    updateColorBar(d3.min(localValues3), d3.max(localValues3), getTitles()[0], getTitles()[1], 3)
  }

  var colorScale1 = getColorscale(0, dataset1[identifier][0][staticfnc])
  localValues2 = localValues2.map(x => Math.log10(x))
  var colorScale2 = d3
  .scaleLinear()
  .domain([
    d3.min(localValues2),
    d3.max(localValues2)
  ])
  .range(colorRange);
  
  
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
      if (staticattribute.includes("Leistung")) {
        return "#feaa60"
      } if (staticattribute.includes("Produktion")) {
        return "#88c688"
      } if (staticattribute.includes("Verguetung")) {
        return "#e27172"
      }
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
    
    
    d3.select("#country").append("text")
    .text(function (d) {

        return "Switzerland";

    })
      .attr("id", "sel")
      .style("text-anchor", "middle")
      .style("font-size", 24)
      .style("fill","white")
      .attr("y", 200)
      .attr("x", 750)
      .style("font-weight", 600)
      .style("font-family", 'Roboto, sans-serif')


    d3.select("#country").append("text")
      .text(function (d) {
          if (staticfnc == 4) {
            return Number(dataset1[identifier][0][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " Installations";
          } if (staticattribute == "Leistung_kw") {
            return Number(dataset1[identifier][0][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kW";
          } if (staticattribute == "Produktion_kwh") {
            return Number(dataset1[identifier][0][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kWh/year";
          } if (staticattribute == "Verguetung_chf") {
            return "CHF "+ Number(dataset1[identifier][0][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ".-";
          }
          
      })
        .attr("id", "sel")  
        .style("text-anchor", "middle")
        .style("font-size", 24)
        .style("fill","white")
        .attr("y", 225)
        .attr("x", 750)
        .style("font-weight", 600)
        .style("font-family", 'Roboto, sans-serif')

    

    let selId = 0
    try {
      selId = staticselection.attr("id")
    } catch(error){
    }
    
    try {
      d3.select("#mapselv")
    .text(function (d) {
      if(staticdataset == "dataset2") {
        if (staticfnc == 4) {
          return Number(dataset2[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " Installations";
        }else if (staticattribute == "Leistung_kw") {
          return Number(dataset2[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kW";
        }else if (staticattribute == "Produktion_kwh") {
          return  Number(dataset2[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kWh/year";
        }else if (staticattribute == "Verguetung_chf") {
          return "CHF "+ Number(dataset2[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ".-";
        }
      } else if (staticdataset == "dataset3") {
        if (staticfnc == 4) {
          return Number(dataset3[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " Installations";
        }else if (staticattribute == "Leistung_kw") {
          return Number(dataset3[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kW";
        }else if (staticattribute == "Produktion_kwh") {
          return  Number(dataset3[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kWh/year";
        }else if (staticattribute == "Verguetung_chf") {
          return "CHF "+ Number(dataset3[identifier][selId][staticfnc]).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ".-";
        }
      }
        
    })
    } catch {
      
    }
    
    
    if (start == 0) {
      
      updateDonutChart(dataset1)
    } else {
      updateDonutChart()
    }

    if (staticdataset == 'dataset1') {
      areaChart()
      d3.select('#mapseln').style("opacity",0)
      d3.select('#mapselv').style("opacity",0)
    } else {
      d3.select('#mapseln').style("opacity",1)
      d3.select('#mapselv').style("opacity",1)
      d3.select('svg#graph1').remove()
      d3.select('svg#graph2').remove()
      d3.select('svg#graph3').remove()
      
    }

    d3.select("#country > path").attr("transform", "scale(0.65) translate(570,60)")
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
  
  d3.select("div#statistics")
    .transition()
      .duration(7000)
      .style("opacity", 100)
    
}

function handleMouseOver(d, i) {
  d3.select(this)
    .style("opacity", 0.7)

  tooltip.transition()
    .duration(100)
    .style("opacity", 0.90);

  let name = d3.select(this).attr("name")
  let value = 0
  if (staticfnc == 4) {
    value = Number(d3.select(this).attr("currentObs")).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " Installations";
  }else if (staticattribute == "Leistung_kw") {
    value = Number(d3.select(this).attr("currentObs")).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kW";
  }else if (staticattribute == "Produktion_kwh") {
    value =  Number(d3.select(this).attr("currentObs")).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kWh/year";
  }else if (staticattribute == "Verguetung_chf") {
    value = "CHF "+ Number(d3.select(this).attr("currentObs")).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ".-";
  }
  
  tooltip.html(name + "<br>" + value)
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

function showClickSelection(name, value) {
  d3.select('#mapseln').remove()
  d3.select('#mapselv').remove()
  d3.select("div#statistics").append("text")
      .text(function (d) {
          return name;
      })
        .attr("id", "mapseln")
        
        .style("text-anchor", "middle")
        .style("font-size", 24)
        .style("fill","black")
        .style("position", "absolute")
        .style("font-weight", 600)
        .style("font-family", 'Roboto, sans-serif')
        .style("transform", "translate(450px,5px)")
      
  d3.select("div#statistics").append("text")
      .text(function (d) {
        if (staticfnc == 4) {
          return Number(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " Installations";
        }else if (staticattribute == "Leistung_kw") {
          return Number(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kW";
        }else if (staticattribute == "Produktion_kwh") {
          return  Number(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " kWh/year";
        }else if (staticattribute == "Verguetung_chf") {
          return "CHF "+ Number(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + ".-";
        }
          
      })
        .attr("id", "mapselv")  
        .style("text-anchor", "middle")
        .style("font-size", 24)
        .style("fill","black")
        .style("position", "absolute")
        .style("font-weight", 500)
        .style("font-family", 'Roboto, sans-serif')
        .style("transform", "translate(450px,29px)")
}

var staticselection
function handleClick(d, i) {

  staticselection = d3.select(this)
  centroid = getBoundingBoxCenter(d3.select(this))
  updateDonutChart(d3.select(this))
  showClickSelection(d3.select(this).attr("name"), d3.select(this).attr("currentObs"))
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
    d3.zoomIdentity.translate(width / 2, height / 2).scale(2).translate(-centroid[0] + 200, -centroid[1] + 85),
    d3.pointer(d), 
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
  canton.attr("transform", transform);
  municipalities.attr("transform", transform);
}

function reset() {

  mapsvg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(mapsvg.node()).invert([width / 2, height / 2]),
  );
}

function getBoundingBoxCenter(selection) {
  var element = selection.node();
  var bbox = element.getBBox();
  return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

main();