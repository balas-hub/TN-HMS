// Main Application Orchestrator

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Pan India Centres Grid
  renderPanIndiaCentres();

  // Setup Search Input Enter Key Listener
  const searchInput = document.getElementById("patient-search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.RecordEngine.search(searchInput.value);
      }
    });
  }
});

function renderPanIndiaCentres() {
  const container = document.getElementById("pan-india-grid");
  if (!container) return;

  const centres = window.HospitalData.panIndiaCentres;
  container.innerHTML = centres.map(c => `
    <div class="centre-card">
      <div>
        <h4 class="centre-city">${escapeHtml(c.city)}</h4>
        <p class="centre-hospital">${escapeHtml(c.hospital)}</p>
      </div>
      <div class="centre-meta">
        <span class="centre-meta-pill" title="Inpatient Bed Capacity">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>
          <strong>${c.beds}</strong> Beds
        </span>
        <span class="centre-meta-pill emergency" title="24/7 Emergency Line">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <strong>${escapeHtml(c.emergency)}</strong>
        </span>
      </div>
    </div>
  `).join("");
}

// Toast notification helper
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'error' ? 
        '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : 
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
      }
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById("nav-menu");
  if (menu) {
    if (menu.style.display === "flex") {
      menu.style.display = "none";
    } else {
      menu.style.display = "flex";
      menu.style.flexDirection = "column";
      menu.style.position = "absolute";
      menu.style.top = "100%";
      menu.style.left = "0";
      menu.style.right = "0";
      menu.style.background = "#FFFFFF";
      menu.style.padding = "16px";
      menu.style.boxShadow = "0 10px 15px rgba(0,0,0,0.1)";
    }
  }
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

window.showToast = showToast;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToSection = scrollToSection;
