document.addEventListener("DOMContentLoaded", function () {

    const backToTop = document.getElementById("backToTop");
    if(!backToTop) return;
    window.addEventListener("scroll", function () {

        if (window.scrollY > 300) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }

    });

});