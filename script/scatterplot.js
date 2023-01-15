//  generate color scale from selected year
function gen_color_scale(list_year) {
  const list_color = [
    "#943126", "#633974", "#21618c", "#0e6655", "#1d8348", "#9a7d0a", "#873600", "#979a9a", "#5f6a6a", "#212f3c",
    "#e74c3c", "#9b59b6", "#3498db", "#16a085", "#2ecc71", "#f1c40f", "#d35400", "#ecf0f1", "#95a5a6", "#34495e",
    "#f5b7b1", "#d7bde2", "#aed6f1", "#a2d9ce", "#abebc6", "#f9e79f", "#edbb99", "#f7f9f9", "#d5dbdb", "#aeb6bf"
  ];
  var res = new Object();

  var color = 0;

  list_year.forEach((year) => {
    res[year] = list_color[color];
    ++color;
  });

  return res;
}

//  draw scatterplot
function draw_scatterplot(years, countries, cause_x, cause_y, is_proportion, is_log_x, is_log_y) {
  const margin = ({top: 40, right: 50, bottom: 50, left: 100});

  const w = $("#scatterplot").width();
  const h = w;
  const svg = d3.select("#scatterplot").attr("height", h);
  const svgLegend = d3.select("#scatterplot_legend").attr("width", 100);

  const data = filter_data_for_years_for_countries(is_proportion ? get_data_prop() : get_data_raw(), years, countries);

  const eps_x = is_log_x ? 1.0 / 10e8 : 0;
  const eps_y = is_log_y ? 1.0 / 10e8 : 0;

  const min_deaths_x = eps_x + get_min_deaths(data, [cause_x]);
  var max_deaths_x = eps_x + get_max_deaths(data, [cause_x]);
  const min_deaths_y = eps_y + get_min_deaths(data, [cause_y]);
  var max_deaths_y = eps_y + get_max_deaths(data, [cause_y]);

  if (min_deaths_x == max_deaths_x)
    max_deaths_x += is_proportion ? 1.0 / 10e8 : 1;

  if (min_deaths_y == max_deaths_y)
    max_deaths_y += is_proportion ? 1.0 / 10e8 : 1;

  const x  = (is_log_x ? d3.scaleLog() : d3.scaleLinear()).domain([min_deaths_x, max_deaths_x]).range([margin.left, w - margin.right]);
  const y  = (is_log_y ? d3.scaleLog() : d3.scaleLinear()).domain([min_deaths_y, max_deaths_y]).range([h-margin.bottom, margin.top]);

  //  clear svgs
  svg.selectAll('*').remove();
  svgLegend.selectAll('*').remove();

  const xAxis = g => g
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("g")
     .style("font-size", "10px")
     .call(xAxis);

  svg.append("g")
      .style("font-size", "10px")
      .call(yAxis);

  let yearRanges = years.filter(e=> e%5==0 || years.indexOf(e)==0 || years.indexOf(e)==years.length-1)

  const color_scale = gen_color_scale(yearRanges);

  data.forEach((line) => {
    yearIndex = yearRanges.findIndex(y=>y>line.Year.getFullYear())-1;
    if (yearIndex===-2) yearIndex=0;
    svg.append("path")
       .attr("d", d3.symbol().type(d3.symbolCircle).size(30))
       .attr("transform", "translate(" + x(eps_x + get_sum_deaths_line(line, [cause_x])) + "," + y(eps_y + get_sum_deaths_line(line, [cause_y])) + ")")
       .attr("fill", color_scale[yearRanges[yearIndex]]);
  });

  const limit_hl = 10;
  var xl = 0;
  var yl = 0;

  yearRanges.forEach((year, index) => {
    if (index==yearRanges.length-1) return;
    svgLegend.append("text")
      .attr("x", 20 * (xl + 1) + xl * 60)
      .attr("y", 20 + yl * 20)
      .text(year.toString() + "-" + yearRanges[index+1].toString())
      .style("font-size", "12px")
      .style("fill", get_text_color());

    svgLegend.append("path")
      .attr("d", d3.symbol().type(d3.symbolCircle).size(30))
      .attr("transform", "translate(" + (10 * (xl + 1) + xl * 90) + "," +  (16 + yl * 20) + ")")
      .attr("fill", color_scale[year]);

    ++yl;

    if (yl >= limit_hl) {
      ++xl;
      yl = 0;
    }
  });

  svgLegend.attr("width", (xl + 1) * 90 - (yl == 0 ? 90 : 0)).attr("height", limit_hl * 20 + 10)
}

//  get list of selected year
function get_list_of_selected_year_scatterplot() {
  list_year = [...Array(getRangeScatter()[1]-getRangeScatter()[0]+1).keys()].map(i => i + getRangeScatter()[0])

  return list_year;
}

