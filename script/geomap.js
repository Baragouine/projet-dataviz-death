var COLOR_MISSING_DATA = "#888";

//  update geomap
function update_geomap() {
  if (document.getElementById("prop_geomap").checked) {
    draw_geo_map_prop(get_data_prop(), get_list_of_selected_cause_geomap(), $("#slider_geomap").val(), document.getElementById("logscale_geomap").checked);
  } else {
    draw_geo_map(get_data_raw(), get_list_of_selected_cause_geomap(), $("#slider_geomap").val(), document.getElementById("logscale_geomap").checked);
  }
}

//  update info for a country
function show_geomap_info_country(code, year, list_cause) {
  if (!get_list_code().find(c => c == code)) {
    $("#geomap_info_contry").html('');
    return;
  }

  $("#geomap_info_contry").html(
    `
      <h6>${get_data_grouped_by_code()[code][0]["Country/Territory"]} (${get_data_grouped_by_code()[code][0]["Code"]})</h6>
      <p>
        <span class="fw-bold">${get_sum_deaths(get_data_raw(), year, code, list_cause)}</span>
      </p>
    `
  );
}

//  on mouse over country
function geomap_mouseover_country(svg, ev, code) {
  svg.selectAll("path")
     .style("opacity", f => f.id == code ? 1 : 0.2);

  show_geomap_info_country(code, $("#slider_geomap").val(), get_list_of_selected_cause_geomap());
}

//  on mouseout country
function geomap_mouseout_country(svg, ev, code) {
  svg.selectAll("path")
     .style("opacity", 1);
}

//  return selected causes
function get_list_of_selected_cause_geomap() {
  const list_all_cause = get_all_causes();
  var list_cause = [];

  list_all_cause.forEach(cause => {
    if (document.getElementById("geomap-" + cause).checked)
      list_cause.push(cause);
  });

  return list_cause;
}

//  select all causes for geomap
function select_all_causes_geomap() {
  //  List cause js
  const list_all_cause = get_all_causes();

  list_all_cause.forEach(cause => {
    document.getElementById("geomap-" + cause).checked = true;
  });

  update_geomap();
}

//  keep only first causes selected
function select_only_first_causes_geomap() {
  //  List cause js
  const list_all_cause = get_all_causes();

  list_all_cause.forEach(cause => {
    document.getElementById("geomap-" + cause).checked = false;
  });

  document.getElementById("geomap-" + list_all_cause[0]).checked = true;

  update_geomap();
}

