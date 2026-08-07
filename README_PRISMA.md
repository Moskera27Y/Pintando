# Prisma + Neon (PostgreSQL) — Guía de configuración

Este proyecto incluye infraestructura preparada para **Prisma ORM** con
**PostgreSQL en Neon**. A continuación se explica cómo configurarla.

---

## 1. Configurar `DATABASE_URL`

Prisma necesita la cadena de conexión a tu base de datos Neon. Como Prisma
**no lee `.env.local` por defecto**, los scripts de npm usan `dotenv-cli`
para cargarla automáticamente.

Crea un archivo `.env.local` en la raíz del proyecto con:

```
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST/dbname?sslmode=require"
```

> La URL la obtienes desde el panel de **Neon** → tu proyecto → **Connection string**.
> Asegúrate de que incluya `?sslmode=require` (Neon requiere SSL).

### Importante
- **No subas `.env.local` a git** (ya está ignorado por `.gitignore`).
- **No escribas la URL directamente** en `schema.prisma` ni en ningún archivo
  del repositorio.

---

## 2. Generar el cliente de Prisma

```bash
npm run prisma:generate
```

Esto lee `prisma/schema.prisma` y genera el cliente tipado en
`node_modules/.prisma/client`.

> Ejecuta este comando cada vez que modifiques `schema.prisma`.

---

## 3. Crear y aplicar la primera migración

```bash
npm run prisma:migrate
```

Esto ejecuta `prisma migrate dev --name init`, crea las tablas en Neon y
genera un cliente nuevo automáticamente.

Para crear migraciones posteriores tras cambiar el schema:

```bash
npm run prisma:migrate -- --name nombre_de_la_migracion
```

---

## 4. Abrir Prisma Studio

```bash
npm run prisma:studio
```

Abre una interfaz visual en `http://localhost:5555` para explorar y editar
los datos de tu base de datos Neon.

---

## Estructura creada

```
prisma/
  schema.prisma    # Definición de modelos y configuración de la BD
src/lib/
  prisma.ts        # Cliente singleton de Prisma
```

## Modelos iniciales

| Modelo         | Descripción                                         |
|----------------|-----------------------------------------------------|
| `User`         | Usuarios (ADMIN / USER)                             |
| `Donation`     | Donaciones recibidas (vinculadas opcionalmente a User) |
| `Subscription` | Suscripciones recurrentes (membresías)              |
| `Plan`         | Planes de membresía disponibles                     |
| `Contact`      | Mensajes del formulario de contacto                 |
| `News`         | Noticias/artículos publicados                       |
| `EventLog`     | Registro de eventos del sistema (auditoría)         |

---

## Notas

- Esta integración **no afecta** a la funcionalidad existente del proyecto.
- El cliente de Prisma (`src/lib/prisma.ts`) es un **singleton global** que
  evita múltiples conexiones durante el desarrollo con hot-reload.
- Aún **no están implementados** PayPal, Stripe, login, webhooks ni API
  routes — solo la infraestructura de base de datos.
