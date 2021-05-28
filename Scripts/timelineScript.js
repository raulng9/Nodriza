$(window).on("load",function() {
    $(window).scroll(function() {
        let bottomOfWindow = $(this).scrollTop() + $(this).innerHeight();
        $(".fade").each(function() {
            let bottomOfContainer = $(this).offset().top + $(this).outerHeight();
            if (bottomOfContainer < bottomOfWindow) {
                if (parseInt($(this).css("opacity"))===0) {$(this).fadeTo(500,1);}
            }
        });
    }).scroll();
});

$(".hoverForReturn").hover(
    function() {
        const backImage = $('#goBackImage');
        const backText = $('#goBackText');
        backImage.addClass("goBackImageHovered");
        backImage.removeClass("goBackImageNotHovered");
        backText.addClass("returnTextHover");
        backText.removeClass("returnTextNotHover");

    }, function() {
        const backImage = $('#goBackImage');
        const backText = $('#goBackText');
        backImage.removeClass("goBackImageHovered");
        backImage.addClass("goBackImageNotHovered");
        backText.removeClass("returnTextHover");
        backText.addClass("returnTextNotHover");
    }
);
