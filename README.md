# Gestión de Proyecto — QuantumBot Trading

Aplicación full-stack (Express + React/Vite + Supabase) para control y seguimiento de inversión del bot de trading.

## Flujo de Trabajo (GitFlow)

Este repositorio sigue un flujo de 3 niveles pensado para un equipo de 3 desarrolladores:

```text
dev/ricardo   ──┐
dev/miembro-2 ──┼──► pruebas ──(Pull Request)──► main (Producción)
dev/miembro-3 ──┘
```

### Ramas

| Rama | Propósito | Regla |
| :--- | :--- | :--- |
| `main` | **Producción** (código estable listo para despliegue) | Protegida — cambios solo vía Pull Request desde `pruebas` |
| `pruebas` | **Entorno de pruebas / integración** | Recibe el código de las 3 ramas de desarrollo para validar que todo funciona en conjunto |
| `dev/ricardo` | Rama de desarrollo — Ricardo | Desarrollo diario |
| `dev/miembro-2` | Rama de desarrollo — Miembro 2 | Desarrollo diario |
| `dev/miembro-3` | Rama de desarrollo — Miembro 3 | Desarrollo diario |

### Paso a paso para el equipo

1. **Clonar el repositorio y cambiarse a tu rama:**
   ```bash
   git clone https://github.com/Therick04/gestion-de-proyecto.git
   cd gestion-de-proyecto
   git checkout dev/tu-rama
   ```

2. **Antes de empezar a trabajar, sincronizar cambios recientes de `pruebas`:**
   ```bash
   git checkout pruebas
   git pull origin pruebas
   git checkout dev/tu-rama
   git merge pruebas
   ```

3. **Desarrollar y subir tus cambios a tu rama:**
   ```bash
   git add .
   git commit -m "feat: descripción breve del cambio"
   git push origin dev/tu-rama
   ```

4. **Integrar en `pruebas` para probar en equipo:**
   ```bash
   git checkout pruebas
   git pull origin pruebas
   git merge dev/tu-rama
   git push origin pruebas
   ```
   *(También pueden abrir un Pull Request desde `dev/tu-rama` hacia `pruebas` si desean revisarlo antes).*

5. **Promover a Producción (`main`):**
   Cuando todo esté probado y funcionando correctamente en `pruebas`:
   - Ir a GitHub → **Pull Requests** → **New pull request**.
   - Seleccionar `base: main` ← `compare: pruebas`.
   - Revisar los cambios y aprobar el merge hacia `main`.

## Configuración local

1. Copiar `.env.example` a `.env` y completar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
2. Instalar dependencias:
   ```bash
   npm install
   npm install --prefix frontend
   ```
3. Ejecutar en desarrollo:
   ```bash
   npm run dev:full
   ```
