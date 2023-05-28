var interval;
var interval2;

// Reading data from UFC_STATS.csv
Papa.parse("data/UFC_STATS.csv", {
  download: true,
  header: true,


  // The data is filtered to display only rows with the selected event.
  // Unique bout names for the selected event are extracted, duplicates are removed, and the uniqueBouts array is created.
  // A second drop-down menu with id bouts is populated with unique bout names for the selected event.
  complete: function(results) {
    // Get all the data from the CSV file
    var data = results.data;
    // Get the unique event names from the CSV file
    var events = [...new Set(data.map(function(row) {
      return row.EVENT;
    }))];
    // Remove duplicate
    var uniqueEvents = [...new Set(events)];
    // Populate the first drop-down menu with the unique events
    var select1 = document.getElementById("events");
    uniqueEvents.forEach(function(event) {
      var option = document.createElement("option");
      option.value = event;
      option.text = event;
      select1.appendChild(option);
    });
    
    select1.addEventListener("change", function() {
      
      var selectedEvent = select1.value;
      // Filter the data to get only the rows (fights) with the selected event
      var selectedRows = data.filter(function(row) {
        return row.EVENT === selectedEvent;
      });
      // Get the unique fights
      var bouts = [...new Set(selectedRows.map(function(row) {
        return row.BOUT;
      }))];
      // Remove duplicate
      var uniqueBouts = [...new Set(bouts)];
      // Populate the second drop-down menu with the unique fights
      var select2 = document.getElementById("bouts");
      select2.innerHTML = ""; // clear the previous options
      uniqueBouts.forEach(function(bout) {
        var option = document.createElement("option");
        option.value = bout;
        option.text = bout;
        select2.appendChild(option);
      });

      
      var panel = document.getElementById("panel");
      select2.addEventListener("change", function() {
      
      var selectedBout = select2.value;
      // Filter the data to get the row that matches the selected event and bout
      var selectedRow = data.filter(function(row) {
          return row.EVENT === selectedEvent && row.BOUT === selectedBout;
      })[0];
      
      panel.innerHTML = "<div class='division'>" + selectedRow.DIVISION + "</div>" +
                        "<div class='method'>" + selectedRow["METHOD OF WIN"] + "</div>" +
                        "<div class='round-time'>" + "R" + selectedRow["FINAL ROUND"] + " - " + selectedRow.TIME + "</div>" +
                        "<div class='fighters'>" +
                        "<span class='red-fighter " + (selectedRow.WINNER === selectedRow.RED_FIGHTER ? "winner" : "loser") + "'>" + selectedRow.RED_FIGHTER + "</span>" +
                        "<span class='blue-fighter " + (selectedRow.WINNER === selectedRow.BLUE_FIGHTER ? "winner" : "loser") + "'>" + selectedRow.BLUE_FIGHTER + "</span>" +
                        "</div>";
      

      // Removing any previous visualizations


      var redButton = document.getElementById('red-button');
      redButton.querySelector('.red-fighter-text').textContent = selectedRow["RED_FIGHTER"];
      var blueButton = document.getElementById('blue-button');
      blueButton.querySelector('.blue-fighter-text').textContent = selectedRow["BLUE_FIGHTER"];

      var redFighterText = document.querySelector(".red-fighter-text");
      var blueFighterText = document.querySelector(".blue-fighter-text");
      blueFighterText.classList.remove('selected');
      redFighterText.classList.remove('selected');

      var ssMetric = document.getElementById('ss-metric');
      var ctMetric = document.getElementById('ct-metric');
      var saMetric = document.getElementById('sa-metric');
      var tdMetric = document.getElementById('td-metric');
      ssMetric.textContent = '';
      ctMetric.textContent = '';
      saMetric.textContent = '';
      tdMetric.textContent = '';

      var striking = document.getElementById('striking');
      var control = document.getElementById('control');
      var jiujitsu = document.getElementById('jiujitsu');
      var wrestling = document.getElementById('wrestling');
      striking.style.backgroundImage = "url('icons/striking.svg')";
      control.style.backgroundImage = "url('icons/control.svg')";
      jiujitsu.style.backgroundImage = "url('icons/jiujitsu.svg')";
      wrestling.style.backgroundImage = "url('icons/wrestling.svg')";

      d3.select("#viz_container").selectAll("*").remove();

      document.getElementById("slider-heading").textContent = "";
      d3.select("#slider").selectAll("*").remove();
      
      
      });

      var defaultBout = uniqueBouts[0];
      select2.value = defaultBout;
      select2.dispatchEvent(new Event('change'));

      loadVisuals(defaultBout);

      select2.addEventListener("change", function() {
        var newDefaultBout = select2.value;
        loadVisuals(newDefaultBout);


        if (interval) {
          clearInterval(interval);
          clearInterval(interval2);
        }

        document.getElementById("red-listed-damage-rec").innerHTML = "";
        document.getElementById("blue-listed-damage-rec").innerHTML = "";

        document.getElementById("red-damage-rec").innerHTML = "";
        document.getElementById("blue-damage-rec").innerHTML = "";

        var redButton = document.getElementById('red-button');
        var blueButton = document.getElementById('blue-button');
        blueButton.classList.remove('selected');
        redButton.classList.remove('selected');

      });

    });
    
    var defaultEvent = uniqueEvents[0];
    select1.value = defaultEvent;
    select1.dispatchEvent(new Event('change'));
    

  }
});


