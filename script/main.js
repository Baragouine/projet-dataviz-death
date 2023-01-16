//  data
var DATA_RAW = null;
var DATA_PROP = null;
var DATA_GROUPED_BY_CODE = new Object();
var DATA_PROP_GROUPED_BY_CODE = new Object();
var DATA_MAP = null;
var DATA_CONTINENT = null;
var CONTINENT_SELECTED = {}
var ALL_CAUSES = [];
var LIST_CODE = [];
var LIST_YEAR = [];
var LIST_YEAR_RAW = [];
var MIN_YEAR = 0;
var MAX_YEAR = 0;
var MIN_YEAR_RAW = 0;
var MAX_YEAR_RAW = 0;
var TEXT_COLOR = "#fff";

var startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  console.log(timeDiff + " ms");
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
}

//  return dataset
function get_data_raw() {
  return DATA_RAW;
}

//  return data grouped by code
function get_data_grouped_by_code() {
  return DATA_GROUPED_BY_CODE;
}

//  return dataset (proportion of deaths)
function get_data_prop() {
  return DATA_PROP;
}

//  return data (proportion) grouped by code
function get_data_prop_grouped_by_code() {
  return DATA_PROP_GROUPED_BY_CODE;
}

//  return data of geomap
function get_data_map() {
  return DATA_MAP;
}

//  return all list of causes
function get_all_causes() {
  return ALL_CAUSES;
}

//  return list code
function get_list_code() {
  return LIST_CODE;
}

//  return list year
function get_list_year() {
  return LIST_YEAR;
}

//  return list year raw
function get_list_year_raw() {
  return LIST_YEAR_RAW;
}

//  return min year
function get_min_year() {
  return MIN_YEAR;
}

//  return max year
function get_max_year() {
  return MAX_YEAR;
}

//  return min year
function get_min_year_raw() {
  return MIN_YEAR_RAW;
}

//  return max year
function get_max_year_raw() {
  return MAX_YEAR_RAW;
}

//  return text color
function get_text_color() {
  return TEXT_COLOR;
}

//  sum death for a line
function get_sum_deaths_line(line, list_cause) {
  var sum = 0;

  list_cause.forEach(cause => sum += line[cause]);

  return sum;
}

//  return population size
function get_population_size(yearRange, code) {
  const data = get_data_grouped_by_code();
  const dataForCode = data[code];
  const line = dataForCode.filter(l => [...Array(yearRange[1]-yearRange[0]+1).keys()].map(i => i + yearRange[0]).includes(l.Year.getFullYear()));

  if (line.length == 0)
    return NaN;

  return line[0].Population;
}

//  proportion of a death for a line
function get_prop_deaths_line(line, list_cause) {
  var sum = 0;

  list_cause.forEach(cause => sum += line[cause]);

  return sum / line.Population;
}

//  max deaths
function get_max_deaths(data = get_data_raw(), list_cause) {
  return data.reduce((a, line) => Math.max(get_sum_deaths_line(line, list_cause), a), get_sum_deaths_line(data[0], list_cause));
}

//  max sum deaths
function get_max_sum_deaths(data = get_data_raw(), list_cause) {
  return data.reduce((a, line) => Math.max(get_sum_deaths_line(line, list_cause), a), get_sum_deaths_line(data[0], list_cause));
}

//  max proportion deaths
function get_max_prop_deaths(data = get_data_prop(), list_cause) {
  return data.reduce((a, line) => Math.max(get_prop_deaths_line(line, list_cause), a), get_prop_deaths_line(data[0], list_cause));
}

//  min deaths
function get_min_deaths(data = get_data_raw(), list_cause) {
  return data.reduce((a, line) => Math.min(get_sum_deaths_line(line, list_cause), a), get_sum_deaths_line(data[0], list_cause));
}

//  min sum deaths
function get_min_sum_deaths(data = get_data_raw(), list_cause) {
  return data.reduce((a, line) => Math.min(get_sum_deaths_line(line, list_cause), a), get_sum_deaths_line(data[0], list_cause));
}

