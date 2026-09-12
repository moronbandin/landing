const selector = document.getElementById("selector");
const selectButton = document.getElementById("selectButton");
const selectedText = document.getElementById("selectedText");
const menu = document.getElementById("menu");
const codeLink = document.getElementById("codeLink");
const projectLink = document.getElementById("projectLink");
const projectMeta = document.getElementById("projectMeta");

let projects = [];
let selectedIndex = 0;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
})[character]);

function projectLabel(project) {
  return project.name;
}

function sortProjects(items) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "gl", { sensitivity: "base" })
  );
}

function toggleMenu(force) {
  const shouldOpen = typeof force === "boolean" ? force : !selector.classList.contains("open");
  selector.classList.toggle("open", shouldOpen);
  selectButton.setAttribute("aria-expanded", String(shouldOpen));

  if (shouldOpen) {
    const activeOption = menu.querySelector(".option.active");
    activeOption?.focus({ preventScroll: true });
    activeOption?.scrollIntoView({ block: "nearest" });
  }
}

function closeMenu() {
  toggleMenu(false);
}

function updateLinks(project) {
  selectedText.textContent = projectLabel(project);
  codeLink.href = project.repo;

  if (project.demo) {
    projectLink.href = project.demo;
    projectLink.classList.remove("disabled");
    projectLink.removeAttribute("aria-disabled");
    projectLink.removeAttribute("tabindex");
    projectLink.innerHTML = `Proxecto ${arrowIcon()}`;
  } else {
    projectLink.removeAttribute("href");
    projectLink.classList.add("disabled");
    projectLink.setAttribute("aria-disabled", "true");
    projectLink.setAttribute("tabindex", "-1");
    projectLink.innerHTML = `Sen demo ${arrowIcon()}`;
  }

  const category = project.category ? `${project.category}` : "proxecto";
  const language = project.language ? ` · ${project.language}` : "";
  projectMeta.textContent = `${category}${language}`;
}

function selectProject(index, shouldFocusButton = false) {
  if (!projects[index]) return;
  selectedIndex = index;
  updateLinks(projects[index]);

  menu.querySelectorAll(".option").forEach((option, optionIndex) => {
    const isActive = optionIndex === selectedIndex;
    option.classList.toggle("active", isActive);
    option.setAttribute("aria-selected", String(isActive));
    option.tabIndex = isActive ? 0 : -1;
  });

  closeMenu();
  if (shouldFocusButton) selectButton.focus();
}

function checkIcon() {
  return `<span class="check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5"/></svg></span>`;
}

function arrowIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>`;
}

function renderMenu() {
  menu.innerHTML = projects.map((project, index) => `
    <button
      class="option${index === selectedIndex ? " active" : ""}"
      type="button"
      role="option"
      aria-selected="${index === selectedIndex}"
      tabindex="${index === selectedIndex ? "0" : "-1"}"
      data-index="${index}">
      <span class="option-label">${escapeHtml(projectLabel(project))}</span>
      ${checkIcon()}
    </button>
  `).join("");
}

function focusOption(index) {
  const nextIndex = (index + projects.length) % projects.length;
  const option = menu.querySelector(`[data-index="${nextIndex}"]`);
  option?.focus();
}

function handleOptionKeys(event) {
  const current = Number(event.target.dataset.index);

  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusOption(current + 1);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusOption(current - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    focusOption(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    focusOption(projects.length - 1);
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectProject(current, true);
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu();
    selectButton.focus();
  }
}

selectButton.addEventListener("click", () => toggleMenu());

selectButton.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleMenu();
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    toggleMenu(true);
  }

  if (event.key === "Escape") {
    closeMenu();
  }
});

menu.addEventListener("click", event => {
  const option = event.target.closest(".option");
  if (!option) return;
  selectProject(Number(option.dataset.index), true);
});

menu.addEventListener("keydown", event => {
  if (event.target.closest(".option")) handleOptionKeys(event);
});

document.addEventListener("click", event => {
  if (!selector.contains(event.target)) closeMenu();
});

projectLink.addEventListener("click", event => {
  if (projectLink.classList.contains("disabled")) event.preventDefault();
});

fetch("projects.json")
  .then(response => {
    if (!response.ok) throw new Error("Non se puido cargar o catálogo");
    return response.json();
  })
  .then(data => {
    projects = sortProjects(data);
    if (!projects.length) throw new Error("Catálogo baleiro");
    selectedIndex = 0;
    renderMenu();
    updateLinks(projects[selectedIndex]);
  })
  .catch(() => {
    selectedText.textContent = "GitHub";
    codeLink.href = "https://github.com/moronbandin";
    projectLink.href = "https://github.com/moronbandin";
    projectLink.innerHTML = `GitHub ${arrowIcon()}`;
    projectMeta.textContent = "Non se puido cargar o catálogo local.";
  });