//reads the CSV file using the D3.js library and returns the parsed data.
function loadVisuals(defaultBout){

  d3.csv("data/UFC_STATS.csv")
      .then(function(data){
          console.log(data);
          // functions are called with the parsed data and defaultBout as arguments
          createLineChart(data, defaultBout);
          roundByRoundVis(data, defaultBout);
          
      })
      .catch(function(error){
          console.log(error)
      });

}

//this code sets up click event listeners for the red button, blue button, which represents the fighters and the reload data button for the line chart. 
//When any of the buttons are clicked, the visualisations are re-applied, and the loadVisuals function is called to update the visualizations based on the current bout value.

document.addEventListener('DOMContentLoaded', function() {

  var redButton = document.getElementById('red-button');
  var blueButton = document.getElementById('blue-button');

  var redFighterText = document.querySelector(".red-fighter-text");
  var blueFighterText = document.querySelector(".blue-fighter-text");

  redButton.addEventListener('click', function() {
    redButton.classList.add('selected');
    blueButton.classList.remove('selected');
    redFighterText.classList.add('selected');
    blueFighterText.classList.remove('selected');
    var currentBout = document.getElementById("bouts").value;
    loadVisuals(currentBout);
  });

  blueButton.addEventListener('click', function() {
    blueButton.classList.add('selected');
    redButton.classList.remove('selected');
    blueFighterText.classList.add('selected');
    redFighterText.classList.remove('selected');
    var currentBout = document.getElementById("bouts").value;
    loadVisuals(currentBout);
  });

  var reloadButton = document.getElementById("reload-button");
  reloadButton.addEventListener("click", function () {
    var currentBout = document.getElementById("bouts").value;
    loadVisuals(currentBout);
  });

});


