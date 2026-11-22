# Mi Pana — Sistema de Ventas (POS)

Aplicación web de punto de venta (POS) y gestión para restaurante / comida rápida, diseñada para administrar pedidos, cocina, caja, menú, inventario y reportes de ventas desde el navegador.

## Características y Módulos

- **Pedidos (`src/pages/Pedidos.jsx`)**: Toma de pedidos por mesa, filtrado por categoría, carrito interactivo, edición de pedidos activos, seguimiento de estado en cocina y validación automática de disponibilidad según stock y recetas.
- **Caja (`src/pages/Caja.jsx`)**: Cobro de pedidos entregados con soporte para múltiples métodos de pago (**Efectivo**, **Tarjeta**, **Transferencia** y **PIX**) y división de cuenta entre varias personas.
- **Reportes (`src/pages/Reportes.jsx`)**: Métricas de ventas totales, cantidad de pedidos, ticket promedio y desglose por método de pago con filtros por período (*Hoy*, *Ayer*, *Últimos 7 días*, *Este mes*, fecha específica o histórico).
- **Alimentos (`src/pages/Alimentos.jsx`)**: Administración del catálogo de productos (arepas, empanadas, hamburguesas, perros calientes, salchipapas, patacones, club house, bebidas, etc.) con creación, edición, eliminación, búsqueda, filtros por categoría y control de disponibilidad.
- **Inventario (`src/pages/Inventario.jsx`)**: Control de insumos y stock de productos con alertas visuales de stock bajo o agotado, además de vinculación de recetas (insumos consumidos por cada producto).
- **Persistencia local**: Todos los datos (`pos_pedidos`, `pos_alimentos`, `pos_insumos`) se guardan automáticamente en `localStorage`, con opción para restablecer los datos iniciales desde la barra superior.

## Stack Tecnológico

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [Oxlint](https://oxc.rs/)

## Estructura del Proyecto

```text
mi-pana/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx             # Navegación principal, badges de estado y persistencia
    ├── main.jsx
    ├── data/
    │   └── store.js        # Catálogo inicial, insumos iniciales y utilidades
    └── pages/
        ├── Pedidos.jsx
        ├── Caja.jsx
        ├── Reportes.jsx
        ├── Alimentos.jsx
        └── Inventario.jsx
```

## Instalación y Uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Yashiin/mi-pana.git
   cd mi-pana
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo con Vite |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run preview` | Previsualiza localmente el build de producción |
| `npm run lint` | Ejecuta el linter con Oxlint |