//  get list of selected year
function get_list_of_selected_countries_scatterplot() {
  const list_all_code = get_list_code();
  var list_code = [];

  list_all_code.forEach(code => {
    if (document.getElementById("scatterplot_list_country-" + code).checked)
      list_code.push(code);
  });

  if (list_code.length===0) {
    document.getElementById("scatterplot_list_country-AFG").checked = true;
    list_code.push("AFG");
  }

  return list_code;
}

function selectContinent(continent) {
  let newState = !(CONTINENT_SELECTED[continent]);
  CONTINENT_SELECTED[continent] = newState;
  DATA_CONTINENT.forEach(c => {
    if (c.region==continent || continent=="All") {
      box = document.getElementById("scatterplot_list_country-" + c["alpha-3"])
      if (box) box.checked = newState;
    }
  })
  update_scatterplot();
}

//  update scatterplot
function update_scatterplot() {
  draw_scatterplot(get_list_of_selected_year_scatterplot(),
                  get_list_of_selected_countries_scatterplot(),
                  $("#scatterplot_list_cause_x").val(),
                  $("#scatterplot_list_cause_y").val(),
                  document.getElementById("scatterplot_proportion").checked,
                  false,
                  false);
}

//  init list year
function init_scatterplot_list_year() {
  const list_all_years = get_list_year();
  list_all_years.sort();
  var l = document.getElementById("scatterplot_list_year");

  l.innerHTML = '';
  
  for (let i = 0; i < list_all_years.length; ++i) {
    l.innerHTML +=
      '<p style="margin:0; display="flex">'+
        '<label for="scatterplot_list_year-' + list_all_years[i] + '">'+
          '<input class="checkbox" type="checkbox" id="scatterplot_list_year-' + list_all_years[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
           list_all_years[i] + 
        '</label>' +
      '</p>'+
      '<hr class="hrList">';
  }

  list_all_years.forEach(cause => {
    document.getElementById("scatterplot_list_year-" + cause).addEventListener("change",  (ev) => {
      //  garder aux moins une cause coché
      if (get_list_of_selected_cause_geomap().length == 0)
        document.getElementById("scatterplot_list_year-" + cause).checked = true;
        update_scatterplot();
    })
  });
}

//  init list country
function init_scatterplot_list_country() {
  const list_all_code = get_list_code();
  list_all_code.sort((a, b) => {
    const name_a = get_data_grouped_by_code()[a][0]["Country/Territory"];
    const name_b = get_data_grouped_by_code()[b][0]["Country/Territory"];

    if (name_a < name_b)
      return -1;
    else if (name_a > name_b)
      return 1;
    return 0;
  });
  var l = document.getElementById("scatterplot_list_country");

  l.innerHTML = '';
  
  for (let i = 0; i < list_all_code.length; ++i) {
    l.innerHTML +=
      '<p class="pList">'+
        '<label for="scatterplot_list_country-' + list_all_code[i] + '">' +
          '<input class="checkbox" type="checkbox" id="scatterplot_list_country-' + list_all_code[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
          get_data_grouped_by_code()[list_all_code[i]][0]["Country/Territory"]; +
        '</label>' +
      '</p>'+
      '<hr class="hrList">';
  }

  list_all_code.forEach(cause => {
    document.getElementById("scatterplot_list_country-" + cause).addEventListener("change",  (ev) => {
      //  garder aux moins une cause coché
      if (get_list_of_selected_cause_geomap().length == 0)
        document.getElementById("scatterplot_list_country-" + cause).checked = true;
        update_scatterplot();
    })
  });
}

//  init scatterplot list cause x
function init_scatterplot_list_cause_x() {
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("scatterplot_list_cause_x");

  l.innerHTML = '';

  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML += '<option value="' + list_all_cause[i] + '">' + list_all_cause[i] + '</option>';
  }
}

//  init scatterplot list cause x
function init_scatterplot_list_cause_y() {
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("scatterplot_list_cause_y");

  l.innerHTML = '';

  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML += '<option value="' + list_all_cause[i] + '">' + list_all_cause[i] + '</option>';
  }

}

//  init input
function init_scatterplot_input() {
  init_scatterplot_list_cause_x();
  init_scatterplot_list_cause_y();
  init_scatterplot_list_year();
  init_scatterplot_list_country();

  //  % proportion
  var checkbox = document.getElementById("scatterplot_proportion");
  checkbox.addEventListener("change", (ev) => {
    update_scatterplot();
  });
}

//  scatterplot
function scatterplot_main() {
  init_scatterplot_input();
  update_scatterplot();
}

//  on list x change
function onScatterPlotListCauseXChange() {
  update_scatterplot();
}

//  on list y change
function onScatterPlotListCauseYChange() {
  update_scatterplot();
}