//displays round-by-round visualization for four metrics for a selected bout in a UFC event, based on the fighter selected
function roundByRoundVis(data, defaultBout){
  
  var row = data.find(function(d) { return d.BOUT === defaultBout; });
  rounds = row["ROUNDS"];

  var redButton = document.getElementById('red-button');
  var blueButton = document.getElementById('blue-button'); 

  var redSSLanded = row.RED_FIGHTER_SS_LANDED;
  var blueSSLanded = row.BLUE_FIGHTER_SS_LANDED;

  var redControlTime = row.RED_FIGHTER_CONTROL_TIME;
  var blueControlTime = row.BLUE_FIGHTER_CONTROL_TIME;

  var redSubAttempt = row.RED_FIGHTER_SUB_ATTEMPTS;
  var blueSubAttempt = row.BLUE_FIGHTER_SUB_ATTEMPTS;

  var redTDLanded = row.RED_FIGHTER_TD_LANDED;
  var blueTDLanded = row.BLUE_FIGHTER_TD_LANDED;



  var ssMetric = document.getElementById('ss-metric');
  var ctMetric = document.getElementById('ct-metric');
  var saMetric = document.getElementById('sa-metric');
  var tdMetric = document.getElementById('td-metric');

  var striking = document.getElementById('striking');
  var control = document.getElementById('control');
  var jiujitsu = document.getElementById('jiujitsu');
  var wrestling = document.getElementById('wrestling');

  // loading data for body map visualisation and reseting maps if data is already present
  var reloadButton2 = document.getElementById("reload-button2");
  reloadButton2.addEventListener("click", function () {
    var currentBout = document.getElementById("bouts").value;
    document.getElementById("red-damage-rec").innerHTML = "";
    document.getElementById("blue-damage-rec").innerHTML = "";
    createBodyMap(data, currentBout);
  });


  if (redButton.classList.contains('selected')) {

    ssMetric.textContent = redSSLanded;
    ctMetric.textContent = redControlTime;
    saMetric.textContent = redSubAttempt;
    tdMetric.textContent = redTDLanded;

    //changing svg icons based on selected fighter red/blue
    striking.style.backgroundImage = "url('icons/red-striking.svg')";
    control.style.backgroundImage = "url('icons/red-control.svg')";
    jiujitsu.style.backgroundImage = "url('icons/red-jiujitsu.svg')";
    wrestling.style.backgroundImage = "url('icons/red-wrestling.svg')";

    let colour = "RED"

    //slider for select matric to visualize on treemap
    document.getElementById("slider-heading").textContent = "Select a Metric";
    d3.select("#slider").selectAll("*").remove();
    const statLabels = [
      "Strikes",
      "Control Time",
      "Submission Attempts",
      "Takedowns",
    ];
    
    let currentStat = statLabels[0];
    
    const slider = d3
      .sliderHorizontal()
      .min(0)
      .max(3)
      .step(1)
      .tickFormat((d) => statLabels[d])
      .ticks(3)
      .width(500)
      .displayValue(false)
      .on("onchange", (val) => {
        currentStat = statLabels[val];
        console.log("Current stat:", currentStat);
        //on change call tree map function for visualisation of selected metric
        createTreeMap(colour,currentStat,row,rounds);
      });
    
      const sliderSvg = d3  
      .select("#slider")
      .append("svg")
      .attr("width", 700)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(30,30)")
      .call(slider);

    sliderSvg
      .selectAll(".tick text")
      .style("font-size", "16px");

    // setting default matric
    createTreeMap("RED","Strikes",row,rounds);

    
  } else if (blueButton.classList.contains('selected')) {

    ssMetric.textContent = blueSSLanded;
    ctMetric.textContent = blueControlTime;
    saMetric.textContent = blueSubAttempt;
    tdMetric.textContent = blueTDLanded;

    striking.style.backgroundImage = "url('icons/blue-striking.svg')";
    control.style.backgroundImage = "url('icons/blue-control.svg')";
    jiujitsu.style.backgroundImage = "url('icons/blue-jiujitsu.svg')";
    wrestling.style.backgroundImage = "url('icons/blue-wrestling.svg')";

    let colour = "BLUE"

    document.getElementById("slider-heading").textContent = "Select a Metric";
    d3.select("#slider").selectAll("*").remove();

    const statLabels = [
      "Strikes",
      "Control Time",
      "Submission Attempts",
      "Takedowns",
    ];
    
    let currentStat = statLabels[0];
    
    const slider = d3
      .sliderHorizontal()
      .min(0)
      .max(3)
      .step(1)
      .tickFormat((d) => statLabels[d])
      .ticks(3)
      .width(500)
      .displayValue(false)
      .on("onchange", (val) => {
        currentStat = statLabels[val];
        console.log("Current stat:", currentStat);
        createTreeMap(colour, currentStat, row, rounds);
      });
    
      const sliderSvg = d3  
      .select("#slider")
      .append("svg")
      .attr("width", 700)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(30,30)")
      .call(slider);

    sliderSvg
      .selectAll(".tick text")
      .style("font-size", "16px");

      createTreeMap("BLUE","Strikes",row,rounds);

    
  }
  

  function createTreeMap(colour,stat,row,rounds){

    row = row
    round = rounds

    var sskey = "";
    var sakey = "";
    var ctkey = "";
    var tdkey = "";

    var chosenMetric = "";
    var metricTool = "";

    //Set the color and desired metrics for the chosen fighter (red or blue) based on the colour argument.

    if(colour==="RED"){
      colour = "#db040f"
      sskey = "RED_FIGHTER_SS_LANDED_R";
      sakey = "RED_FIGHTER_SUB_ATTEMPTS_R";
      ctkey = "RED_FIGHTER_CONTROL_TIME_R";
      tdkey = "RED_FIGHTER_TD_LANDED_R";
    }else{
      colour = "#0072BC"
      sskey = "BLUE_FIGHTER_SS_LANDED_R";
      sakey = "BLUE_FIGHTER_SUB_ATTEMPTS_R";
      ctkey = "BLUE_FIGHTER_CONTROL_TIME_R";
      tdkey = "BLUE_FIGHTER_TD_LANDED_R";
    }

    // setting values for text within Tree Map based on the selected fighter
    if(stat==="Strikes"){
      stat = sskey
      chosenMetric = "STR";
      metricTool = "Strikes";
    }else if(stat==="Control Time"){
      stat = ctkey
      chosenMetric = "SECS";
      metricTool = "Control";
    }else if(stat==="Submission Attempts"){
      stat = sakey
      chosenMetric = "ATT";
      metricTool = "Submission";
    }else{
      stat = tdkey
      chosenMetric = "TD";
      metricTool = "Takedown";
    }

    //converting a metric (control time) that is in time format minutes:seconds to just seconds
    function determinFormat(value) {
      if (value.includes(':')) {
        const parts = value.split(':');
        const minutes = +parts[0];
        const seconds = +parts[1];
        return minutes * 60 + seconds;
      } else {
        return +value;
      }
    }

    // filtering and mapping the row object for the chosen metric. 
    // contains the round number and value of the chosen metric for each round.
    var fighterRBR = Object.keys(row)
    .filter(function(key) { return key.includes(stat); })
    .slice(0, rounds) // Add this line to limit the number of elements being mapped
    .map(function(key, index) {
      console.log(row[key]);
      return {
        name: "ROUND " + (index + 1),
        value: row[key] === '---' ? 0 : determinFormat(row[key])
      };
    });

    console.log(fighterRBR)

    //clearing previous data from the div
    d3.select("#viz_container").selectAll("*").remove();

    //margin width and height of Tree Map
    const margin = {top: 30, right: 20, bottom: 30, left: 20};
    const width = 450 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#viz_container")
      .append("svg")
        .attr("width", "50%")
        .attr("height", "50%")
        .attr("viewBox", "0 0 450 350")
        .attr("preserveAspectRatio", "xMinYMin")
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // reshape fighterRBR to match the expected format for the Tree Map
    const reshapedData = fighterRBR
    .filter(d => d.value > 0) // Filter out rounds with 0 value
    .map((d, index) => ({
      region: d.name,
      parent: 'NONE',
      value: d.value
    }));

    // Create a root node for the reshaped data
    const data2 = [{ region: 'NONE', parent: null, value: 0 }, ...reshapedData];


    //create a hierarchical data structure (treeData) from the flat data2 array.
    const treeData = d3.stratify()
      .id(d => d.region)
      .parentId(d => d.parent)
      (data2);

    //get the sum of each node in the tree map
    treeData.sum(d => d.value);


    //treemap generator with the specified width, height, and padding
    //call the treemap generator with the treeData hierarchy (treeData) as input. 
    //update the treeData object with the x and y coordinates for each node's rectangle in the treemap.
    d3.treemap()
      .size([width, height])
      .padding(2)
      (treeData);



    const totalStrikes = d3.sum(fighterRBR, d => d.value);

    // create a tooltip
    const tooltip = d3.select("body")
      .append("div")
        .attr("class", "tooltip");

    // tooltip events
    const mouseover = function(d) {
      tooltip
          .style("opacity", 1)
      d3.select(this)
          .style("opacity", .5)
    };
    const mousemove = function(event, d) {
      const percentage = ((d.data.value / totalStrikes) * 100).toFixed(2);
      tooltip
        .html(d.data.region+"<hr>"+metricTool + " Percentage: " + percentage + "%") //giving round and metric and percentage of overall value
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
    };
    const mouseleave = function(d) {
      tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 1)
    };


    // create rectangle
    svg
      .selectAll("rect")
      .data(treeData.leaves())
      .join("rect")
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d=> d.y1 - d.y0)
        .style("stroke", "none")
        .style("fill", colour)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

      svg
        .append("text")
          .attr("class", "chart-title")
          .attr("x", 0)
          .attr("y", -(margin.top)/2.5)
          .attr("text-anchor", "start")
          .attr("font-size", "12px")
        .text("Round By Round Performance");


        // positioning, size and content of the text that represents the rounds in each rectangle of the Tree Map
        svg
        .selectAll("text-round")
        .data(treeData.leaves())
        .join("text")
          .attr("class", "tree-label")
          .attr("x", d => d.x0+5)
          .attr("y", d => d.y0+15)
          .text(d => d.data.region)
          .attr("font-size", "10px")
          .attr("fill", "#ffffff")
          .style("display", d => ((d.x1 - d.x0) * (d.y1 - d.y0)) / (width * height) * 100 >= 4 ? "block" : "none"); // operation for determinig wether or not to show text based on rectangles size, has to occupy at least 4% of the overall value
    
      // positioning, size and content of the text that represents the chosen metric in each rectangle of the Tree Map    
      svg
        .selectAll("text-strikes")
        .data(treeData.leaves())
        .join("text")
          .attr("class", "tree-label")
          .attr("x", d => d.x0+5)
          .attr("y", d => d.y0+30)
          .text(d => chosenMetric+": " + d.data.value)
          .attr("font-size", "10px")
          .attr("fill", "#ffffff")
          .style("display", d => ((d.x1 - d.x0) * (d.y1 - d.y0)) / (width * height) * 100 >= 4 ? "block" : "none");

  }
    

}

