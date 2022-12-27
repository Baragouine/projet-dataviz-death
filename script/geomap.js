//  update geomap
function update_geomap() {
  draw_geo_map(get_data_raw(), get_list_of_selected_cause_geomap(), $("#slider_geomap").val(), document.getElementById("logscale_geomap").checked);
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
  const margin = ({top: 0, right: 200, bottom: 0, left: 0})
  const w = 800
  const h = 400

  const min_deaths = Math.max(get_min_sum_deaths(data, list_cause), 1);
  const max_deaths = get_max_sum_deaths(data, list_cause);
  
  const dataForYear = data.filter(e => e.Year.getFullYear() == year);

  const logScale = d3.scaleLog().domain([min_deaths, max_deaths])
  const colorScaleLog = d3.scaleSequential((d) => d3.interpolateReds(logScale(d)))
  const linearScale = d3.scaleLinear().domain([min_deaths, max_deaths])
  const colorScaleLinear = d3.scaleSequential((d) => d3.interpolateReds(linearScale(d)))

  const colorScale = log_scale ? colorScaleLog : colorScaleLinear;
  
  const svg = d3.select("#geomapw").attr("height", h).attr("width", w)
  
  //  clear svg
  svg.selectAll('*').remove()
  
  const projection = d3.geoNaturalEarth1()
    .scale((w - margin.right - margin.left) / 5.5)
    .translate([w / 2 - margin.right + margin.left, h / 2])

  //  draw map
  svg.selectAll("path")
     .data(get_data_map().features).enter().append("path")
     .attr("fill", e => {
       const codePays = e.id;
       const nb_deaths = get_sum_deaths(dataForYear, year, codePays, list_cause);
       if (nb_deaths > 0) {
         return colorScale(nb_deaths);
       }
       return "#ccc";
     })
     .attr("d", d3.geoPath().projection(projection))
  .style("stroke", "#fff")

  //  draw legend
  var legend_h = 7*20;
  var legend_w = 10;
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

  svg.selectAll("line")
     .data(sample).enter()
     .append("line")
     .attr("y1", (_, i) => 20 + i)
     .attr("y2", (_, i) => 20 + i)
     .attr("x1", w - margin.right + 10)
     .attr("x2", w - margin.right + 10 + legend_w)
     .attr("stroke", c => colorScale(c))

  etapes.forEach((v, i) => {
    var y = v * (sample.length - 1) / etapes[etapes.length - 1];

    svg.append('line')
       .style("stroke", get_text_color())
       .attr("x1", w - margin.right + 10 + legend_w)
       .attr("y1", 20 + (sample.length - 1) - y)
       .attr("x2", w - margin.right + 10 + legend_w + 5)
       .attr("y2", 20 + (sample.length - 1) - y);

    svg.append("text")
       .attr("x", w - margin.right + 10 + legend_w + 5 + 3)
       .attr("y", 20 + (sample.length - 1) - y + 4)
       .text(round_by_first_digit(Math.round(sample[Math.max(0, Math.min(sample.length - v, sample.length - 1))])).toString())
       .style("font-size", "12px")
       .style("fill", get_text_color());

    svg.append("rect")
       .attr("x", w - margin.right + 10)
       .attr("y", 20 + 150)
       .attr("width", legend_w)
       .attr("height", legend_w)
       .attr("fill", "#ccc");

    svg.append("text")
       .attr("x", w - margin.right + 10 + legend_w + 5 + 3)
       .attr("y", 20 + 150 + 10)
       .text("0 ou données absentes")
       .style("font-size", "12px")
       .style("fill", get_text_color());
  })
}

//  main geomap
function geomap_main() {
  //  List cause js
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("list_cause");

  l.innerHTML =
    '<li><input type="button" value="Tout sélectionner" onclick="select_all_causes_geomap();"></li>' +
    '<li><input type="button" value="Sélectionner seulement la première" onclick="select_only_first_causes_geomap();"</li>';
  
  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML +=
      '<li><input type="checkbox" id="geomap-' + list_all_cause[i] + '" ' + (i == 0 ? 'checked' : '') + '>' + list_all_cause[i] + '</li>';
  }

  list_all_cause.forEach(cause => {
    document.getElementById("geomap-" + cause).addEventListener("change",  (ev) => {
      //  garder aux moins une cause coché
      if (get_list_of_selected_cause_geomap().length == 0)
        document.getElementById("geomap-" + cause).checked = true;
      draw_geo_map(get_data_raw(), get_list_of_selected_cause_geomap(), $("#slider_geomap").val(), document.getElementById("logscale_geomap").checked)
    })
  });
  
  var checkList = document.getElementById('list_cause_parent');
  checkList.getElementsByClassName('anchor')[0].onclick = function(evt) {
    if (checkList.classList.contains('visible'))
      checkList.classList.remove('visible');
    else
      checkList.classList.add('visible');
  }

  //  logscale checkbox js
  var checkbox = document.getElementById("logscale_geomap");

  checkbox.addEventListener("change", (ev) => {
    update_geomap();
  });

  update_geomap();

  d3.select("#slider_geomap").node().addEventListener(window.navigator.userAgent.indexOf("MSIE ") ? "change" : "input", (ev) => {
    update_geomap();  
  });
}