//  draw geomap by number of death
function draw_geo_map(data, list_cause, year, log_scale = false) {
  const margin = ({top: 0, right: 0, bottom: 0, left: 0})

  const w = document.getElementById("geomapw").parentNode.offsetWidth * 0.95;
  const h = w * 0.5375;

  const min_deaths = Math.max(get_min_sum_deaths(data, list_cause), 1);
  const max_deaths = get_max_sum_deaths(data, list_cause);

  const dataForYear = data.filter(e => e.Year.getFullYear() == year);

  const logScale = d3.scaleLog().domain([min_deaths, max_deaths])
  const colorScaleLog = d3.scaleSequential((d) => d3.interpolateReds(logScale(d)))
  const linearScale = d3.scaleLinear().domain([min_deaths, max_deaths])
  const colorScaleLinear = d3.scaleSequential((d) => d3.interpolateReds(linearScale(d)))

  const colorScale = log_scale ? colorScaleLog : colorScaleLinear;

  const legend_h = 7*20;
  const legend_w = 10;

  const svg = d3.select("#geomapw").attr("height", h).attr("width", w)
  const svgLegend = d3.select("#geomap_legend").attr("height", Math.round(legend_h * 1.5), 200);

  //  clear svg
  svg.selectAll('*').remove();
  svgLegend.selectAll("*").remove();
  
  const projection = d3.geoNaturalEarth1()
    .scale((w - margin.right - margin.left) / 5.5)
    .translate([w / 2 - margin.right + margin.left, h / 2])

  //  draw map
  svg.selectAll("path")
     .data(get_data_map().features).enter()
     .append("path")
     .attr("fill", e => {
       const codePays = e.id;
       const nb_deaths = get_sum_deaths(dataForYear, year, codePays, list_cause);
       if (nb_deaths > 0) {
         return colorScale(nb_deaths);
       }
       return COLOR_MISSING_DATA;
     })
     .attr("d", d3.geoPath().projection(projection))
     .style("stroke", "#fff")
     .attr("stroke-width", 1)
     .on("mouseover", (e, d) => { geomap_mouseover_country(svg, e, d.id);})
     .on("mouseout", (e, d) => { geomap_mouseout_country(svg, e, d.id);})

  //  draw legend
  var sample = [min_deaths == 0 ? 1 : min_deaths];
  var etapes = [0];
  if (log_scale) {
    var last_x = 0;
    var i = 0;
    for (let x = 1; Math.exp(x) < max_deaths; x = x * 1.02) {
      sample.push(min_deaths + Math.exp(x));
      if (x - last_x > 1) {
        if (i % 2 == 1 && i != 1 && (sample.length - 1) - etapes[etapes.length - 1] >= 10)
          etapes.push(sample.length - 1);
        last_x = x;
        ++i;
      }
    }
  } else {
    var step = (max_deaths - min_deaths) / legend_h;
    for (let x = min_deaths + step; x < max_deaths; x += step)
      sample.push(x);
    for (let i = sample.length / 6; i < sample.length; i += sample.length / 6)
      etapes.push(Math.floor(i))
  }
  sample.push(max_deaths);
  if ((sample.length - 1) - etapes[etapes.length - 1] >= 10)
    etapes.push(sample.length - 1);
  else
    etapes[etapes.length - 1] = sample.length - 1;
  sample.reverse();
  svgLegend.selectAll("line")
     .data(sample).enter()
     .append("line")
     .attr("y1", (_, i) => 10 +i)
     .attr("y2", (_, i) => 10 + i)
     .attr("x1", 10)
     .attr("x2", 10 + legend_w)
     .attr("stroke", c => colorScale(c));

  etapes.forEach((v, i) => {
    var y = v * (sample.length - 1) / etapes[etapes.length - 1];

    svgLegend.append('line')
       .style("stroke", get_text_color())
       .attr("x1", 10 + legend_w)
       .attr("y1", 10 + (sample.length - 1) - y)
       .attr("x2", 10 + legend_w + 5)
       .attr("y2", 10 + (sample.length - 1) - y);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 10 + (sample.length - 1) - y + 4)
       .text(Math.round(sample[sample.length - 1 - v]).toString())
       .style("font-size", "12px")
       .style("fill", get_text_color());

    svgLegend.append("rect")
       .attr("x", 10)
       .attr("y", 10 + sample.length + 10)
       .attr("width", legend_w)
       .attr("height", legend_w)
       .attr("fill", COLOR_MISSING_DATA);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 10 + sample.length + 10 + 10)
       .text("0 or missing data")
       .style("font-size", "12px")
       .style("fill", get_text_color());
  })

  svgLegend.attr("height", 10 + sample.length + 10 + 10 + 10);
}

