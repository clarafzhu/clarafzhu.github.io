(function () {
  const panels = {
    intro: document.getElementById("panel-intro"),
    subsidiaries: document.getElementById("panel-subsidiaries"),
    foundation: document.getElementById("panel-foundation"),
    news: document.getElementById("panel-news"),
    contact: document.getElementById("panel-contact"),
  };

  const tabButtons = document.querySelectorAll(".tab-btn[data-tab]");
  const dropdown = document.querySelector(".has-dropdown");
  const dropdownTrigger = document.getElementById("subsidiary-trigger");
  const subsidiaryMenu = document.getElementById("subsidiary-menu");
  const companyItems = subsidiaryMenu ? subsidiaryMenu.querySelectorAll("[data-company]") : [];
  const companies = {
    shixin: document.getElementById("company-shixin"),
    coursistant: document.getElementById("company-coursistant"),
    law: document.getElementById("company-law"),
    starluminate: document.getElementById("company-starluminate"),
  };

  const subsidiaryPanel = panels.subsidiaries;

  function setActiveTab(tabId) {
    tabButtons.forEach((btn) => {
      const match = btn.dataset.tab === tabId;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-selected", match ? "true" : "false");
    });
  }

  function showPanel(tabId) {
    Object.entries(panels).forEach(([id, el]) => {
      if (!el) return;
      const show = id === tabId;
      el.hidden = !show;
      el.classList.toggle("active", show);
    });
  }

  function closeDropdown() {
    if (!dropdown || !dropdownTrigger) return;
    dropdown.classList.remove("open");
    dropdownTrigger.setAttribute("aria-expanded", "false");
  }

  function openDropdown() {
    if (!dropdown || !dropdownTrigger) return;
    dropdown.classList.add("open");
    dropdownTrigger.setAttribute("aria-expanded", "true");
  }

  function showCompany(companyId) {
    const article = companies[companyId];
    if (!article || !subsidiaryPanel) return;

    Object.values(companies).forEach((node) => {
      if (node) node.hidden = true;
    });

    article.hidden = false;
    subsidiaryPanel.classList.add("show-company");
    showPanel("subsidiaries");
    setActiveTab("subsidiaries");

    const heading = subsidiaryPanel.querySelector("#heading-subsidiaries");
    const title = article.querySelector("h2");
    if (heading && title) {
      heading.textContent = title.textContent;
    }

    closeDropdown();
    article.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetSubsidiaryPlaceholder() {
    if (!subsidiaryPanel) return;
    subsidiaryPanel.classList.remove("show-company");
    Object.values(companies).forEach((node) => {
      if (node) node.hidden = true;
    });
    const heading = subsidiaryPanel.querySelector("#heading-subsidiaries");
    if (heading) {
      heading.textContent = "Select a unit from the menu above";
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tab = btn.dataset.tab;
      if (!tab) return;

      if (tab === "subsidiaries") {
        e.stopPropagation();
        resetSubsidiaryPlaceholder();
        showPanel("subsidiaries");
        setActiveTab("subsidiaries");
        if (dropdown && dropdown.classList.contains("open")) {
          closeDropdown();
        } else if (dropdown) {
          openDropdown();
        }
        return;
      }

      resetSubsidiaryPlaceholder();
      showPanel(tab);
      setActiveTab(tab);
      closeDropdown();
    });
  });

  document.querySelectorAll(".logo[data-tab]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (tab === "intro") {
        resetSubsidiaryPlaceholder();
        showPanel("intro");
        setActiveTab("intro");
        closeDropdown();
      }
    });
  });

  companyItems.forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.dataset.company;
      if (id) showCompany(id);
    });
  });

  document.addEventListener("click", (e) => {
    if (dropdown && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
