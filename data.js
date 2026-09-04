/* =========================================================================
   data.js — Portfolio "Static DB" Layer
   -------------------------------------------------------------------------
   Ye site ka data-layer hai. Chunke pura project HTML/CSS/JS hai aur
   koi real backend/database nahi hai, is file ne localStorage ko ek
   halki-si "DB" ki tarah use kiya hai:

     - Pehli baar site load hone par DEFAULT_PROJECTS / DEFAULT_SKILLS
       localStorage me seed ho jaate hain.
     - Admin panel (/admin/shahid/) inhi localStorage keys ko
       read/write karta hai.
     - Frontend (index.html) inhi keys se cards render karta hai.

   IMPORTANT (samajhne wali baat):
   localStorage sirf usi browser tak mehdood hota hai. Matlab agar aap
   apne laptop ke Chrome me admin panel se project add karte ho, to wo
   sirf aapke isi browser me dikhega — kisi doosre visitor ko nahi
   (kyunke koi shared server/database nahi hai). Isliye admin panel me
   "Export JSON" diya gaya hai — export karke us JSON se neeche
   DEFAULT_PROJECTS / DEFAULT_SKILLS update kar dein aur GitHub par push
   kar dein, phir wo data HAR VISITOR ko dikhega (kyunki tab wo file me
   permanently seed ho jayega).
   ========================================================================= */

const STORAGE_KEYS = {
  projects: "portfolio_projects_v1",
  skills: "portfolio_skills_v1",
};

/* ---------- DEFAULT PROJECTS ---------- */
const DEFAULT_PROJECTS = [
  {
    id: "p1",
    title: "Dockerized Django Job Portal Project",
    desc: "Containerized a full-stack Django 5.2 application with PostgreSQL and WhiteNoise using Docker Compose, creating an automated pipeline for localized workflows.",
    image: "images/first-project.PNG",
    tags: ["Docker", "Django", "PostgreSQL"],
    category: "docker",
    github: "https://github.com/muhammadshahid3/job-portal-platform",
    live: "",
  },
  {
    id: "p2",
    title: "Automated CI/CD Pipeline",
    desc: "Built a Final Year Project (FYP) – Lead Generation system with CI/CD using GitHub Actions to auto test, build Docker images, and deploy on AWS EC2.",
    image: "images/leadbride.PNG",
    tags: ["GitHub Actions", "CI/CD", "AWS"],
    category: "cicd",
    github: "",
    live: "",
  },
  {
    id: "p3",
    title: "Dockerized React Ecommerce",
    desc: "Containerized a React.js frontend with multi-stage Docker build and served via Nginx — optimized for production with minimal image size.",
    image: "images/ecommerce-web-banner-design_1281315-2886.avif",
    tags: ["Docker", "React", "Nginx"],
    category: "docker web",
    github: "",
    live: "",
  },
];

/* ---------- DEFAULT SKILLS (with percentages) ---------- */
const DEFAULT_SKILLS = [
  {
    category: "Cloud & Infrastructure",
    items: [
      { name: "AWS", percent: 75 },
      { name: "Linux", percent: 85 },
      { name: "Nginx", percent: 70 },
      { name: "Git", percent: 85 },
      { name: "GitHub", percent: 85 },
    ],
  },
  {
    category: "Containers & Orchestration",
    items: [
      { name: "Docker", percent: 80 },
      { name: "Docker Compose", percent: 75 },
      { name: "Kubernetes", percent: 45 },
    ],
  },
  {
    category: "Infrastructure as Code",
    items: [
      { name: "Terraform", percent: 40 },
      { name: "IaC Concepts", percent: 50 },
    ],
  },
  {
    category: "CI/CD & DevOps",
    items: [
      { name: "GitHub Actions", percent: 70 },
      { name: "CI/CD Pipelines", percent: 70 },
      { name: "Deployment Automation", percent: 65 },
      { name: "Server Management", percent: 60 },
    ],
  },
  {
    category: "Web Development",
    items: [
      { name: "JavaScript", percent: 70 },
      { name: "React.js", percent: 60 },
      { name: "Laravel", percent: 55 },
      { name: "PHP", percent: 55 },
      { name: "HTML5 / CSS3", percent: 85 },
      { name: "MySQL", percent: 60 },
    ],
  },
];

/* ---------- STORAGE HELPERS ---------- */
function uid(prefix = "id") {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.projects);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(DEFAULT_PROJECTS));
      return [...DEFAULT_PROJECTS];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("getProjects error", e);
    return [...DEFAULT_PROJECTS];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

function getSkills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.skills);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.skills, JSON.stringify(DEFAULT_SKILLS));
      return JSON.parse(JSON.stringify(DEFAULT_SKILLS));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("getSkills error", e);
    return JSON.parse(JSON.stringify(DEFAULT_SKILLS));
  }
}

function saveSkills(skills) {
  localStorage.setItem(STORAGE_KEYS.skills, JSON.stringify(skills));
}

function resetToDefaults() {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(DEFAULT_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.skills, JSON.stringify(DEFAULT_SKILLS));
}
