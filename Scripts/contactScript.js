$(".hoverForReturn").hover(
  function() {
    $('#goBackImage').addClass("goBackImageHovered");
    $('#goBackImage').removeClass("goBackImageNotHovered");
    $('#goBackText').addClass("returnTextHover");
    $('#goBackText').removeClass("returnTextNotHover");

  }, function() {
    $('#goBackImage').removeClass("goBackImageHovered");
    $('#goBackImage').addClass("goBackImageNotHovered");
    $('#goBackText').removeClass("returnTextHover");
    $('#goBackText').addClass("returnTextNotHover");
  }
);
