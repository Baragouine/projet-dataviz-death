var VISUALIZATION = "GeoMap"

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

var range = [1999,2010]

function getRange() {
  return [...range].sort();
}

function rangeSlide(index, value) {
  range[index] = parseInt(value);

  document.getElementById('rangeValue').innerHTML = '[' + getRange().toString() + ']';
  let text = getRange().toString()
  text = text.replace(',',' à ');
  $("#geomap_titre_date").html(text);
  update_geomap();  
}

var rangeScatter = [1999,2010]

function getRangeScatter() {
  return [...rangeScatter].sort();
}

function rangeSlideScatter(index, value) {
  rangeScatter[index] = parseInt(value);

  document.getElementById('rangeScatterValue').innerHTML = '[' + getRangeScatter().toString() + ']';
  update_scatterplot();
}

function frontMain() {
}
