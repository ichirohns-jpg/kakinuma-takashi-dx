(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var selector = link.getAttribute("href");

        if (!selector || selector === "#") {
          return;
        }

        var target = document.querySelector(selector);

        if (target) {
          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });

    var images = document.querySelectorAll("img");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.display = "none";
      });
    });
  });
})();
