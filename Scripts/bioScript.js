$(document).ready(function() {
    simulateLinking();
    photoAnimation();
});

function simulateLinking(){
    const proyects = $("a#proyectsLink");
    proyects.css("text-decoration", "underline");
    proyects.css("color", "#2980b9");
}

function photoAnimation(){
    $('.spin').addClass("spinning");
    setTimeout(1000, animateImageFade());
}

function animateImageFade(){
    const photography = $("#photoBio");
    photography.addClass("photoFadeIn");
    photography.addClass("saturatePhoto");
}