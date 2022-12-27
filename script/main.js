//  data
var DATA_RAW = null;
var DATA_MAP = null;
var ALL_CAUSES = [];
var LIST_CODE = [];
var LIST_YEAR = [];
var MIN_YEAR = 0;
var MAX_YEAR = 0;
var TEXT_COLOR = "#fff";

//  return dataset
function get_data_raw() {
  return DATA_RAW;
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

//  return min year
function get_min_year() {
  return MIN_YEAR;
}

//  return max year
function get_max_year() {
  return MAX_YEAR;
}

//  return text color
function get_text_color() {
  return TEXT_COLOR;
}

//  round by first digit (ex: 123456 => 100000)
function round_by_first_digit(n) {
  var sign = 1;

  if (n < 0)
    sign = -1;

  var n_s = n.toString();
  var tmp = n_s[0] + ".";

  for (let i = 1; i < n_s.length; ++i) {
    tmp += n_s[i];
  }

  var res = Math.round(Number(tmp)) + "";
  for (let i = 0; i < n_s.length - 1; ++i)
    res += "0";

  return Number(res);
}

//  sum death for a line
function get_sum_deaths_line(line, list_cause) {
  var sum = 0;

  list_cause.forEach(cause => sum += line[cause]);

  return sum;
}

//  max sum deaths
function get_max_sum_deaths(data, list_cause) {
  return data.reduce((a, line) => Math.max(get_sum_deaths_line(line, list_cause), a), get_sum_deaths_line(data[0], list_cause));
}

//  min sum deaths
function get_min_sum_deaths(data, list_cause) {
  return data.reduce((a, line) => Math.min(get_sum_deaths_line(line, list_cause), a), get_sum_deaths_line(data[0], list_cause));
}

//  sum deaths by year and country code
function get_sum_deaths(data, year, code, list_cause) {
  var dataForYear = data.filter(e => e.Year.getFullYear() == year);
  var infoPays = dataForYear.filter(e => e.Code == code);

  if (infoPays.length == 0)
    infoPays = {};
  else
    infoPays = infoPays[0];

  var sum = 0;

  for (let i = 0; i < list_cause.length; ++i) {
    sum += infoPays[list_cause[i]];
  }

  return sum;
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

  //  geomap data
  DATA_MAP = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

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
  DATA_RAW.forEach(e => LIST_YEAR.add(e.Year.getFullYear()));
  LIST_YEAR = [...LIST_YEAR];

  //  min and max year
  MIN_YEAR = Math.min(get_list_year());
  MAX_YEAR = Math.max(get_list_year());
}

//  main
async function main() {
  await load_data();

  //  run geomap main
  geomap_main();
}

