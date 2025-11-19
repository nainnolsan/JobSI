# Propuesta de Reorganización Frontend (Next.js App Router)

Fecha: 2025-11-18
Estado: Propuesta inicial

## Objetivos
- Claridad de rutas y layouts con route groups.
- Arquitectura por features con capa compartida (servicios, hooks, UI).
- Reducir duplicación y dependencias cruzadas.
- Facilitar escalabilidad y testing.

## Estructura Objetivo
```
frontend/
  app/
    (marketing)/
      layout.tsx            # Layout público
      page.tsx              # Landing
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
    (app)/                  # App autenticada (no cambia URLs)
      dashboard/
        layout.tsx          # AppShell con Sidebar/Topbar
        page.tsx            # Home del dashboard
        cover-letters/
          page.tsx          # Lista (antes CoverLetterView)
          editor/
            [id]/
              page.tsx      # Editor existente
        profile/
          page.tsx
        resume/
          page.tsx
  features/
    cover-letters/
      components/
        CoverLetterList.tsx
        DraftModal.tsx
      hooks/
        useCoverLetters.ts
      api.ts
      types.ts
    profile/
      api.ts
      types.ts
    resume/
      ...
  shared/
    services/
      http.ts               # Cliente HTTP único
      auth.ts               # Helpers de auth/token
    hooks/
      useAuth.ts
      useApi.ts
    components/
      ui/
        button.tsx
        input.tsx
      layout/
        AppShell.tsx
        Sidebar.tsx
        Topbar.tsx
    lib/
      decodeJWT.ts
      utils.ts
  styles/
    globals.css
    tokens.css
  public/
```
Notas:
- Los route groups entre paréntesis no cambian las rutas públicas.
- Podemos mover los archivos actuales a estas carpetas sin romper URLs.

## Convenciones
- Imports con alias: `@/features/*`, `@/shared/*` (via `tsconfig.json`).
- Feature-first: cada feature contiene API, tipos, hooks y componentes propios.
- UI reusable en `shared/components/ui` y layout en `shared/components/layout`.
- HTTP centralizado en `shared/services/http.ts` con manejo de token y errores.

## Capa Compartida (resumen)
- `shared/services/http.ts`: `apiFetch<T>`, `get/post/put/del`, token de `localStorage`/cookie, `NEXT_PUBLIC_API_BASE_URL` opcional.
- `shared/hooks/useAuth.ts`: estado de sesión, obtención/renovación de token.
- `shared/components/layout/AppShell.tsx`: layout de dashboard con Sidebar/Topbar.

## Cover Letters (API propuesta)
- `features/cover-letters/api.ts`:
  - `list()`: GET `/api/cover-letters`
  - `getOne(id)`
  - `createDraft(payload)`
  - `updateDraft(id, payload)`
  - `deleteDraft(id)`
  - `parseJob(rawJobText)`
  - `generate({ cover_letter_id, parsed, config })`
- `features/cover-letters/types.ts` con tipos `CoverLetter`, `ParseResult`, `GenerateResult`.

## Plan de Migración (Fases)
1) Fundaciones seguras (sin romper rutas)
   - Añadir `shared/services/http.ts` y usarlo sólo en `CoverLetterView`.
   - Añadir `features/cover-letters/api.ts` y `types.ts` y cablear `CoverLetterView`.
   - No tocar `tsconfig.json` aún (imports relativos o `@/shared` sólo si ya existe).

2) Route groups y layout de dashboard
   - Crear `app/(app)/dashboard/layout.tsx` (AppShell básico con slots).
   - Mover `dashboard` dentro de `(app)`; mover `login` dentro de `(auth)`; mover landing a `(marketing)`.
   - Verificar que las rutas públicas no cambian.

3) Modularizar features
   - Extraer componentes del dashboard a `features/cover-letters/components`.
   - Crear `features/profile/{api,types}.ts` y adaptar `ProfileView` de forma incremental.

4) UI y lib compartidos
   - Mover `components/ui` a `shared/components/ui` y reexportar.
   - Mover `lib/*` a `shared/lib/*`.
   - Introducir alias en `tsconfig.json` y actualizar imports (codemod simple).

5) Limpieza
   - Eliminar duplicados en `components/` raíz.
   - Revisar Tailwind `content` para asegurar paths nuevos.

## Mapa de Riesgos y Mitigaciones
- Imports rotos: usar alias/paths y migrar en PRs pequeños; busquedas con regex.
- SSR vs localStorage: leer token sólo en cliente; pasar token por prop si se necesita en server components.
- Tailwind paths: actualizar `tailwind.config.js` para incluir `features/**` y `shared/**`.
- Cache build Next: si aparecen errores fantasma, limpiar `.next`.
- Cambios de layout: aplicar poco a poco, verificando secciones (Cover Letters primero).

## Criterios de Éxito
- Rutas intactas (`/`, `/login`, `/register`, `/dashboard`, `/dashboard/cover-letter-editor/[id]`).
- Código de Cover Letters usa `features/*` y `shared/services/http`.
- AppShell del dashboard operativo sin degradar UX.
- Sin imports rotos y build estable.

## Pasos Siguientes
- Implementar Fase 1: integrar `shared/services/http.ts` + `features/cover-letters/api.ts` en `CoverLetterView`.
- Luego crear el layout de `(app)` y mover rutas sin cambiar URLs.
