// Sidebar
const sidebar = document.querySelector(".sidebar");
const toggleButton = document.querySelector(".sidebar__toggle-button");
const overlay = document.querySelector(".sidebar__overlay");

function updateSidebarVisibility() {
  if (window.innerWidth < 768) {
    sidebar.classList.remove("sidebar--open");
    overlay.classList.add("hidden");
  } else {
    sidebar.classList.add("sidebar--open");
    overlay.classList.add("hidden");
  }
}

window.addEventListener("DOMContentLoaded", updateSidebarVisibility);
window.addEventListener("resize", updateSidebarVisibility);

// Open sidebar (mobile)
toggleButton.addEventListener("click", () => {
  sidebar.classList.add("sidebar--open");
  overlay.classList.remove("hidden");
});

// Close sidebar (mobile)
overlay.addEventListener("click", () => {
  sidebar.classList.remove("sidebar--open");
  overlay.classList.add("hidden");
});

