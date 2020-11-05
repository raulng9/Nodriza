//Simulate typewriter style
var textToSimulate = $("#mainTitle").text();
var lettersToSimulate = textToSimulate.split("");

let verticalLine = "<div id='verticalLine'></div>";

$(document).ready(function() {
  let randomModifier = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
  console.log(randomModifier);
  var typewriterMark = "I";
  lettersToSimulate.forEach(function enterSlowly(element, index, array){
    setTimeout(function(){
      if(index != 0){
        $("#verticalLine").remove();
      }
      var textToAppend = element + verticalLine;
      $("#secondTitle").append(element + verticalLine);
      if(index == lettersToSimulate.length -1){
        blinkMarker();
      }
    }, randomModifier*index);
  });
});

function blinkMarker(){
  var fadeTime = 400;
  $("div#verticalLine").fadeOut(fadeTime);
  $("div#verticalLine").fadeIn(fadeTime);
  $("div#verticalLine").fadeOut(fadeTime);
  $("div#verticalLine").fadeIn(fadeTime);
  $("div#verticalLine").fadeOut(fadeTime);
  $("div#verticalLine").fadeIn(fadeTime);
  $("div#verticalLine").fadeOut(fadeTime);
  setTimeout(simulateSelection, fadeTime*7);
}

function simulateSelection(){
  $("p#secondTitle").css("background-color", "rgb(179,216,253)");
  setTimeout(simulateBold, 400);
}

function simulateBold(){
  $("p#secondTitle").css("background-color", "transparent");
  $("p#secondTitle").css("font-weight", "bolder");
}
