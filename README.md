# Landing de proxectos

Portafolio estático de proxectos públicos. O catálogo visible vive en
`projects.json`, pero non é necesario editalo á man.

## Actualizar o catálogo

Desde este directorio:

```bash
node scripts/sync-projects.mjs
```

O script explora por defecto as carpetas irmás de `landing`, le os remotos de
Git, consulta a lista pública de `moronbandin` e combina todo coas decisións
editoriais de `projects.config.json`.

En `projects.config.json` pódense corrixir títulos, descricións, categorías e
URLs de demo. Para ocultar un repo abonda con engadir `"include": false`. Unha
entrada local sen remoto só se publica cando leva `"include": true`.

Ademais, a GitHub Action `Actualizar proxectos` executa a sincronización cada
luns e tamén se pode lanzar manualmente desde a pestana Actions. Deste xeito,
os novos repos públicos do perfil aparecen automaticamente; os proxectos de
organización ou só locais deben declararse unha vez no ficheiro de configuración.
