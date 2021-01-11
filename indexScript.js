//Simulate typewriter style
var textToSimulate = $("#mainTitle").text();
var lettersToSimulate = textToSimulate.split("");
var alreadyVisited = localStorage.getItem("already_visited");
let verticalLine = "<div id='verticalLine'></div>";

$(document).ready(function() {
  if(!alreadyVisited){
    localStorage.setItem("already_visited", true);
  }else{
    $("#mainTitle").text("Raúl Núñez García");
    $("#mainTitle").css("display", "block");
    $("li").addClass("linkWithHoverBorder");
    return;
  }
  activateBorders();
  let randomModifier = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
  console.log(randomModifier);
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

function activateBorders(){
  $("li").addClass("linkWithFullBorder");
  setTimeout(function(){ $("li").removeClass("linkWithFullBorder"); }, 2000);
  $("li").addClass("linkWithHoverBorder");
}


function blinkMarker(){
  var fadeTime = 450;
  $("div#verticalLine").fadeOut(fadeTime);
  $("div#verticalLine").fadeIn(fadeTime);
  $("div#verticalLine").fadeOut(fadeTime);
  $("div#verticalLine").fadeIn(fadeTime);
  $("div#verticalLine").fadeOut(fadeTime);
  setTimeout(simulateSelection, fadeTime*5);
}

function simulateSelection(){
  $("p#secondTitle").css("background-color", "rgb(179,216,253)");
  setTimeout(simulateBold, 400);
}

function simulateBold(){
  $("p#secondTitle").css("background-color", "transparent");
  $("p#secondTitle").css("font-weight", "bolder");
}
