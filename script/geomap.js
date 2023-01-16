var COLOR_MISSING_DATA = "#888";
var LOCK_COUNTRY = false;
var LAST_ACTION_LOCK_COUNTRY = "none";

//  update geomap
function update_geomap() {
  if (LOCK_COUNTRY)
    return;

  if (document.getElementById("prop_geomap").checked) {
    $("#geomap_titre_mode").html("Proportion");
    draw_geo_map_prop(get_data_prop(), get_list_of_selected_cause_geomap(), getRange(), document.getElementById("logscale_geomap").checked);
  } else {
    $("#geomap_titre_mode").html("Nombre");
    draw_geo_map(get_data_raw(), get_list_of_selected_cause_geomap(), getRange(), document.getElementById("logscale_geomap").checked);
  }
}

//  update info for a country
function show_geomap_info_country(code, name, yearRange, list_cause) {
  if (LOCK_COUNTRY)
    return;

  if (code == null) {
    $("#geomap_info_contry").html(
      `
        <h6></h6>
        <p></p>
      `
    );
    return;
  }

  if (!get_list_code().find(c => c == code)) {
    $("#geomap_info_contry").html(
    `
      <h6>${name} (${code})</h6>
      <p style="font-size: 12px;">No data.</p>
    `);
    return;
  }

  $("#geomap_info_contry").html(
    `
      <h6>${name} (${code})</h6>
      <p style="font-size: 12px;">
        <span class="fw-bold">
          ${get_sum_deaths(get_data_raw(), yearRange, code, list_cause)}
         </span>
        morts sur ${get_population_size(yearRange, code)} (${(get_prop_deaths(get_data_raw(), yearRange, code, list_cause) * 100).toFixed(7)} %) en ${yearRange.toString()}.
      </p>
    `
  );
}

//  on mouse over country
function geomap_mouseover_country(svg, ev, code, name) {
  if (LOCK_COUNTRY)
    return;

  svg.selectAll("path")
     .style("opacity", f => f.id == code ? 1 : 0.2);

  show_geomap_info_country(code, name, getRange(), get_list_of_selected_cause_geomap());
  draw_line_chart_country(code, get_list_of_selected_cause_geomap(), document.getElementById("prop_geomap").checked);
  // $("#geomap_help").html("Cliquer sur un pays pour vérouiller l'affichage dessus.");
}

//  on mouseout country
function geomap_mouseout_country(svg, ev, code) {
  if (LOCK_COUNTRY)
    return;

  svg.selectAll("path")
     .style("opacity", 1);

  show_geomap_info_country(null, null, getRange(), get_list_of_selected_cause_geomap());
  draw_line_chart_country(null, get_list_of_selected_cause_geomap(), document.getElementById("prop_geomap").checked);
  // $("#geomap_help").html("Survolé un pays avec la souris pour avoir plus de détails.")
}

