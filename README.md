# 👟 Nika Tênis — Erechim/RS

Sitio web de **Nika Tênis**, tienda de calzado deportivo y urbano en Erechim (RS, Brasil) que vende **al por menor y al por mayor** (*varejo e atacado*). Todo el texto del sitio está en portugués de Brasil.

**Objetivo:** que los clientes de la zona visiten la tienda o escriban por WhatsApp, y que los revendedores pidan el catálogo mayorista.

```
nika-tenis/
├── client/   React 18 + Vite + TypeScript + Tailwind + Framer Motion + GSAP + Lenis
├── server/   Node.js + Express + TypeScript + Prisma (SQLite) + Zod + Nodemailer + JWT
└── package.json   script "dev" que levanta los dos con concurrently
```

---

## 1. Instalación

Requisitos: **Node.js 18.18+** (probado con Node 20–26) y npm.

```bash
# desde la raíz del proyecto
npm install                 # instala concurrently
npm install --prefix server
npm install --prefix client
```

(o todo junto: `npm run install:all`)

### Variables de entorno

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

En `server/.env` cambia como mínimo:

| Variable | Qué es |
|---|---|
| `ADMIN_USER` / `ADMIN_PASSWORD` | Usuario y contraseña del panel `/admin` |
| `JWT_SECRET` | Secreto largo y aleatorio. Genera uno con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SMTP_*`, `MAIL_TO` | Para recibir por email los leads mayoristas. **Si `SMTP_HOST` queda vacío, el email solo se muestra en la consola** (ideal en desarrollo) |
| `CLIENT_ORIGIN` | URL(s) del frontend permitidas en CORS, separadas por coma |

En `client/.env` normalmente no hace falta nada en desarrollo (Vite redirige `/api` al backend).

### Base de datos + seed

```bash
npm run setup
```

Crea `server/prisma/dev.db` (SQLite) y carga el seed: **12 productos de ejemplo**, 4 reseñas y los datos de la tienda. Para volver a cargar solo el seed: `npm run db:seed --prefix server`. Para ver/editar la base con interfaz gráfica: `npm run db:studio --prefix server`.

## 2. Desarrollo

```bash
npm run dev
```

- Sitio: http://localhost:5173 (catálogo en http://localhost:5173/modelos)
- API: http://localhost:4000 (health check en `/health`)
- Panel: http://localhost:5173/admin

---

## 3. Qué reemplazar: los `[COMPLETAR]`

Dirección, teléfono, WhatsApp, horarios, Instagram y reseñas vienen como **placeholders `[COMPLETAR]`**. Se cambian de dos formas:

1. **Desde el panel `/admin`** → pestañas *Dados da loja* y *Avaliações* (recomendado; se ve en el sitio al instante).
2. **Desde el seed** → `server/prisma/seed.ts` (objetos `storeInfo` y `reviews`) y luego `npm run db:seed --prefix server`.
   ⚠️ El seed **borra y recrea** productos y reseñas.

Notas:
- **WhatsApp**: solo números con DDD, ej. `54999999999` (el `55` de Brasil se agrega solo). Mientras siga como `[COMPLETAR]`, los botones usan `VITE_WHATSAPP_NUMBER` del `client/.env`; si tampoco existe, abren WhatsApp para que el usuario elija el contacto.
- **Contadores** de la sección Atacado (100+, 50+, 27): son ejemplos — ajústalos en *Dados da loja → Contadores*.
- **Productos**: son ejemplos. Sin foto, cada modelo se dibuja como un tenis SVG con sus 3 colores; al cargar una URL de foto en el admin, se usa la foto (con lazy-load).
- Las coordenadas (-27.6370527, -52.3100348) ya están cargadas.

---

## 4. API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Lista. Filtros: `?category=masculino\|feminino\|infantil\|esportivo`, `?featured=true`, `?minPrice=`, `?maxPrice=` |
| GET | `/api/products/:id` | Detalle (acepta id o slug) |
| POST | `/api/wholesale-leads` | Formulario mayorista (Zod → BD → email). Rate-limit: 5 envíos / 15 min por IP |
| GET | `/api/store-info` | Dirección, horarios, teléfono, redes, coordenadas, contadores |
| GET | `/api/reviews` | Reseñas destacadas |
| POST | `/api/admin/login` | `{ username, password }` → `{ token }` (rate-limit 10 / 15 min) |
| — | `/api/admin/*` | Requiere `Authorization: Bearer <token>`: CRUD de productos y reseñas, leads (listar / cambiar estado / borrar), `PUT store-info` |

Middlewares: `helmet`, CORS con lista blanca, `express-rate-limit`, manejo centralizado de errores (`server/src/middleware/error.ts`: errores de Zod → 400 con errores por campo, que el formulario del front muestra bajo cada input).

---

## 5. Frontend: dónde está cada cosa

| Componente | Archivo | Técnica |
|---|---|---|
| Preloader (NIKA letra por letra + cortina vertical) | `components/Preloader.tsx` | Framer `pathLength` + `AnimatePresence` exit. Solo 1 vez por sesión |
| Hero (palabra por palabra + tenis 3D que sigue el mouse) | `components/Hero.tsx` | `useMotionValue` → `useSpring` → `useTransform` |
| Marquee que acelera con el scroll | `components/Marquee.tsx` | `useScroll` + `useVelocity` + `useAnimationFrame` |
| Carrusel de categorías (presionar y arrastrar) | `components/Categories.tsx` | Framer `drag="x"` con inercia, flechas, barra de progreso; funciona igual con mouse y con el dedo |
| Página del catálogo `/modelos` (filtro en la URL: `?categoria=feminino`) | `pages/Catalog.tsx` | página aparte para que la home sea más liviana |
| Grid de productos (skeletons, stagger, tilt 3D) | `components/ProductGrid.tsx`, `ProductCard.tsx` | React Query + variants de Framer |
| Modal con shared layout | `components/ProductModal.tsx` | `layoutId` compartido con la tarjeta |
| Mayoristas (contadores + formulario) | `components/Wholesale.tsx` | React Hook Form + Zod, `useMutation`, check animado al enviar |
| Por qué Nika | `components/WhyNika.tsx` | fade-up con stagger |
| Reseñas | `components/Reviews.tsx` | carrusel automático, arrastrable, estrellas que se rellenan |
| Ubicación | `components/StoreLocation.tsx` | Google Maps embebido (sin API key) + pin con pulso |
| Footer, botón de WhatsApp, cursor | `Footer.tsx`, `WhatsAppButton.tsx`, `CustomCursor.tsx` | el cursor solo aparece con mouse (no en táctiles) |
| Colores y modo oscuro | `src/index.css` (variables `--c-*`), `lib/theme.ts`, `components/ThemeToggle.tsx` | Claro (blanco + rosa de la marca) por defecto; el botón sol/luna del menú cambia a oscuro y se recuerda en el navegador. Para cambiar un color de la marca, edita solo las variables en `index.css` |
| SEO | `components/Seo.tsx` | `react-helmet-async` + JSON-LD `ShoeStore` |
| Scroll suave | `lib/smoothScroll.tsx` | Lenis sincronizado con el ticker de GSAP |
| Panel admin | `pages/admin/*` | carga diferida (code-splitting) |

**Accesibilidad y rendimiento**
- `hooks/useReducedMotion.ts` + `<MotionConfig reducedMotion="user">`: con *prefers-reduced-motion* se desactivan Lenis, el preloader, el tilt, el marquee y el cursor.
- Las animaciones usan solo `transform`/`opacity`. Rutas con `React.lazy`, librerías de animación en chunks separados e imágenes con `loading="lazy"`.
- En el celular el tilt se desactiva (`(hover: hover) and (pointer: fine)`).

---

## 6. Despliegue sugerido

### Backend → Render (o Railway)

1. New → **Web Service**, root directory `server`.
2. Build: `npm install && npm run build`
3. Start: `npm run start:prod` (aplica el schema a la BD y arranca; el disco persistente solo existe en runtime, por eso no va en el build).
4. Variables: todas las de `server/.env.example`, con `NODE_ENV=production` y `CLIENT_ORIGIN=https://tu-sitio.vercel.app`.
5. **Persistencia de SQLite**: en Render agrega un **Persistent Disk** (ej. montado en `/var/data`) y usa `DATABASE_URL="file:/var/data/nika.db"`. En Railway, un Volume.
6. **Seed, solo la primera vez**: desde la *Shell* del servicio, `npm run db:seed`. No lo repitas después: borra los productos cargados por el admin.
   *Alternativa:* PostgreSQL gestionado → cambia `provider = "postgresql"` en `server/prisma/schema.prisma` y pon su URL en `DATABASE_URL` (el schema solo usa tipos portables).

### Frontend → Vercel

1. Importa el repo, root directory `client`, framework **Vite**.
2. Variables: `VITE_API_URL=https://tu-api.onrender.com` y, opcionalmente, `VITE_WHATSAPP_NUMBER`.
3. `client/vercel.json` ya incluye el rewrite para que `/admin` funcione al recargar la página.

---

## 7. Scripts

| Dónde | Script | Qué hace |
|---|---|---|
| raíz | `npm run dev` | server + client a la vez (concurrently) |
| raíz | `npm run setup` | crea la BD y corre el seed |
| raíz | `npm run build` | build de los dos |
| server | `npm run db:seed` | recarga el seed |
| server | `npm run db:studio` | Prisma Studio |
| client | `npm run preview` | sirve el build de producción |