//  draw geomap by proportion of death
function draw_geo_map_prop(data, list_cause, year, log_scale = false) {
  const margin = ({top: 0, right: 0, bottom: 0, left: 0})

  const w = document.getElementById("geomapw").parentNode.offsetWidth * 0.95;
  const h = w * 0.5375;

  const min_deaths = Math.max(get_min_sum_deaths(data, list_cause), 1.0/10e8);
  const max_deaths = get_max_sum_deaths(data, list_cause);

  const dataForYear = data.filter(e => e.Year.getFullYear() == year);

  const logScale = d3.scaleLog().domain([min_deaths, max_deaths])
  const colorScaleLog = d3.scaleSequential((d) => d3.interpolateReds(logScale(d)))
  const linearScale = d3.scaleLinear().domain([min_deaths, max_deaths])
  const colorScaleLinear = d3.scaleSequential((d) => d3.interpolateReds(linearScale(d)))

  const colorScale = log_scale ? colorScaleLog : colorScaleLinear;

  const legend_h = 7*20;
  const legend_w = 10;

  const svg = d3.select("#geomapw").attr("height", h).attr("width", w)
  const svgLegend = d3.select("#geomap_legend").attr("height", Math.round(legend_h * 1.5), 200);

  //  clear svg
  svg.selectAll('*').remove();
  svgLegend.selectAll("*").remove();
  
  const projection = d3.geoNaturalEarth1()
    .scale((w - margin.right - margin.left) / 5.5)
    .translate([w / 2 - margin.right + margin.left, h / 2])

  var codePays = null;

  //  draw map
  svg.selectAll("path")
     .data(get_data_map().features).enter()
     .append("path")
     .attr("fill", e => {
       const codePays = e.id;
       const nb_deaths = get_sum_deaths(dataForYear, year, codePays, list_cause);
       if (nb_deaths > 0) {
         return colorScale(nb_deaths);
       }
       return COLOR_MISSING_DATA;
     })
     .attr("d", d3.geoPath().projection(projection))
     .style("stroke", "#fff")
     .attr("stroke-width", 1)
     .on("mouseover", (e, d) => { geomap_mouseover_country(svg, e, d.id);})
     .on("mouseout", (e, d) => { geomap_mouseout_country(svg, e, d.id);})

  //  draw legend
  var sample = [min_deaths == 0 ? 1 : min_deaths];
  var etapes = [0];
  if (log_scale) {
    var last_x = 0;
    var i = 0;
    for (let x = 1; Math.exp(x) < max_deaths*10e10; x = x * 1.02) {
      sample.push(min_deaths + Math.exp(x) / 10e10);
      if (x - last_x > 1) {
        if (i % 2 == 1 && i != 1 && (sample.length - 1) - etapes[etapes.length - 1] >= 10)
          etapes.push(sample.length - 1);
        last_x = x;
        ++i;
      }
    }
  } else {
    var step = (max_deaths - min_deaths) / legend_h;
    for (let x = min_deaths + step; x < max_deaths; x += step)
      sample.push(x);
    for (let i = sample.length / 6; i < sample.length; i += sample.length / 6)
      etapes.push(Math.floor(i))
  }
  sample.push(max_deaths);
  if ((sample.length - 1) - etapes[etapes.length - 1] >= 10)
    etapes.push(sample.length - 1);
  else
    etapes[etapes.length - 1] = sample.length - 1;
  sample.reverse();

  svgLegend.selectAll("line")
     .data(sample).enter()
     .append("line")
     .attr("y1", (_, i) => 10 +i)
     .attr("y2", (_, i) => 10 + i)
     .attr("x1", 10)
     .attr("x2", 10 + legend_w)
     .attr("stroke", c => colorScale(c))

  etapes.forEach((v, i) => {
    var y = v * (sample.length - 1) / etapes[etapes.length - 1];

    svgLegend.append('line')
       .style("stroke", get_text_color())
       .attr("x1", 10 + legend_w)
       .attr("y1", 10 + (sample.length - 1) - y)
       .attr("x2", 10 + legend_w + 5)
       .attr("y2", 10 + (sample.length - 1) - y);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 10 + (sample.length - 1) - y + 4)
       .text(sample[sample.length - 1 - v].toFixed(10).toString())
       .style("font-size", "12px")
       .style("fill", get_text_color());

    svgLegend.append("rect")
       .attr("x", 10)
       .attr("y", 10 + sample.length + 10)
       .attr("width", legend_w)
       .attr("height", legend_w)
       .attr("fill", COLOR_MISSING_DATA);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 10 + sample.length + 10 + 10)
       .text("0 or missing data")
       .style("font-size", "12px")
       .style("fill", get_text_color());
  })

  svgLegend.attr("height", 10 + sample.length + 10 + 10 + 10);
}

//  main geomap
function geomap_main() {
  //  List cause js
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("list_cause");

  l.innerHTML =
    '<div class="d-flex flex-row mb-3">'+
    '<div class="col"><input class="btn btn-outline-light btn-sm" type="button" value="Select all" onclick="select_all_causes_geomap();"></div>' +
    '<div class="col"><input class="btn btn-outline-light btn-sm" type="button" value="Sélect first" onclick="select_only_first_causes_geomap();"</div>'+
    '</div>';
  
  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML +=
      '<p><input class="checkbox" type="checkbox" id="geomap-' + list_all_cause[i] + '" ' + (i == 0 ? 'checked' : '') + '>' + list_all_cause[i]+'</p>';
  }

  list_all_cause.forEach(cause => {
    document.getElementById("geomap-" + cause).addEventListener("change",  (ev) => {
      //  garder aux moins une cause coché
      if (get_list_of_selected_cause_geomap().length == 0)
        document.getElementById("geomap-" + cause).checked = true;
        update_geomap();
    })
  });

  //  logscale checkbox js
  var checkbox = document.getElementById("logscale_geomap");

  checkbox.addEventListener("change", (ev) => {
    update_geomap();
  });

  //  logscale checkbox js
  checkbox = document.getElementById("prop_geomap");

  checkbox.addEventListener("change", (ev) => {
    update_geomap();
  });

  update_geomap();

  d3.select("#slider_geomap").node().addEventListener(window.navigator.userAgent.indexOf("MSIE ") ? "change" : "input", (ev) => {
    update_geomap();  
  });

  //  update geomap size automatically
  window.addEventListener('resize', (ev) => {
    const parent1 = document.getElementById("geomapw").parentNode;
    const parent2 = document.getElementById("geomap_legend").parentNode;

    parent1.innerHTML = '';
    parent2.innerHTML = '';

    parent1.innerHTML += '<svg id="geomapw"></svg>';
    parent2.innerHTML += '<svg id="geomap_legend"></svg>';
    update_geomap();
  }, true);
}

