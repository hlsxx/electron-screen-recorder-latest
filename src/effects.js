const sourceNotSelected = document.getElementById("sourceNotSelected");
const closeVideoShare = document.getElementById("closeVideoShare");

function elementToggle(element) {
  if (element.style.display == "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

function sourceSelectedToggle() {
  elementToggle(sourceNotSelected);
}

function closeVideoShareToggle() {
  elementToggle(closeVideoShare);
}