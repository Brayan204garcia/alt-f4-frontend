# Auditor medico digital

Proyecto del GRUPO ALT-F4 para Samsung Innovation Campus 2025 - 2026.

Sistema de auditoria medica digital para Health & Life IPS SAS. La aplicacion compara historia clinica y prefactura para detectar inconsistencias, priorizar hallazgos y apoyar la revision de radicados medicos.

## Modulos principales

- Dashboard con indicadores del proceso de auditoria.
- Auditor IA para diagnosticar cruces entre historia clinica y prefactura.
- Auditorias API con radicados de ejemplo y detalle de hallazgos.
- Notificaciones para alertas de severidad media y alta.
- Normativas, tareas y configuracion del sistema.
- Sobre Nosotros con integrantes y aliados academicos del proyecto.

## Tecnologias

- React
- Vite
- TypeScript
- TanStack Router
- Tailwind CSS
- Radix UI
- Lucide Icons

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Scripts utiles

```bash
npm run build
npm run lint
npm run format
```

## Preparacion para GitHub

Antes de subir el proyecto:

```bash
npm install
npm run build
git status
git add .
git commit -m "Preparar auditor medico digital para despliegue"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/auditor-medico-digital.git
git push -u origin main
```

## Despliegue en Cloudflare Pages

Configuracion recomendada al conectar el repositorio desde Cloudflare Pages:

- Framework preset: Vite
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node version: `22`

El proyecto incluye:

- `public/_redirects` para que las rutas internas de React funcionen al recargar la pagina.
- `public/_headers` con headers basicos de seguridad y cache para assets.
- `.node-version` para fijar Node 22 en entornos de despliegue.
- `wrangler.toml` para despliegues opcionales desde la CLI de Cloudflare.

Comandos opcionales con Wrangler:

```bash
npm run preview:cloudflare
npm run deploy:cloudflare
```

## Contexto academico

Este proyecto fue desarrollado con fines academicos, demostrativos e informativos dentro del reto "Auditor medico digital".
