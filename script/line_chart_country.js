//  draw
function draw_line_chart_country(code, list_cause, prop = false, logscale=false) {
  if (LOCK_COUNTRY)
    return;

  const margin = ({top: 20, right: 2, bottom: 50, left: 80});

  const svg = d3.select("#line_chart_country");

  svg.selectAll('*').remove();

  //  unknown code or invalid code.
  if (code == null || !get_list_code().find(c => c == code))
    return;

  const w = svg.node().getBoundingClientRect().width;
  const h = svg.node().getBoundingClientRect().height;

  const data = get_data_grouped_by_code()[code].sort((a, b) => a.Year - b.Year);
  const min_deaths =
    prop ? get_min_prop_deaths_for_country(data, code, list_cause) : get_min_sum_deaths_for_country(data, code, list_cause);
  const max_deaths =
    prop ? get_max_prop_deaths_for_country(data, code, list_cause) : get_max_sum_deaths_for_country(data, code, list_cause);

  const x = d3.scaleTime().domain([get_min_year_raw(), get_max_year_raw()]).range([margin.left, w - margin.right]);
  const yLinear = d3.scaleLinear().domain([min_deaths, max_deaths]).range([h - margin.bottom, margin.top]);
  const yLogScale = d3.scaleLog().domain([min_deaths, max_deaths]).range([h - margin.bottom, margin.top]);
  const y = logscale ? yLogScale : yLinear;

  const xAxis = g => g
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5))

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  svg.append("g")
     .style("font-size", "8px")
     .call(xAxis);

  svg.append("g")
      .style("font-size", "8px")
      .call(yAxis);

  svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "red")
       .attr("stroke-width", 1.5)
       .attr("d", d3.line()
                    .x(d => x(d.Year))
                    .y(d => y(prop ? get_prop_deaths_line(d, list_cause) : get_sum_deaths_line(d, list_cause))));

  svg.append("text")
     .attr("x", 25)
     .attr("y", 10)
     .style("font-size", "12px")
     .text(prop ? "proportion de mort" : "nombre de décès")
     .style("fill", get_text_color());

  svg.append("text")
     .attr("x", w - 100)
     .attr("y", h - margin.bottom + 30)
     .style("font-size", "12px")
     .text("date")
     .style("fill", get_text_color());
}

//  main
function line_chart_country_main() {
}