//  on mouse over country
function geomap_mouseclick_country(svg, ev, code, name) {
  setTimeout(() => {
    if (!LOCK_COUNTRY) {
      if (LAST_ACTION_LOCK_COUNTRY == "none") {
        geomap_mouseover_country(svg, ev, code, name);
        LOCK_COUNTRY = true;
        LAST_ACTION_LOCK_COUNTRY = "click";
        // $("#geomap_help").html("Cliquer quelque part pour déverouiller.");
      }
    }
  }, 30);
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
function draw_geo_map(data, list_cause, yearRange, log_scale = false) {
  const margin = ({top: 0, right: 0, bottom: 0, left: 0})

  const w = $("#geomapw").width();;
  const h = w * 0.5375;

  const min_deaths = Math.max(get_min_sum_deaths(data, list_cause), 1);
  const max_deaths = get_max_sum_deaths(data, list_cause) * (document.getElementById("yearAdaptive").checked ? (yearRange[1]-yearRange[0]+1) : 30);

  const dataForYear = data.filter(e => [...Array(yearRange[1]-yearRange[0]+1).keys()].map(i => i + yearRange[0]).includes(e.Year.getFullYear()));

  const logScale = d3.scaleLog().domain([min_deaths, max_deaths])
  const colorScaleLog = d3.scaleSequential((d) => d3.interpolateReds(logScale(d)))
  const linearScale = d3.scaleLinear().domain([min_deaths, max_deaths])
  const colorScaleLinear = d3.scaleSequential((d) => d3.interpolateReds(linearScale(d)))

  const colorScale = log_scale ? colorScaleLog : colorScaleLinear;

  const legend_h = 7*20;
  const legend_w = 10;

  const svg = d3.select("#geomapw").attr("height", h)//.attr("width", w)
  const svgLegend = d3.select("#geomap_legend").attr("height", Math.round(legend_h * 1.5)).attr("width",130);

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
       const nb_deaths = get_sum_deaths(dataForYear, yearRange, codePays, list_cause);
       if (nb_deaths > 0) {
         return colorScale(nb_deaths);
       }
       return COLOR_MISSING_DATA;
     })
     .attr("d", d3.geoPath().projection(projection))
     .style("stroke", "#fff")
     .attr("stroke-width", 1)
     .on("click", (e, d) => { geomap_mouseclick_country(svg, e, d.id, d.properties.name);})
     .on("mouseover", (e, d) => { geomap_mouseover_country(svg, e, d.id, d.properties.name);})
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
     .attr("y1", (_, i) => 30 +i)
     .attr("y2", (_, i) => 30 + i)
     .attr("x1", 10)
     .attr("x2", 10 + legend_w)
     .attr("stroke", c => colorScale(c));

  etapes.forEach((v, i) => {
    var y = v * (sample.length - 1) / etapes[etapes.length - 1];

    svgLegend.append('line')
       .style("stroke", get_text_color())
       .attr("x1", 10 + legend_w)
       .attr("y1", 30 + (sample.length - 1) - y)
       .attr("x2", 10 + legend_w + 5)
       .attr("y2", 30 + (sample.length - 1) - y);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 30 + (sample.length - 1) - y + 4)
       .text(Math.round(sample[sample.length - 1 - v]).toString())
       .style("font-size", "12px")
       .style("fill", get_text_color());

    svgLegend.append("rect")
       .attr("x", 10)
       .attr("y", 30 + sample.length + 10)
       .attr("width", legend_w)
       .attr("height", legend_w)
       .attr("fill", COLOR_MISSING_DATA);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 30 + sample.length + 10 + 10)
       .text("0 or missing data")
       .style("font-size", "12px")
       .style("fill", get_text_color());

    svgLegend.append("text")
       .attr("x", 20)
       .attr("y", 10)
       .style("font-size", "12px")
       .text("nombre de décès")
       .style("fill", get_text_color());
  })

  svgLegend.attr("height", 40 + sample.length + 10 + 10 + 10);
}

