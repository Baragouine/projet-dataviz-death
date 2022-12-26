//  data
var DATA_RAW = null;
var DATA_RUP = null;

//  load data
async function load_data() {
  var data = await d3.csv("https://raw.githubusercontent.com/Baragouine/cause_of_deaths_around_the_world_1990_2019.csv/master/cause_of_deaths.csv",
    d => {
      for (const property in d) {
        if (property != "Country/Territory" &&
          property != "Code" &&
          property != "Year") {
          d[property] = +d[property]
        }
      }
      d["Year"] = d3.utcParse("%Y")(d["Year"])
      return d
    }
  );

  deaths = Array.from(d3.rollup(data, l => l.reduce((a, e) => {
    var tmp = {...e};
    delete tmp["Country/Territory"];
    return a.concat(tmp);
  } , []), d => d["Country/Territory"])).reduce((a, e) => {   
    e[1].reduce((a,e) => {
      var tmp = {...e};
      delete tmp["Country/Territory"];
      return a.concat(tmp);
    }, []);
    a.push({"Country/Territory": e[0], "values": e[1]});
    return a;
  }, []);

  DATA_RAW = data;
  DATA_RUP = deaths;
}

//  main
async function main() {
  await load_data();
  draw_fig1();
}

//  draw figure 1
function draw_fig1() {
  const selected_country = DATA_RAW.filter(e => e["Code"] == "USA" || e["Code"] == "ZAF" || e["Code"] == "BDI");
  const deaths_selected_country = Array.from(d3.rollup(selected_country, l => l.reduce((a, e) => {
    var tmp = {...e};
    delete tmp["Country/Territory"];
    return a.concat(tmp);
  } , []), d => d["Country/Territory"])).reduce((a, e) => {   
    e[1].reduce((a,e) => {
      var tmp = {...e};
      delete tmp["Country/Territory"];
      return a.concat(tmp);
    }, []);
    a.push({"Country/Territory": e[0], "values": e[1]});
    return a;
  }, []);
  codes = [...new Set(selected_country.map(d => d["Code"]))];

  //  scatterplot
  scatterplot = () => {
    // https://observablehq.com/@d3/chart-template
    const margin = ({top: 20, right: 350, bottom: 30, left: 60})
    
    const w = 1100
    const h = 500
  
    const svg = d3.select("#scatterplot").append("svg:svg").attr("height", h).attr("width", w)
  
    const x = d3.scaleLinear().domain(d3.extent(selected_country, d => d["Nutritional Deficiencies"])).range([margin.left, w - margin.left - margin.right])
    const y = d3.scaleLinear().domain(d3.extent(selected_country, d => d["Cardiovascular Diseases"])).range([h-margin.bottom, margin.top])
    const c = d3.scaleOrdinal().domain(new Set(selected_country.map(d => d["Country/Territory"]))).range(["red", "green", "blue"])
    
      svg.selectAll("circle").data(selected_country).enter()
        .append("circle")
        .attr("cx", d => x(d["Nutritional Deficiencies"]))
        .attr("cy", d => y(d["Cardiovascular Diseases"]))
        .attr("r", d => 2)
        .style("fill", d => c(d["Code"]))
  
  const xAxis = g => g
      .attr("transform", `translate(0,${h - margin.bottom})`)
      .call(d3.axisBottom(x))
  
  const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
  
    svg.append("g")
        .call(xAxis);
  
    svg.append("g")
        .call(yAxis);
  
    svg.selectAll("rect").data(deaths_selected_country).enter()
       .append("rect")
       .attr("x", d => w - margin.right)
       .attr("y", (d, i) => i * 20 + 10)
       .attr("width", d => 10)
       .attr("height", d => 10)      
       .style("fill", d => c(d["Country/Territory"]))
  
  
       svg.append("g").selectAll("text").data(deaths_selected_country).enter()
        .append("text")
        .attr("x", d => w - margin.right + 11)
        .attr("y", (d, i) => i * 20 + 20)   
        .text(d => d["Country/Territory"])
  
    svg.append("text")
       .attr("x", 10)
       .attr("y", 10)
       .style("font-size", "12px")
       .text("nb décès par Cardiovascular Diseases")
    
    svg.append("text")
       .attr("x", w - margin.right - 20)
       .attr("y", h - margin.bottom + 5)
       .style("font-size", "12px")
       .text("nb décès par Nutritional Deficiencies")
    
    svg.append("text")
       .attr("x", w / 2 - 320)
       .attr("y", 15)
       .text("Scatterplot de Nutritional Deficiencies vs Cardiovascular Diseases")
    
      return svg.node()
  }

  scatterplot();
}
