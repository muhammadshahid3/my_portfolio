/* =========================================================================
   render.js — Renders Projects & Skills sections from data.js
   Admin panel (/admin/shahid/) jo bhi localStorage me save karta hai,
   ye file wahi data read karke frontend par mount kar deti hai.
   ========================================================================= */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------------- PROJECTS ---------------- */
function renderProjectTabs(projects) {
  const tabsEl = document.getElementById("projTabs");
  if (!tabsEl) return;

  const catSet = new Set();
  projects.forEach((p) => {
    (p.category || "")
      .split(" ")
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => catSet.add(c));
  });

  const cats = ["all", ...Array.from(catSet)];
  tabsEl.innerHTML = cats
    .map((c, i) => {
      const label = c === "all" ? "All Projects" : c.charAt(0).toUpperCase() + c.slice(1);
      return `<button class="proj-tab${i === 0 ? " active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(label)}</button>`;
    })
    .join("");

  tabsEl.querySelectorAll(".proj-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabsEl.querySelectorAll(".proj-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterProjectCards(btn.dataset.cat);
    });
  });
}

function filterProjectCards(cat) {
  document.querySelectorAll(".proj-card").forEach((card) => {
    const cats = card.dataset.cat || "";
    card.classList.toggle("hidden", cat !== "all" && !cats.split(" ").includes(cat));
  });
}

function renderProjects() {
  const grid = document.getElementById("projGrid");
  if (!grid) return;
  const projects = getProjects();

  if (!projects.length) {
    grid.innerHTML = `<p style="color:var(--muted)">Abhi koi project add nahi hua. Admin panel se add karein.</p>`;
    renderProjectTabs([]);
    return;
  }

  grid.innerHTML = projects
    .map((p) => {
      const tags = (p.tags || []).map((t) => `<span class="ptag">${escapeHtml(t)}</span>`).join("");
      const github = p.github
        ? `<a href="${escapeHtml(p.github)}" target="_blank" rel="noopener" class="plink">🔗 GitHub</a>`
        : "";
      const live = p.live
        ? `<a href="${escapeHtml(p.live)}" target="_blank" rel="noopener" class="plink">↗ Live</a>`
        : "";
      const img = p.image
        ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" />`
        : `<div class="proj-img-fallback">📁</div>`;

      return `
      <div class="proj-card" data-cat="${escapeHtml(p.category || "")}">
        <div class="proj-img">${img}</div>
        <div class="proj-body">
          <div class="proj-tags">${tags}</div>
          <div class="proj-title">${escapeHtml(p.title)}</div>
          <div class="proj-desc">${escapeHtml(p.desc)}</div>
          <div class="proj-links">${github}${live}</div>
        </div>
      </div>`;
    })
    .join("");

  renderProjectTabs(projects);
}

/* ---------------- SKILLS ---------------- */
function renderSkills() {
  const grid = document.getElementById("arsenalGrid");
  if (!grid) return;
  const skillGroups = getSkills();

  if (!skillGroups.length) {
    grid.innerHTML = `<p style="color:var(--muted)">Abhi koi skill add nahi hui. Admin panel se add karein.</p>`;
    return;
  }

  grid.innerHTML = skillGroups
    .map((group) => {
      const items = (group.items || [])
        .map(
          (item) => `
          <div class="skill-row">
            <div class="skill-row-top">
              <span class="skill-row-name">${escapeHtml(item.name)}</span>
              <span class="skill-row-pct">${Number(item.percent) || 0}%</span>
            </div>
            <div class="skill-bar"><div class="skill-fill" style="width:${Number(item.percent) || 0}%"></div></div>
          </div>`
        )
        .join("");

      return `
      <div class="arsenal-card">
        <h3>${escapeHtml(group.category)}</h3>
        <div class="skill-list">${items}</div>
      </div>`;
    })
    .join("");
}

function applyScrollReveal(selector) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(selector).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    revealObserver.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  renderSkills();
  applyScrollReveal(".proj-card");
  applyScrollReveal(".arsenal-card");
});