//  draw geomap by proportion of death
function draw_geo_map_prop(data, list_cause, yearRange, log_scale = false) {
  console.log(yearRange)
  const margin = ({top: 0, right: 0, bottom: 0, left: 0})

  const w = $("#geomapw").width();
  const h = w * 0.5375;

  const min_deaths = Math.max(get_min_sum_deaths(data, list_cause), 1.0/10e8);
  const max_deaths = get_max_sum_deaths(data, list_cause);

  start()
  const dataForYear = data.filter(e => [...Array(yearRange[1]-yearRange[0]+1).keys()].map(i => i + yearRange[0]).includes(e.Year.getFullYear()));
  end()

  const logScale = d3.scaleLog().domain([min_deaths, max_deaths])
  const colorScaleLog = d3.scaleSequential((d) => d3.interpolateReds(logScale(d)))
  const linearScale = d3.scaleLinear().domain([min_deaths, max_deaths])
  const colorScaleLinear = d3.scaleSequential((d) => d3.interpolateReds(linearScale(d)))

  const colorScale = log_scale ? colorScaleLog : colorScaleLinear;

  const legend_h = 7*20;
  const legend_w = 10;

  const svg = d3.select("#geomapw").attr("height", h)//.attr("width", w)
  const svgLegend = d3.select("#geomap_legend").attr("height", Math.round(legend_h * 1.5)).attr("width",130);

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
       const nb_deaths = get_sum_deaths(dataForYear, yearRange, codePays, list_cause)/(yearRange[1]-yearRange[0]+1);
       if (nb_deaths > 0) {
         return colorScale(nb_deaths);
       }
       return COLOR_MISSING_DATA;
     })
     .attr("d", d3.geoPath().projection(projection))
     .style("stroke", "#fff")
     .attr("stroke-width", 1)
     .on("click", (e, d) => { geomap_mouseclick_country(svg, e, d.id, d.properties.name);})
     .on("mouseover", (e, d) => { geomap_mouseover_country(svg, e, d.id, d.properties.name);})
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
     .attr("y1", (_, i) => 30 +i)
     .attr("y2", (_, i) => 30 + i)
     .attr("x1", 10)
     .attr("x2", 10 + legend_w)
     .attr("stroke", c => colorScale(c))

  etapes.forEach((v, i) => {
    var y = v * (sample.length - 1) / etapes[etapes.length - 1];

    svgLegend.append('line')
       .style("stroke", get_text_color())
       .attr("x1", 10 + legend_w)
       .attr("y1", 30 + (sample.length - 1) - y)
       .attr("x2", 10 + legend_w + 5)
       .attr("y2", 30 + (sample.length - 1) - y);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 30 + (sample.length - 1) - y + 4)
       .text(sample[sample.length - 1 - v].toFixed(10).toString())
       .style("font-size", "12px")
       .style("fill", get_text_color());

    svgLegend.append("rect")
       .attr("x", 10)
       .attr("y", 30 + sample.length + 10)
       .attr("width", legend_w)
       .attr("height", legend_w)
       .attr("fill", COLOR_MISSING_DATA);

    svgLegend.append("text")
       .attr("x", 10 + legend_w + 5 + 3)
       .attr("y", 30 + sample.length + 10 + 10)
       .text("0 or missing data")
       .style("font-size", "12px")
       .style("fill", get_text_color());
  })

  svgLegend.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .style("font-size", "12px")
    .text("proportion de décès")
    .style("fill", get_text_color());

  svgLegend.attr("height", 30 + sample.length + 10 + 10 + 10);
}

//  main geomap
function geomap_main() {
  //  List cause js
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("list_cause");

  l.innerHTML =
    '<div class="d-flex flex-row mb-3" style="text-align: center">'+
      '<div class="col"><input class="btn btn-outline-light btn-sm" type="button" value="Select all" onclick="select_all_causes_geomap();"></div>' +
      '<div class="col"><input class="btn btn-outline-light btn-sm" type="button" value="Sélect first" onclick="select_only_first_causes_geomap();"</div>'+
    '</div>';
  
  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML +=
      '<p class="pList">'+
        '<label for="geomap-' + list_all_cause[i] + '">' + '<input class="checkbox" type="checkbox" id="geomap-' + list_all_cause[i] + '" ' + (i == 0 ? 'checked' : '') + '>'+ list_all_cause[i] + '</label>' +
      '</p>'+
      '<hr class="hrList">';
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
  let checkbox = document.getElementById("logscale_geomap");

  checkbox.addEventListener("change", (ev) => {
    update_geomap();
  });

  //  normalScale checkbox js
  checkbox = document.getElementById("normalScaleGeoMap");

  checkbox.addEventListener("change", (ev) => {
    update_geomap();
  });

  //  proportion checkbox js
  checkbox = document.getElementById("prop_geomap");

  checkbox.addEventListener("change", (ev) => {
    update_geomap();
  });

  $("#yearAdaptive").change(e => {
    update_geomap();
  });

  update_geomap();

  //  date on title
  let text = getRange().toString()
  text = text.replace(',',' à ');
  $("#geomap_titre_date").html(text);

  //  show info country
  show_geomap_info_country(null, getRange(), get_list_of_selected_cause_geomap());
}

