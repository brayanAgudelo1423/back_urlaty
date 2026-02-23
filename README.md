# Back Urlaty — Joyería

- **Admin**: login con usuario/contraseña; edición de catálogo principal, tienda aliada (Oro laminado 18K / Plata ley 925 con filtros por tipo) y galerías (Personaliza tu cadena / pulsera). Todos los productos de `aliadas/joyeria/page.tsx` (oro, plata, galerías) son editables desde el panel.
- **API**: `GET/PUT /api/products`, `GET/PUT /api/aliada-joyeria/products`, `GET/PUT /api/aliada-joyeria/galleries/:section/:id`, `POST /api/upload`.

Para volver a extraer todos los productos oro/plata desde el front (si cambias `urlaty/app/aliadas/joyeria/page.tsx`), ejecuta desde esta carpeta: `npm run seed:joyeria`. Necesitas tener el proyecto `urlaty` en la carpeta hermana (mismo padre que `back_urlaty`).

## Arrancar

```bash
cd back_urlaty
npm install
cp .env.example .env
npm run dev
```

Servidor en **http://localhost:4001**.

## Variables de entorno (.env)

| Variable        | Descripción                          |
|----------------|--------------------------------------|
| PORT           | Puerto (default 4001)                |
| ADMIN_USER     | Usuario admin (default: admin)       |
| ADMIN_PASSWORD | Contraseña admin (default: urlaty2025) |
| ADMIN_TOKEN    | Token secreto para API admin         |
