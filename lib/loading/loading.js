var width = 960,
    height = 500,
    triangleSize = 200,
    squareCount = 25,
    squareSize = 90,
    speed = .1;

  

var square = d3.select('#loading').selectAll("g")
  .selectAll("g")
    .data(function(d, i) { return i ? [0, 1, 2] : [2, 0, 1]; })
  .enter().append("g")
    .attr("transform", function(i) { return "rotate(" + (i * 120 + 60) + ")translate(0," + -triangleSize / Math.sqrt(8) + ")"; })
  .selectAll("rect")
    .data(d3.range(squareCount))
  .enter().append("rect")
    .datum(function(i) { return i / squareCount; })
    .attr("class", "loadingrect")
    .attr("width", squareSize)
    .attr("height", squareSize)
    .attr("x", -squareSize / 2)
    .attr("y", -squareSize / 2)
    
d3.timer(function(elapsed) {
  square
      .attr("transform", function(t) { return "translate(" + (t - .5) * triangleSize + ",0)rotate(" + (t * 120 + elapsed * speed) + ")"; });
});