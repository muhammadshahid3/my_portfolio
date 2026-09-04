/* =========================================================================
   admin.js — Admin Panel Logic (/admin/shahid/)
   Ye panel data.js ki localStorage-backed "DB" ko read/write karta hai.
   Login sirf ek simple client-side gate hai (static site hai, koi real
   server-side auth possible nahi) — sirf casual visitors ko rokta hai.
   ========================================================================= */

const AUTH_KEY = "portfolio_admin_pass_v1";
const SESSION_KEY = "portfolio_admin_session_v1";
const DEFAULT_PASSWORD = "shahid123";

/* ---------------- AUTH ---------------- */
function getStoredPassword() {
  return localStorage.getItem(AUTH_KEY) || DEFAULT_PASSWORD;
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "yes";
}

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").classList.add("active");
  renderProjectList();
  renderSkillManager();
}

function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appScreen").classList.remove("active");
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = document.getElementById("passInput").value;
  if (val === getStoredPassword()) {
    sessionStorage.setItem(SESSION_KEY, "yes");
    document.getElementById("loginError").style.display = "none";
    showApp();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

if (isLoggedIn()) showApp();
else showLogin();

/* ---------------- NAV / TABS ---------------- */
document.querySelectorAll(".side-btn[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-btn[data-tab]").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-view").forEach((v) => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

/* ---------------- TOAST ---------------- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------------- PROJECTS ---------------- */
let editingProjectId = null;
let currentImageData = "";

const projForm = document.getElementById("projectForm");
const imgInput = document.getElementById("projImageFile");
const imgUrlInput = document.getElementById("projImageUrl");
const imgPreview = document.getElementById("imgPreview");

imgInput.addEventListener("change", () => {
  const file = imgInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentImageData = reader.result;
    imgUrlInput.value = "";
    imgPreview.src = currentImageData;
    imgPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

imgUrlInput.addEventListener("input", () => {
  if (imgUrlInput.value.trim()) {
    currentImageData = imgUrlInput.value.trim();
    imgPreview.src = currentImageData;
    imgPreview.style.display = "block";
  }
});

function resetProjectForm() {
  editingProjectId = null;
  currentImageData = "";
  projForm.reset();
  imgPreview.style.display = "none";
  document.getElementById("projFormTitle").textContent = "Add New Project";
  document.getElementById("projSubmitBtn").textContent = "Add Project";
  document.getElementById("projCancelBtn").style.display = "none";
}

document.getElementById("projCancelBtn").addEventListener("click", resetProjectForm);

projForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("projTitle").value.trim();
  const desc = document.getElementById("projDesc").value.trim();
  const tags = document.getElementById("projTags").value.trim();
  const github = document.getElementById("projGithub").value.trim();
  const live = document.getElementById("projLive").value.trim();
  const checkedCats = Array.from(document.querySelectorAll(".projCatCheck:checked")).map((c) => c.value);

  if (!title || !desc) {
    showToast("Title aur Description zaroori hain");
    return;
  }

  const projects = getProjects();
  const projectData = {
    id: editingProjectId || uid("p"),
    title,
    desc,
    image: currentImageData || "images/first-project.PNG",
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    category: checkedCats.join(" ") || "web",
    github,
    live,
  };

  if (editingProjectId) {
    const idx = projects.findIndex((p) => p.id === editingProjectId);
    if (idx > -1) projects[idx] = projectData;
  } else {
    projects.push(projectData);
  }

  saveProjects(projects);
  showToast(editingProjectId ? "Project update ho gaya ✅" : "Project add ho gaya ✅");
  resetProjectForm();
  renderProjectList();
});

function renderProjectList() {
  const list = document.getElementById("projectList");
  const projects = getProjects();

  if (!projects.length) {
    list.innerHTML = `<div class="empty-state">Abhi koi project nahi hai. Upar form se add karein.</div>`;
    return;
  }

  list.innerHTML = projects
    .map(
      (p) => `
      <div class="item-row">
        <img class="item-thumb" src="${p.image || ""}" onerror="this.style.opacity=0.2" />
        <div class="item-info">
          <div class="item-title">${escapeHtml(p.title)}</div>
          <div class="item-sub">${escapeHtml((p.tags || []).join(", "))} · ${escapeHtml(p.category || "")}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-outline btn-sm" data-edit="${p.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => editProject(btn.dataset.edit))
  );
  list.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", () => deleteProject(btn.dataset.del))
  );
}

function editProject(id) {
  const projects = getProjects();
  const p = projects.find((x) => x.id === id);
  if (!p) return;

  editingProjectId = id;
  currentImageData = p.image || "";
  document.getElementById("projTitle").value = p.title || "";
  document.getElementById("projDesc").value = p.desc || "";
  document.getElementById("projTags").value = (p.tags || []).join(", ");
  document.getElementById("projGithub").value = p.github || "";
  document.getElementById("projLive").value = p.live || "";
  document.querySelectorAll(".projCatCheck").forEach((c) => {
    c.checked = (p.category || "").split(" ").includes(c.value);
  });

  if (currentImageData) {
    imgPreview.src = currentImageData;
    imgPreview.style.display = "block";
  }

  document.getElementById("projFormTitle").textContent = "Edit Project";
  document.getElementById("projSubmitBtn").textContent = "Save Changes";
  document.getElementById("projCancelBtn").style.display = "inline-flex";
  document.querySelector('.side-btn[data-tab="projects"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProject(id) {
  if (!confirm("Ye project delete karna hai?")) return;
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  showToast("Project delete ho gaya");
  renderProjectList();
}

/* ---------------- SKILLS ---------------- */
function renderSkillManager() {
  const wrap = document.getElementById("skillManager");
  const skills = getSkills();

  if (!skills.length) {
    wrap.innerHTML = `<div class="empty-state">Abhi koi skill category nahi hai.</div>`;
    return;
  }

  wrap.innerHTML = skills
    .map(
      (group, gi) => `
      <div class="skill-cat-block">
        <div class="skill-cat-head">
          <h4>${escapeHtml(group.category)}</h4>
          <button class="btn btn-danger btn-sm" data-delcat="${gi}">Delete Category</button>
        </div>
        <div id="skillItems-${gi}">
          ${(group.items || [])
            .map(
              (item, ii) => `
            <div class="skill-item-row">
              <input type="text" value="${escapeHtml(item.name)}" data-sname="${gi}:${ii}" />
              <input type="number" min="0" max="100" value="${item.percent}" data-spct="${gi}:${ii}" />
              <button class="btn btn-outline btn-sm" data-savesk="${gi}:${ii}">Save</button>
              <button class="btn btn-danger btn-sm" data-delsk="${gi}:${ii}">✕</button>
            </div>`
            )
            .join("")}
        </div>
        <div class="add-skill-row">
          <input type="text" placeholder="New skill name" id="newSkillName-${gi}" />
          <input type="number" placeholder="%" min="0" max="100" id="newSkillPct-${gi}" />
          <button class="btn btn-primary btn-sm" data-addsk="${gi}">+ Add</button>
        </div>
      </div>`
    )
    .join("");

  wrap.querySelectorAll("[data-savesk]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const [gi, ii] = btn.dataset.savesk.split(":").map(Number);
      const skills = getSkills();
      const nameInput = wrap.querySelector(`[data-sname="${gi}:${ii}"]`);
      const pctInput = wrap.querySelector(`[data-spct="${gi}:${ii}"]`);
      skills[gi].items[ii].name = nameInput.value.trim();
      skills[gi].items[ii].percent = Math.max(0, Math.min(100, Number(pctInput.value) || 0));
      saveSkills(skills);
      showToast("Skill save ho gayi ✅");
    })
  );

  wrap.querySelectorAll("[data-delsk]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const [gi, ii] = btn.dataset.delsk.split(":").map(Number);
      const skills = getSkills();
      skills[gi].items.splice(ii, 1);
      saveSkills(skills);
      renderSkillManager();
    })
  );

  wrap.querySelectorAll("[data-delcat]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!confirm("Ye poori category delete karni hai?")) return;
      const gi = Number(btn.dataset.delcat);
      const skills = getSkills();
      skills.splice(gi, 1);
      saveSkills(skills);
      renderSkillManager();
    })
  );

  wrap.querySelectorAll("[data-addsk]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const gi = Number(btn.dataset.addsk);
      const nameEl = document.getElementById(`newSkillName-${gi}`);
      const pctEl = document.getElementById(`newSkillPct-${gi}`);
      const name = nameEl.value.trim();
      const pct = Math.max(0, Math.min(100, Number(pctEl.value) || 0));
      if (!name) {
        showToast("Skill name likhein");
        return;
      }
      const skills = getSkills();
      skills[gi].items.push({ name, percent: pct });
      saveSkills(skills);
      renderSkillManager();
      showToast("Skill add ho gayi ✅");
    })
  );
}

document.getElementById("addCatBtn").addEventListener("click", () => {
  const input = document.getElementById("newCatName");
  const name = input.value.trim();
  if (!name) {
    showToast("Category name likhein");
    return;
  }
  const skills = getSkills();
  skills.push({ category: name, items: [] });
  saveSkills(skills);
  input.value = "";
  renderSkillManager();
  showToast("Category add ho gayi ✅");
});

/* ---------------- SETTINGS: password, export, import, reset ---------------- */
document.getElementById("changePassForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = document.getElementById("newPassInput").value.trim();
  if (val.length < 4) {
    showToast("Password kam se kam 4 characters ka ho");
    return;
  }
  localStorage.setItem(AUTH_KEY, val);
  document.getElementById("newPassInput").value = "";
  showToast("Password change ho gaya ✅");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const data = { projects: getProjects(), skills: getSkills() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "portfolio-data-export.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("JSON export ho gaya");
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed.projects) saveProjects(parsed.projects);
      if (parsed.skills) saveSkills(parsed.skills);
      renderProjectList();
      renderSkillManager();
      showToast("Data import ho gaya ✅");
    } catch (err) {
      showToast("Invalid JSON file");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Sab kuch default par reset karna hai? Ye action undo nahi hoga.")) return;
  resetToDefaults();
  renderProjectList();
  renderSkillManager();
  showToast("Defaults par reset ho gaya");
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