//create "racing" line chart which shows red and blue fighters total strikes landed over the course of a bout
function createLineChart(data, defaultBout){

  //removing existing elements in SVG to ensure that it is empty before drawing
  d3.select("svg").selectAll("*").remove();
  
  var row = data.find(function(d) { return d.BOUT === defaultBout; });
  rounds = row["ROUNDS"]


  //returns an array of all the keys of the row object, 
  //which represents a single bout with data for both fighters for all rounds
  //filter function keeps only the keys that include the given substring e.g. "BLUE_FIGHTER_TS_LANDED_R" this will turn all available rounds for this metric
  //second filters the keys by checking whether the value in the row object is not equal to '---' thus ensureing that only valid data points are included.
  //map function transforms the filtered keys into an array of objects, with each object having a name and value


  // blueStrikesLanded: Total strikes landed per round by the blue fighter
  // redStrikesLanded: Total strikes landed per round by the red fighter

  var blueStrikesLanded = Object.keys(row)
    .filter(function(key) { return key.includes("BLUE_FIGHTER_TS_LANDED_R"); })
    .filter(function(key) {
      return row[key] !== '---';
    })
    .map(function(key) {
      return { name: key, value: +row[key] }; //converted to a number using the unary plus operator
    });

  var redStrikesLanded = Object.keys(row)
    .filter(function(key) { return key.includes("RED_FIGHTER_TS_LANDED_R"); })
    .filter(function(key) {
      return row[key] !== '---';
    })
    .map(function(key) {
      return { name: key, value: +row[key] };
    });


   // blueStrikesAttempted: Total strikes attempted per round by the blue fighter
  // redStrikesAttempted: Total strikes attempted per round by the red fighter

  
  var blueStrikesAttempted = Object.keys(row)
    .filter(function(key) { return key.includes("BLUE_FIGHTER_TS_ATTEMPTED_R"); })
    .filter(function(key) {
      return row[key] !== '---';
    })
    .map(function(key) {
      return { name: key, value: +row[key] };
    });

  var redStrikesAttempted = Object.keys(row)
    .filter(function(key) { return key.includes("RED_FIGHTER_TS_ATTEMPTED_R"); })
    .filter(function(key) {
      return row[key] !== '---';
    })
    .map(function(key) {
      return { name: key, value: +row[key] };
    });


  //max value of strikes landed to set the y-axis and animation durations for chart

  var maxValue = Math.max(
    ...redStrikesLanded.map(d => d.value),
    ...blueStrikesLanded.map(d => d.value)
  );

  // x-axis determined by rounds of bout, data point appearance and line speed values set here
  if (rounds > 3){
    duration = 4700;
    duration2 = 5000;
    }else{
      duration = 3200;
      duration2 = 3000;
  }

  //determing how high the values to be shown on y-axis should be
  if(maxValue >= 34){
    strikesShown = maxValue / 4
  }else if(maxValue < 15){
    strikesShown = maxValue
  }else{
    strikesShown = maxValue / 2
  }

    // Convert the redStrikesLanded and blueStrikesLanded arrays to the expected format
  var dataset1 = redStrikesLanded.map(function(d, i) {
      return [i+1, d.value];
  });

  var dataset2 = blueStrikesLanded.map(function(d, i) {
      return [i+1, d.value];
  });


  // What this does
  // if redStrikesLanded is [{name: "RED_FIGHTER_TS_LANDED_R1", value: 10}, {name: "RED_FIGHTER_TS_LANDED_R2", value: 15}], 
  // the resulting dataset1 would be [[1, 10], [2, 15]] the first value being the round x-axis, the second being strikes landed, y-axis


     // Convert the redStrikesAttempted and blueStrikesAttempted arrays to the expected format
  var dataset3 = redStrikesAttempted.map(function(d, i) {
      return [i+1, d.value];
  });

  var dataset4 = blueStrikesAttempted.map(function(d, i) {
      return [i+1, d.value];
  });


  // adding 0,0 to the begining as to ensure that the line starts at 0 in bottom left corner of chart
  dataset1.unshift([0, 0]);
  dataset2.unshift([0, 0]);

  dataset3.unshift([0, 0]);
  dataset4.unshift([0, 0]);


  //LINE CHART
   
  //Set up the SVG and dimensions
   var svg = d3.select("#chart"),
   margin = 180,
   width = svg.attr("width") - margin, //300
   height = svg.attr("height") - margin //200

    //Define xScale and yScale scales, specifying the range for both scales. either 3 or 5 rounds, and suitable max striking value
    var xScale = d3.scaleLinear().domain([0, rounds]).range([0, width]);
    var yScale = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);
    
    //Append a group element (g) to the SVG and translate it according to the margin (container for chart)
    var g = svg.append("g")
      .attr("transform", "translate(" + 100 + "," + 100 + ")");

    
    // Title text
    svg.append('text')
    .attr('x', width/2 + 100)
    .attr('y', maxValue+10)
    .attr('text-anchor', 'middle')
    .style('font-family', 'Helvetica')
    .style('font-size', 20)
    .text('Total Strikes Landed');

    // X label text
    svg.append('text')
    .attr('x', width/2 + 100)
    .attr('y', height - 15 + 150)
    .attr('text-anchor', 'middle')
    .style('font-family', 'Helvetica')
    .style('font-size', 12)
    .text('Round');

    // Y label text
    svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(60,' + height + ')rotate(-90)')
    .style('font-family', 'Helvetica')
    .style('font-size', 12)
    .text('Strikes');

    //adding ticks for rounds on x-axis
    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale).ticks(rounds));

    //adding ticks for total strikes on y-axis
    g.append("g")
    .call(d3.axisLeft(yScale).ticks(strikesShown)); //.ticks(maxValue/2)


    //creating two line paths, animating there movement, and adding circles for each data point with tooltip functionality to facilitate user interaction



    // creating line generator for the datasets
    // specifies X and Y coordinates for each data point using the scales, 
    // sets the curve to be along the X-axis
          
    var line = d3.line()
    .x(function(d) { return xScale(d[0]); }) 
    .y(function(d) { return yScale(d[1]); }) 
    .curve(d3.curveMonotoneX)
 
    var line2 = d3.line()
    .x(function(d) { return xScale(d[0]); }) 
    .y(function(d) { return yScale(d[1]); }) 
    .curve(d3.curveMonotoneX)

    

    function animateLine(linePath) {
      var totalLength = linePath.node().getTotalLength();
      linePath
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(duration) 
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
    }

    
    // append the paths for the two datasets to the SVG, 
    // set their styles (color and stroke width), 
    // and call the animateLine function to animate them.


    svg.append("path")
      .datum(dataset1)
      .attr("class", "line")
      .attr("transform", "translate(" + 100 + "," + 100 + ")")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "#CC0000")
      .style("stroke-width", "3")
      .call(animateLine); 

    
    svg.append("path")
      .datum(dataset2)
      .attr("class", "line")
      .attr("transform", "translate(" + 100 + "," + 100 + ")")
      .attr("d", line2)
      .style("fill", "none")
      .style("stroke", "#00008B")
      .style("stroke-width", "3")
      .call(animateLine); 


      //animate the circles (data points) by setting their radius to 0 , 
      //then transition the radius to 5 with a delay based on the data point index.

      function animateCircles(selection, delayFactor) {
          selection
              .attr("r", 0)
              .transition()
              .delay(function(d, i) { return i * delayFactor; })
              .duration(250)
              .attr("r", 5);
      }

      //append circles for the data points to the SVG
      
      svg.append('g')
          .selectAll("dot")
          .data(dataset1)
          .enter()
          .append("circle")
          .attr("cx", function (d) { return xScale(d[0]); } ) //position on chart
          .attr("cy", function (d) { return yScale(d[1]); } )
          .attr("transform", "translate(" + 100 + "," + 100 + ")")
          .style("fill", "#CC0000") //colour
          .call(animateCircles, duration / (dataset1.length - 1))
          .on("mouseover", function (event, d) { //tooltip to provide infor on mouse
            var index = dataset1.indexOf(d);
            var d3Data = dataset3[index];
            d3.select(".tooltip")
              .style("display", "inline")
              .html("Landed: "+d[1]+"<hr>Attempted: "+d3Data[1]);
          })
          .on("mousemove", function (event) {
            d3.select(".tooltip")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function () {
            d3.select(".tooltip")
              .style("display", "none");
          });

      
      svg.append('g')
          .selectAll("dot2")
          .data(dataset2)
          .enter()
          .append("circle")
          .attr("cx", function (d) { return xScale(d[0]); } )
          .attr("cy", function (d) { return yScale(d[1]); } )
          .attr("transform", "translate(" + 100 + "," + 100 + ")")
          .style("fill", "#00008B")
          .call(animateCircles, duration / (dataset2.length - 1))
          .on("mouseover", function (event, d) {
            var index = dataset2.indexOf(d);
            var d4Data = dataset4[index];
            d3.select(".tooltip")
              .style("display", "inline")
              .html("Landed: "+d[1]+"<hr>Attempted: "+ d4Data[1]);
          })
          .on("mousemove", function (event) {
            d3.select(".tooltip")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function () {
            d3.select(".tooltip")
              .style("display", "none");
          });

  //SHOW ALL AVAILABLE STATS/METRICS BELOW FIGHTER NAMES just for testing purposes
  // var list = "<ul>";
  // redStrikesLanded.forEach(function(item) {
  //   list += "<li><strong>" + item.name + ":</strong> " + item.value + "</li>";
  // });
  // list += "</ul>";

  // var list2 = "<ul>";
  // blueStrikesLanded.forEach(function(item) {
  //   list2 += "<li><strong>" + item.name + ":</strong> " + item.value + "</li>";
  // });
  // list2 += "</ul>";


  // var visualsElement = document.getElementById("visuals");
  // visualsElement.innerHTML = list;

  // var visualsElement = document.getElementById("visuals2");
  // visualsElement.innerHTML = list2;

 
  // LISTING COLUMNS AND VALUES

  // var cdata = Object.keys(row).map(function(key) {
  //   return { name: key, value: row[key] };
  // });

  // var list3 = "<ul>";
  // cdata.forEach(function(item) {
  //   list3 += "<li><strong>" + item.name + ":</strong> " + item.value + "</li>";
  // });
  // list3 += "</ul>";

 
  // var visualsElement = document.getElementById("visuals3");
  // visualsElement.innerHTML = list3;


}


function createBodyMap(data, defaultBout){

  //creates and adds a data point (circle) to the specified parent element (parentId) with the given color for each strike counted. 
  //calculate circle position randomly within the middle area of the parent element.
  
  function addDataPoint(parentId, color) {
    var parentElement = d3.select("#" + parentId);
    var svg = parentElement.select("svg");

    if (svg.empty()) {
      svg = parentElement.append("svg")
        .attr("width", parentElement.node().clientWidth)
        .attr("height", parentElement.node().clientHeight)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0);
    }

    //calculate the center of the div
    var centerX = (parentElement.node().clientWidth - 2) / 2;
    var centerY = (parentElement.node().clientHeight - 2) / 2;

    //calculate the boundaries of the 200px by 200px middle area
    var minX = centerX - 15;
    var maxX = centerX + 25;
    var minY = centerY - 240;
    var maxY = centerY + 100;

    //randomly position the data point within the middle area
    var x = Math.random() * (maxX - minX) + minX;
    var y = Math.random() * (maxY - minY) + minY;

    svg.append("g")
      .attr("transform", "translate(" + x + "," + y + ")")
      .append("circle")
      .attr("fill", color)
      .attr("r", 2.5);
  }

  //clearing intervals which stops the population of body map with hit points
  if (interval) {
    clearInterval(interval);
    clearInterval(interval2);
  }
  
  //getting data for selected bout
  var row = data.find(function(d) { return d.BOUT === defaultBout; });
  rounds = row["ROUNDS"];
  var RED_FIGHTER = row["RED_FIGHTER"];
  var BLUE_FIGHTER = row["BLUE_FIGHTER"];

  var red_strike_location = ["RED_FIGHTER_SS_HEAD_LANDED_R", "RED_FIGHTER_SS_BODY_LANDED_R", "RED_FIGHTER_SS_LEG_LANDED_R"];
  var blue_strike_location = ["BLUE_FIGHTER_SS_HEAD_LANDED_R", "BLUE_FIGHTER_SS_BODY_LANDED_R", "BLUE_FIGHTER_SS_LEG_LANDED_R"];

  //creating array containing containing location and strikes landed for each round
  var redStrikesByLocation = Object.keys(row)
    .filter(function(key) { 
      return red_strike_location.some(loc => key.includes(loc));
    })
    .filter(function(key) {
      return row[key] !== '---';
    })
    .map(function(key) {
      return { name: key, value: +row[key] };
    });


  console.log(redStrikesByLocation);

  //total strikes for each location
  //store the total number of strikes landed in each location (head, body, and leg).

  var totalStrikes = {
    head: 0,
    body: 0,
    leg: 0
  };
  
  redStrikesByLocation.forEach(function (item) {
    if (item.name.includes("HEAD")) {
      totalStrikes.head += item.value;
    } else if (item.name.includes("BODY")) {
      totalStrikes.body += item.value;
    } else if (item.name.includes("LEG")) {
      totalStrikes.leg += item.value;
    }
  });
  
  var currentStrikes = {
    head: 0,
    body: 0,
    leg: 0
  };


  // Update displayed values 
  // code sets up intervals (using setInterval) to update the displayed fighter strike values every 100ms
  // Within these intervals, the following happens

  // Increment currentStrikes for each location if it is less than the totalStrikes
  // Call addDataPoint function to add a data point to the body map
  // Update HTML content with current strike values
  
  var visualsElement = document.getElementById("red-listed-damage-rec");
  
  // Update the displayed values every 100ms (10 seconds / 100 updates)
  interval = setInterval(function () {
    var list4 = "<h4>"+BLUE_FIGHTER+"</h2><hr><br><ul>";
  
    // Update the current strikes and display them
    Object.keys(currentStrikes).forEach(function (key) {
      if (currentStrikes[key] < totalStrikes[key]) {
        currentStrikes[key]++;
        addDataPoint("blue-damage-rec", "red");
      }
      list4 += "<li><strong>" + key.toUpperCase() + ":</strong> " + currentStrikes[key] + "</li>";
    });
  
    list4 += "</ul>";
  
    visualsElement.innerHTML = list4;
  
    // Check if the current strikes have reached the total strikes, and if so, clear the interval
    if (JSON.stringify(currentStrikes) === JSON.stringify(totalStrikes)) {
      clearInterval(interval);
    }
  }, 300);




  var blueStrikesByLocation = Object.keys(row)
    .filter(function(key) { 
      return blue_strike_location.some(loc => key.includes(loc));
    })
    .filter(function(key) {
      return row[key] !== '---';
    })
    .map(function(key) {
      return { name: key, value: +row[key] };
    });

  console.log(blueStrikesByLocation);

  var totalStrikes2 = {
    head: 0,
    body: 0,
    leg: 0
  };
  
  blueStrikesByLocation.forEach(function (item) {
    if (item.name.includes("HEAD")) {
      totalStrikes2.head += item.value;
    } else if (item.name.includes("BODY")) {
      totalStrikes2.body += item.value;
    } else if (item.name.includes("LEG")) {
      totalStrikes2.leg += item.value;
    }
  });
  
  var currentStrikes2 = {
    head: 0,
    body: 0,
    leg: 0
  };


  var visualsElement2 = document.getElementById("blue-listed-damage-rec");
  
    // Update the displayed values every 100ms (10 seconds / 100 updates)
    interval2 = setInterval(function () {
      var list5 = "<h4>"+RED_FIGHTER+"</h2><hr><br><ul>";
    
      // Update the current strikes and display them
      Object.keys(currentStrikes2).forEach(function (key) {
        if (currentStrikes2[key] < totalStrikes2[key]) {
          currentStrikes2[key]++;
          addDataPoint("red-damage-rec", "blue");
        }
        list5 += "<li><strong>" + key.toUpperCase() + ":</strong> " + currentStrikes2[key] + "</li>";
      });
    
      list5 += "</ul>";
    
      visualsElement2.innerHTML = list5;
    
      // Check if the current strikes have reached the total strikes, and if so, clear the interval
      if (JSON.stringify(currentStrikes2) === JSON.stringify(totalStrikes2)) {
        clearInterval(interval2);
      }
    }, 300);


  

}