let projects = [];
let activeCategory = "Todos";

const grid = document.getElementById("projectsGrid");
const count = document.getElementById("projectCount");
const filters = document.getElementById("filters");
const search = document.getElementById("search");
const emptyState = document.getElementById("emptyState");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
})[character]);

function projectMatches(project) {
  const query = search.value.trim().toLocaleLowerCase("gl");
  const inCategory = activeCategory === "Todos" || project.category === activeCategory;
  const haystack = [project.name, project.description, project.category, project.language]
    .join(" ")
    .toLocaleLowerCase("gl");
  return inCategory && (!query || haystack.includes(query));
}

function renderProjects() {
  const visible = projects.filter(projectMatches);
  count.textContent = `${visible.length} ${visible.length === 1 ? "proxecto" : "proxectos"}`;
  emptyState.hidden = visible.length !== 0;
  grid.innerHTML = visible.map((project, index) => `
    <article class="project-card${project.featured ? " featured" : ""}">
      <div class="card-top">
        <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="project-category">${escapeHtml(project.category)}</span>
      </div>
      <h3>${escapeHtml(project.title || project.name)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <div class="project-links">
        ${project.demo ? `<a href="${escapeHtml(project.demo)}" target="_blank" rel="noreferrer">ver proxecto ↗</a>` : ""}
        <a href="${escapeHtml(project.repo)}" target="_blank" rel="noreferrer">código ↗</a>
      </div>
    </article>
  `).join("");
}

function renderFilters() {
  const categories = ["Todos", ...new Set(projects.map(project => project.category))];
  filters.innerHTML = categories.map(category => `
    <button class="filter${category === activeCategory ? " active" : ""}" type="button" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join("");
}

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProjects();
});
search.addEventListener("input", renderProjects);

fetch("projects.json")
  .then(response => {
    if (!response.ok) throw new Error("Non se puido cargar o catálogo");
    return response.json();
  })
  .then(data => {
    projects = data.sort((a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      (b.updated || "").localeCompare(a.updated || "") ||
      a.name.localeCompare(b.name)
    );
    renderFilters();
    renderProjects();
  })
  .catch(() => {
    count.textContent = "Erro ao cargar";
    emptyState.hidden = false;
    emptyState.textContent = "O catálogo non puido cargarse. Podes velo directamente en GitHub.";
  });

document.getElementById("year").textContent = new Date().getFullYear();

// Terminal: unha segunda porta de entrada, non un requisito para navegar.
const terminal = document.getElementById("terminalDialog");
const terminalOutput = document.getElementById("terminalOutput");
const cmdInput = document.getElementById("cmd");
const fortunes = [
  "πάντα ῥεῖ — todo flúe",
  "festina lente — apura devagar",
  "nulla dies sine linea",
  "γνῶθι σεαυτόν — coñécete a ti mesmo",
  "tempus fugit, memoria manet"
];

function print(line = "") {
  terminalOutput.insertAdjacentHTML("beforeend", `${line}<br>`);
  terminal.scrollTop = terminal.scrollHeight;
}

function openTerminal() {
  if (!terminal.open) terminal.showModal();
  if (!terminalOutput.children.length) {
    print("Benvido. Escribe <strong>help</strong> para ver os comandos.");
  }
  setTimeout(() => cmdInput.focus(), 0);
}

function runCommand(rawCommand) {
  const [base = "", ...args] = rawCommand.trim().split(/\s+/);
  const query = args.join(" ").toLocaleLowerCase("gl");
  if (!base) return;
  const commands = {
    help: () => print("comandos: ls, info [proxecto], open [proxecto], whoami, fortune, clear, exit"),
    whoami: () => print("a. morón — profesor de grego e latín · antigo investigador en IA · galego"),
    ls: () => projects.forEach(project => print(
      `<a href="${escapeHtml(project.demo || project.repo)}" target="_blank">${escapeHtml(project.name)}/</a> — ${escapeHtml(project.description)}`
    )),
    info: () => {
      const project = projects.find(item => [item.name, item.title].some(value => value?.toLocaleLowerCase("gl").includes(query)));
      print(project ? `<strong>${escapeHtml(project.title || project.name)}</strong> — ${escapeHtml(project.description)}` : "uso: info [proxecto]");
    },
    open: () => {
      const project = projects.find(item => [item.name, item.title].some(value => value?.toLocaleLowerCase("gl").includes(query)));
      if (!project) return print("uso: open [proxecto]");
      window.open(project.demo || project.repo, "_blank", "noopener");
      print(`abrindo ${escapeHtml(project.name)}…`);
    },
    fortune: () => print(fortunes[Math.floor(Math.random() * fortunes.length)]),
    clear: () => { terminalOutput.innerHTML = ""; },
    exit: () => terminal.close()
  };
  (commands[base.toLowerCase()] || (() => print(`comando non atopado: ${escapeHtml(base)}`)))();
}

document.getElementById("openTerminal").addEventListener("click", openTerminal);
document.getElementById("closeTerminal").addEventListener("click", () => terminal.close());
terminal.addEventListener("click", event => {
  if (event.target === terminal) terminal.close();
});
cmdInput.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  const command = cmdInput.value;
  print(`<span class="prompt">moronbandin@galiza:~$</span> ${escapeHtml(command)}`);
  runCommand(command);
  cmdInput.value = "";
});
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openTerminal();
  }
  if (event.key === "/" && !terminal.open && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});
