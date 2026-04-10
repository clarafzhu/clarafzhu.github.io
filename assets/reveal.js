/**
 * Scroll reveal: adds .is-visible to .reveal elements when they enter the viewport.
 * Required by _shared.css (.reveal starts at opacity:0).
 */
(function () {
  var nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  function showAll() {
    nodes.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
  );

  nodes.forEach(function (el) {
    observer.observe(el);
  });
})();