//  min proportion deaths
function get_min_prop_deaths(data = get_data_prop(), list_cause) {
  return data.reduce((a, line) => Math.min(get_prop_deaths_line(line, list_cause), a), get_prop_deaths_line(data[0], list_cause));
}

//  min sum deaths for country
function get_min_sum_deaths_for_country(data = get_data_raw(), code, list_cause) {
  const dataForCode = data.filter(l => l.Code == code);
  return get_min_sum_deaths(dataForCode, list_cause);
}

//  min prop deaths for country
function get_min_prop_deaths_for_country(data = get_data_prop(), code, list_cause) {
  const dataForCode = data.filter(l => l.Code == code);
  return get_min_prop_deaths(dataForCode, list_cause);
}

//  max sum deaths for country
function get_max_sum_deaths_for_country(data = get_data_raw(), code, list_cause) {
  const dataForCode = data.filter(l => l.Code == code);
  return get_max_sum_deaths(dataForCode, list_cause);
}

//  max prop deaths for country
function get_max_prop_deaths_for_country(data = get_data_prop(), code, list_cause) {
  const dataForCode = data.filter(l => l.Code == code);
  return get_max_prop_deaths(dataForCode, list_cause);
}

//  sum deaths by year and country code
function get_sum_deaths(data = get_data_raw(), yearRange, code, list_cause) {
  var dataForYear = data.filter(e => [...Array(yearRange[1]-yearRange[0]+1).keys()].map(i => i + yearRange[0]).includes(e.Year.getFullYear()));
  var infoPays = dataForYear.filter(e => e.Code == code);

  var sum = 0;

  for (let i = 0; i < list_cause.length; ++i) {
    for (let p = 0; p < infoPays.length; ++p) {
      sum += infoPays[p][list_cause[i]];
    }
  }

  return sum;
}

//  Proportion of deaths by year and country code
function get_prop_deaths(data, yearRange, code, list_cause) {
  var dataForYear = data.filter(e => [...Array(yearRange[1]-yearRange[0]+1).keys()].map(i => i + yearRange[0]).includes(e.Year.getFullYear()));
  var infoPays = dataForYear.filter(e => e.Code == code);

  if (infoPays.length == 0)
    return 0;

  infoPays = infoPays[0];

  var sum = 0;

  for (let i = 0; i < list_cause.length; ++i) {
    sum += infoPays[list_cause[i]];
  }

  return sum / infoPays.Population;
}

//  load data
async function load_data() {
  //  dataset
  DATA_RAW = await d3.csv("https://raw.githubusercontent.com/Baragouine/visualization-number-of-deaths-by-cause-around-world-per-year/main/data/cause_of_deaths_with_population.csv",
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
  )

  DATA_PROP = await d3.csv("https://raw.githubusercontent.com/Baragouine/visualization-number-of-deaths-by-cause-around-world-per-year/main/data/cause_of_deaths_with_population.csv",
    d => {
      for (const property in d) {
        if (property != "Country/Territory" &&
          property != "Code" &&
          property != "Year") {
          d[property] = +d[property];
          if (property != "Population") {
            d[property] = d[property] / +d["Population"];
            if (d[property] > 1) {
              d[property] = 0;
            }
          }
          if (isNaN(d[property])) {
            d[property] = 0;
          }
        }
      }
      d["Year"] = d3.utcParse("%Y")(d["Year"])
      return d
    }
  )

  //  geomap data
  DATA_MAP = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

  // continent data
  DATA_CONTINENT = await d3.json("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json");
  CONTINENT_SELECTED = DATA_CONTINENT.map(c => c.region)
                        .filter((item, index) => DATA_CONTINENT.map(c => c.region).indexOf(item) === index)
                        .map(c=>{c:false});
  CONTINENT_SELECTED.All = false;

  //  list of all causes
  for (const property in DATA_RAW[0]) {
    if (property != "Country/Territory" &&
      property != "Code" &&
      property != "Year" &&
      property != "Population") {
      ALL_CAUSES.push(property);
    }
  }

  //  list of codes
  LIST_CODE = new Set();
  DATA_RAW.forEach(e => LIST_CODE.add(e.Code));
  LIST_CODE = [...LIST_CODE];

  //  list of years
  LIST_YEAR = new Set();
  DATA_RAW.forEach(e => LIST_YEAR.add(+e.Year.getFullYear()));
  LIST_YEAR = [...LIST_YEAR];

  LIST_YEAR_RAW = new Set();
  DATA_RAW.forEach(e => LIST_YEAR_RAW.add(+e.Year));
  LIST_YEAR_RAW = [...LIST_YEAR_RAW];

  //  min and max year
  MIN_YEAR = Math.min(...get_list_year());
  MAX_YEAR = Math.max(...get_list_year());
  MIN_YEAR_RAW = Math.min(...get_list_year_raw());
  MAX_YEAR_RAW = Math.max(...get_list_year_raw());

  //  data grouped by country code
  get_list_code().forEach(c => {
    DATA_GROUPED_BY_CODE[c] = get_data_raw().filter(line => line.Code == c);
    DATA_PROP_GROUPED_BY_CODE[c] = get_data_prop().filter(line => line.Code == c);
  });
}

