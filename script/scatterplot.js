//  update scatterplot
function update_scatterplot() {
  const w = $("#geomapw").width();
  const h = w;
  const svg = d3.select("#geomapw").attr("height", h);

  console.log("Scatterplot");
}

//  init list year
function init_scatterplot_list_year() {
  const list_all_years = get_list_year();
  list_all_years.sort();
  var l = document.getElementById("scatterplot_list_year");

  l.innerHTML = '';
  
  for (let i = 0; i < list_all_years.length; ++i) {
    l.innerHTML +=
      '<p>'+
        '<input class="checkbox" type="checkbox" id="scatterplot_list_year-' + list_all_years[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
        '<label for="scatterplot_list_year-' + list_all_years[i] + '">' + list_all_years[i] + '</label>' +
      '</p>'+
      '<hr>';
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
      '<p>'+
        '<input class="checkbox" type="checkbox" id="scatterplot_list_country-' + list_all_code[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
        '<label for="scatterplot_list_country-' + list_all_code[i] + '">' +
          get_data_grouped_by_code()[list_all_code[i]][0]["Country/Territory"]; +
        '</label>' +
      '</p>'+
      '<hr>';
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

  //  log x event handler
  var checkbox = document.getElementById("scatterplot_log_x");

  checkbox.addEventListener("change", (ev) => {
    update_scatterplot();
  });

  //  log y event handler
  checkbox = document.getElementById("scatterplot_log_y");

  checkbox.addEventListener("change", (ev) => {
    update_scatterplot();
  });
}

//  scatterplot
function scatterplot_main() {
  init_scatterplot_input();
}

//  on list x change
function onScatterPlotListCauseXChange() {

}

//  on list y change
function onScatterPlotListCauseYChange() {

}


