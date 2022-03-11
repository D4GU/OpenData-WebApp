(function ($) {
    $.fn.invisible = function () {
        return this.each(function () {
            $(this).css("transform", "translateY(-85%)");
        });
    };
    $.fn.visible = function () {
        return this.each(function () {
            $(this).css("transform", "translateY(0%)");
        });
    };
}(jQuery));

$("#nav1").invisible();

(function () {
    $(document).mousemove(function (e) {
        mY = e.pageY;
        if (e.pageY < 125) {
            $("#nav1").visible();
            isNavBarHidden = false;
        }
        else if (e.pageY >= 125) {
            $("#nav1").invisible();
            isNavBarHidden = true;
        }
    });

})();

