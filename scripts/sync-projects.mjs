#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const config = JSON.parse(readFileSync(join(root, "projects.config.json"), "utf8"));
const reposRoot = resolve(process.argv[2] || join(root, ".."));
const token = process.env.GITHUB_TOKEN;

function githubId(remote = "") {
  const match = remote.match(/github(?:-[^.:/]+)?[.:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  return match ? `${match[1]}/${match[2]}` : null;
}

function gitRemote(directory) {
  try {
    return execFileSync("git", ["-C", directory, "remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

function localRepos() {
  if (!existsSync(reposRoot)) return [];
  return readdirSync(reposRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== "landing")
    .map(entry => {
      const path = join(reposRoot, entry.name);
      const id = githubId(gitRemote(path));
      return { localName: entry.name, id };
    });
}

async function github(path) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "moronbandin-landing-sync" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub ${response.status}: ${path}`);
  }
  return response.json();
}

function categoryFor(repo) {
  const language = (repo.language || "").toLowerCase();
  if (["python", "javascript", "typescript"].includes(language)) return "Experimentos";
  return config.defaults.category;
}

function descriptionFor(repo, override) {
  return override.description || repo.description ||
    `Proxecto aberto construído con ${repo.language || "tecnoloxías web"}.`;
}

const byId = new Map();
const profileRepos = await github(`/users/${config.githubUser}/repos?per_page=100&sort=updated`) || [];
for (const repo of profileRepos) byId.set(repo.full_name, repo);

for (const local of localRepos()) {
  if (!local.id || byId.has(local.id)) continue;
  const repo = await github(`/repos/${local.id}`);
  if (repo && !repo.private) byId.set(repo.full_name, repo);
}

// As entradas explícitas permiten manter proxectos de organización ou locais
// aínda que non aparezan na listaxe principal do perfil.
for (const key of Object.keys(config.projects)) {
  if (!key.includes("/") || byId.has(key)) continue;
  const repo = await github(`/repos/${key}`);
  if (repo && !repo.private) byId.set(repo.full_name, repo);
}

const output = [];
for (const repo of byId.values()) {
  const shortKey = repo.owner.login === config.githubUser ? repo.name : repo.full_name;
  const override = config.projects[repo.full_name] || config.projects[shortKey] || {};
  if (override.include === false || (repo.fork && config.defaults.includeForks === false)) continue;
  output.push({
    name: repo.name,
    title: override.title || repo.name,
    description: descriptionFor(repo, override),
    category: override.category || categoryFor(repo),
    language: repo.language || "",
    repo: override.repo || repo.html_url,
    demo: override.demo || repo.homepage || "",
    featured: Boolean(override.featured),
    fork: Boolean(repo.fork),
    updated: repo.updated_at || ""
  });
}

for (const local of localRepos()) {
  if (local.id) continue;
  const override = config.projects[local.localName];
  if (!override?.include) continue;
  if (output.some(project => project.repo === override.repo)) continue;
  output.push({
    name: local.localName,
    title: override.title || local.localName,
    description: override.description || "Proxecto local.",
    category: override.category || config.defaults.category,
    language: override.language || "",
    repo: override.repo,
    demo: override.demo || "",
    featured: Boolean(override.featured),
    fork: false,
    updated: ""
  });
}

output.sort((a, b) =>
  Number(b.featured) - Number(a.featured) ||
  b.updated.localeCompare(a.updated) ||
  a.name.localeCompare(b.name)
);
writeFileSync(join(root, "projects.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Catálogo actualizado: ${output.length} proxectos.`);
