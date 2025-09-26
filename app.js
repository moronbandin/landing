let projects = {};
fetch("projects.json")
  .then(res => res.json())
  .then(data => { projects = data; });

const output = document.getElementById("output");
const cmdInput = document.getElementById("cmd");

let projectsShown = false; // controla se xa se listaron

// fortunes
const fortunes = [
  "the unexamined life is not worth living — socrates",
  "πάντα ῥεῖ — everything flows — heraclitus",
  "tempus fugit, memoria manet",
  "simplicity is the ultimate sophistication — leonardo",
  "γνῶθι σεαυτόν — know thyself",
  "alea iacta est — julius caesar",
  "amor fati — nietzsche",
  "sapere aude — horace",
  "carpe diem — horace",
  "festina lente — augustus",
  "memento mori",
  "hoc est vivere bis, vita posse priore frui — martial",
  "ars longa, vita brevis — hippocrates",
  "nulla dies sine linea — apelles",
  "ἓν οἶδα ὅτι οὐδὲν οἶδα — socrates",
  "per aspera ad astra — seneca",
  "nosce tempus — know the time",
  "vita brevis, ars longa",
  "γλῶττα λανθάνουσα τἀληθῆ λέγει — the tongue speaks truth unconsciously",
  "ordo ab chao — order from chaos"
];

// barallamos ao comezar
let fortuneQueue = [...fortunes].sort(() => Math.random() - 0.5);

function getNextFortune() {
  if (fortuneQueue.length === 0) {
    // cando se esgota, barallamos de novo
    fortuneQueue = [...fortunes].sort(() => Math.random() - 0.5);
  }
  return fortuneQueue.pop();
}

function print(line) {
  output.innerHTML += line + "<br>";
  output.scrollTop = output.scrollHeight;
}

function runCommand(cmd) {
  const args = cmd.trim().split(" ");
  const base = args[0];

  if (!base) return;

  switch (base) {
    case "help":
      print("available commands: whoami, whereami, job, ls, info [project], open [project], clear, exit, social");
      break;
    case "whoami":
      print("a. morón — teacher · developer · galician");
      break;
    case "whereami":
      print("compostela (sometimes vigo, always galicia)");
      break;
    case "job":
      print("teacher of greek & latin · creator of apps and repos");
      break;
    case "ls":
        Object.keys(projects)
        .sort() // ordénanse as claves alfabéticamente
        .forEach(k => {
            const p = projects[k];
            print(`<a href="${p.url}" target="_blank">${k}/</a> — ${p.short}`);
        });
        projectsShown = true;
        break;
          case "l": // alias de ls
      runCommand("ls");
      break;
    case "info":
      if (args[1] && projects[args[1]]) {
        const p = projects[args[1]];
        print(`<strong>${args[1]}</strong>: ${p.desc}`);
      } else {
        print("usage: info [project]");
      }
      break;
    case "open":
      if (args[1] && projects[args[1]]) {
        window.open(projects[args[1]].url, "_blank");
        print(`opening ${args[1]}...`);
      } else {
        print("usage: open [project]");
      }
      break;
    case "clear":
      output.innerHTML = "";
      projectsShown = false; // reset ao limpar
      break;
    case "cls": // alias de clear
      runCommand("clear");
      break;
    case "exit":
      window.location.href = "https://github.com/moronbandin";
      break;
    case "social":
      print("github: <a href='https://github.com/moronbandin' target='_blank'>https://github.com/moronbandin</a>");
      print("twitter: <a href='https://twitter.com/moronbandin' target='_blank'>https://twitter.com/moronbandin</a>");
      print("email: <a href='mailto:amoronbandin@gmail.com'>amoronbandin@gmail.com</a>");
      break;
    case "sudo":
      print("nice try ;)");
      break;
    case "vi":
    case "nano":
      print("no editor configured");
      break;
    case "fortune":
      print(getNextFortune());
      break;
    default:
      print(`command not found: ${base}`);
  }
}

cmdInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = cmdInput.value;
    print(`<span class="prompt">moronbandin@gh-pages:~$</span> ${cmd}`);
    runCommand(cmd);
    cmdInput.value = "";
  }
});

// botón "ver proxectos"
document.getElementById("showProjects").addEventListener("click", () => {
  print(`<span class="prompt">moronbandin@gh-pages:~$</span> ls`);
  if (!projectsShown) {
    runCommand("ls");
  } else {
    print("fai click sobre o proxecto que che interese");
  }
});

// permitir escribir facendo click en calquera parte da terminal
document.querySelector(".content").addEventListener("click", () => {
    cmdInput.focus();
  });