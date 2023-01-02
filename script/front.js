var expanded = false;

function showCheckboxes(id) {
  var checkboxes = document.getElementById(id);
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
  }
}

function rangeSlide(value) {
  document.getElementById('rangeValue').innerHTML = value;

  $("#geomap_titre_date").html($("#slider_geomap").val());
  update_geomap();  
}

function setContent(content) {
  document.getElementById("GeoMap").style.display = 'none';
  document.getElementById("Scatter").style.display = 'none'
  document.getElementById("BarPlot").style.display = 'none'

  if (content == "GeoMap" || content == "Scatter" || content == "BarPlot")
    document.getElementById(content).style.display = 'block';
}

function frontMain() {
  //  select the good page automatically
  var page = window.location.hash;

  if (!!page) {
    id = '';
    for (let i = 2; i < page.length; ++i)
      id += page[i];
    setContent(id);
  } else {
    setContent("GeoMap")
  }
}
