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
  document.getElementById(content).style.display = 'block';
}

function frontMain() {
  setContent("GeoMap")
}
