(function ($) {
    $.fn.invisible = function () {
        return this.each(function () {
            $(this).css("transform", "translateX(-90%)");
        });
    };
    $.fn.visible = function () {
        return this.each(function () {
            $(this).css("transform", "translateX(0%)");
        });
    };
}(jQuery));

$("#nav1").invisible();

(function () {
    $(document).mousemove(function (e) {
        mY = e.pageX;
        if (e.pageX < 10) {
            $("#nav1").visible();
            isNavBarHidden = false;
        }
        else if (e.pageX >= 105) {
            $("#nav1").invisible();
            isNavBarHidden = true;
        }
    });

})();

