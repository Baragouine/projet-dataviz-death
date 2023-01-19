//  draw scatterplot
function draw_CountryDetails(countries, is_proportion) {
  const margin = ({top: 40, right: 50, bottom: 50, left: 100});

  const w = $("#CountryDetailsTopCauses").width();
  const h = w;
  const svg = d3.select("#CountryDetailsTopCauses").attr("height", h);

  const data = getTopCausesByCountries(get_data_raw(), countries);

  const min_deaths_x = data[data.top[data.top.length-1]];
  var max_deaths_x = data[data.top[0]];

  if (min_deaths_x == max_deaths_x)
    max_deaths_x += 1;

  const x  = d3.scaleLinear().domain([min_deaths_x, max_deaths_x]).range([margin.left, w - margin.right]);
  const y  = d3.scaleLinear().domain([1, 10]).range([h-margin.bottom, margin.top]);

  //  clear svgs
  svg.selectAll('*').remove();

  const xAxis = g => g
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("g")
     .style("font-size", "10px")
     .call(xAxis);

  svg.append('line')
    .style("stroke", get_text_color())
    .style("stroke-width", 1)
    .attr("x1", x(0))
    .attr("y1", y(1))
    .attr("x2", x(0))
    .attr("y2", y(10.6));
  // svg.append("g")
  //     .style("font-size", "10px")
  //     .call(yAxis);

  // const color_scale = gen_color_scale(years);
  let firstK = "";

  data.top.slice(0, 10).forEach((k, index) => {
    let line = data[k];

    if (firstK == "")
      firstK = k;

    svg.append("rect")
      .attr("x", x(0))
      .attr("y", y(10-index)+((y(1)-y(0))/2))
      .attr("width", x(line)-x(0))
      .attr("height", (y(0)-y(1))/2)
      .attr("fill", "#606060")
      .attr("stroke", "#606060");

    firstLine = data[firstK];

    svg.append("rect")
      .attr("x", x(0))
      .attr("y", y(10-index)+((y(1)-y(0))/2))
      .attr("width", x(firstLine)-x(0))
      .attr("height", (y(0)-y(1))/2)
      .attr("fill", "none")
      .attr("stroke", "#DDDDDD");

    svg.append("text")
      .attr("x", x((max_deaths_x-min_deaths_x)/4))
      .attr("y", y(10-index) + ((y(1)-y(0))/8) - 4)
      .text(k)
      .style("font-size", "12px")
      .style("fill", get_text_color());
  });

  draw_CountryDetailsYears(countries, is_proportion)
}

function draw_CountryDetailsYears(countries, is_proportion) {
  const margin = ({top: 40, right: 50, bottom: 50, left: 100});

  const w = $("#CountryDetailsByYear").width();
  const h = w;
  const svg = d3.select("#CountryDetailsByYear").attr("height", h);

  const data = getDeathsOfYearsByCountries(get_data_raw(), countries);
  if (is_proportion) {
    let totalPop = {};
    let dataCountries = get_data_grouped_by_code();
    countries.forEach(c => {
      dataCountries[c].forEach(dC=>{
        totalPop[dC.Year.getFullYear()] = (totalPop[dC.Year.getFullYear()] ? totalPop[dC.Year.getFullYear()] : 0) + dC.Population;
      })
    })
    Object.keys(data).forEach(year=>{
      data[year] = 100*data[year]/totalPop[year];
    })
  }

  let min_deaths = Math.min(...(Object.keys(data).map(k=>data[k])));
  let max_deaths = Math.max(...(Object.keys(data).map(k=>data[k])));

  if (min_deaths == max_deaths)
    max_deaths += 1;

  const x  = d3.scaleTime().domain([new Date(1990, 0), new Date(2020, 0)]).range([margin.left, w - margin.right]);
  const y  = d3.scaleLinear().domain([min_deaths, max_deaths]).range([h-margin.bottom, margin.top]);

  //  clear svgs
  svg.selectAll('*').remove();

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

  // const color_scale = gen_color_scale(years);

  Object.keys(data).forEach((year) => {
    svg.append("rect")
      .attr("x", x(new Date(year, 0)))
      .attr("y", y(data[year]))
      .attr("width", x(new Date(2, 0))-x(new Date(1, 0)))
      .attr("height", y(min_deaths)-y(data[year]))
      .attr("fill", "#606060")
      .attr("stroke", "#DDDDDD")
  });
}

function get_list_of_selected_countries_CountryDetails() {
  const list_all_code = get_list_code();
  var list_code = [];

  list_all_code.forEach(code => {
    if (document.getElementById("CountryDetails_list_country-" + code).checked)
      list_code.push(code);
  });

  if (list_code.length===0) {
    document.getElementById("CountryDetails_list_country-AFG").checked = true;
    list_code.push("AFG");
  }

  return list_code;
}

function selectContinentCountryDetails(continent) {
  let newState = !(CONTINENT_SELECTED[continent]);
  CONTINENT_SELECTED[continent] = newState;
  DATA_CONTINENT.forEach(c => {
    if (c.region==continent || continent=="All") {
      box = document.getElementById("CountryDetails_list_country-" + c["alpha-3"])
      if (box) box.checked = newState;
    }
  })
  update_CountryDetails();
}

//  update CountryDetails
function update_CountryDetails() {
  draw_CountryDetails(get_list_of_selected_countries_CountryDetails(),
                  document.getElementById("CountryDetails_proportion").checked);
}

//  init list country
function init_CountryDetails_list_country() {
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
  var l = document.getElementById("CountryDetails_list_country");

  l.innerHTML = '';
  
  for (let i = 0; i < list_all_code.length; ++i) {
    l.innerHTML +=
      '<p class="pList">'+
        '<label for="CountryDetails_list_country-' + list_all_code[i] + '">' +
          '<input class="checkbox" type="checkbox" id="CountryDetails_list_country-' + list_all_code[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
          get_data_grouped_by_code()[list_all_code[i]][0]["Country/Territory"]; +
        '</label>' +
      '</p>'+
      '<hr class="hrList">';
  }

  list_all_code.forEach(cause => {
    document.getElementById("CountryDetails_list_country-" + cause).addEventListener("change",  (ev) => {
      update_CountryDetails();
    })
  });
}

//  init input
function init_CountryDetails_input() {
  init_CountryDetails_list_country();

  //  % proportion
  var checkbox = document.getElementById("CountryDetails_proportion");
  checkbox.addEventListener("change", (ev) => {
    update_CountryDetails();
  });

  // //  log x event handler
  // checkbox = document.getElementById("scatterplot_log_x");

  // checkbox.addEventListener("change", (ev) => {
  //   update_scatterplot();
  // });

  // //  log y event handler
  // checkbox = document.getElementById("scatterplot_log_y");

  // checkbox.addEventListener("change", (ev) => {
  //   update_scatterplot();
  // });
}

//  scatterplot
function CountryDetails_main() {
  init_CountryDetails_input();
  update_CountryDetails();
}