//  update the good visualization
function update_good_visualization() {
  LOCK_COUNTRY = false;
  update_scatterplot();
  update_CountryDetails();
  update_geomap();
}

// 
function getTopCausesByCountries(data, countries) {
  let dataFiltered = {}

  data.filter((l) => {
    for (let i = 0; i < countries.length; ++i) {
      if (l.Code == countries[i])
        return true;
    }
    return false;
  }).forEach(e => {
    Object.keys(e).forEach(k => {
      if (k!="Code" && k!="Year" && k!="Country/Territory" && k!="Population") {
        dataFiltered[k] = (dataFiltered[k] ? dataFiltered[k] : 0) + e[k]
      }
    })
  });

  dataFiltered["top"] = Object.keys(dataFiltered).sort((a, b) =>  dataFiltered[b] - dataFiltered[a]);

  return dataFiltered;
}

// 
function getDeathsOfYearsByCountries(data, countries, is_proportion = false) {
  let dataFiltered = {}

  data.filter((l) => {
    for (let i = 0; i < countries.length; ++i) {
      if (l.Code == countries[i])
        return true;
    }
    return false;
  }).forEach(e => {
    get_all_causes().forEach(c => {
      dataFiltered[e.Year.getFullYear()] = ((dataFiltered[e.Year.getFullYear()] ? dataFiltered[e.Year.getFullYear()] : 0) + e[c]) / (is_proportion ? countries.length : 1)
    })
  });

  return dataFiltered;
}

//  filter data for years and for countries
function filter_data_for_years_for_countries(data, years, countries) {
  const dataFileredYears = data.filter((l) => {
    for (let i = 0; i < years.length; ++i) {
      if (l.Year.getFullYear() == years[i])
        return true;
    }

    return false;
  });

  return dataFileredYears.filter((l) => {
    for (let i = 0; i < countries.length; ++i) {
      if (l.Code == countries[i])
        return true;
    }

    return false;
  });
}

//  main
async function main() {
  await load_data();

  //  run geomap main
  geomap_main();

  //  run line chart main
  line_chart_country_main();

  //  scatterplot
  scatterplot_main();

  //  CountryDetails
  CountryDetails_main();

  //  click
  $(document).on('click', () => {
    if (LOCK_COUNTRY) {
      LOCK_COUNTRY = false;
      LAST_ACTION_LOCK_COUNTRY = "unlock";
      geomap_mouseout_country(d3.select("#geomapw"), null, null);
    } else {
      LAST_ACTION_LOCK_COUNTRY = "none";
    }
  });

  //  update visualisation size automatically
  window.addEventListener('resize', (ev) => {
    update_good_visualization();
  }, true);
}

