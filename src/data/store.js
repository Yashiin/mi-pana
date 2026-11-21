// ─── ESTADO INICIAL ───────────────────────────────────────────
export const initialAlimentos = [
  { id: 1, nombre: "Hamburguesa de Carne", precio: 35.00, categoria: "Hamburguesas", disponible: true },
  { id: 2, nombre: "Hamburguesa de Pollo", precio: 35.00, categoria: "Hamburguesas", disponible: true },
  { id: 3, nombre: "Hamburguesa Mixta", precio: 40.00, categoria: "Hamburguesas", disponible: true },
  { id: 4, nombre: "Perro Sencillo", precio: 18.00, categoria: "Perros Calientes", disponible: true },
  { id: 5, nombre: "Perro Especial", precio: 25.00, categoria: "Perros Calientes", disponible: true },
  { id: 6, nombre: "Perro de Carne", precio: 30.00, categoria: "Perros Calientes", disponible: true },
  { id: 7, nombre: "Perro de Pollo", precio: 30.00, categoria: "Perros Calientes", disponible: true },
  { id: 8, nombre: "Perro Mixto", precio: 35.00, categoria: "Perros Calientes", disponible: true },
  { id: 9, nombre: "Empanadas de Carne", precio: 18.00, categoria: "Empanadas", disponible: true },
  { id: 10, nombre: "Empanadas de Pollo", precio: 18.00, categoria: "Empanadas", disponible: true },
  { id: 11, nombre: "Empanadas de Salchiqueso", precio: 18.00, categoria: "Empanadas", disponible: true },
  { id: 12, nombre: "Empanada de Jamon y Queso", precio: 18.00, categoria: "Empanadas", disponible: true },
  { id: 13, nombre: "Empanada de Calabresa c/Queso", precio: 18.00, categoria: "Empanadas", disponible: true },
  { id: 14, nombre: "Empanada de Pollo c/Queso", precio: 18.00, categoria: "Empanadas", disponible: true },
  { id: 15, nombre: "Empanadas Cordon Blue de Pollo", precio: 23.00, categoria: "Empanadas", disponible: true },
  { id: 16, nombre: "Empanadas Cordon Blue de Carne", precio: 23.00, categoria: "Empanadas", disponible: true },
  { id: 17, nombre: "Empanadas Pabellon Criollo", precio: 23.00, categoria: "Empanadas", disponible: true },
  { id: 18, nombre: "Empanadas Pollo Especial", precio: 23.00, categoria: "Empanadas", disponible: true },
  { id: 19, nombre: "Empanadas Carne Especial", precio: 23.00, categoria: "Empanadas", disponible: true },
  { id: 20, nombre: "Salchipapa Sencilla", precio: 23.00, categoria: "Salchipapas", disponible: true },
  { id: 21, nombre: "Salchipapa de Pollo", precio: 30.00, categoria: "Salchipapas", disponible: true },
  { id: 22, nombre: "Salchipapa de Carne", precio: 30.00, categoria: "Salchipapas", disponible: true },
  { id: 23, nombre: "Salchipapa Mixta", precio: 35.00, categoria: "Salchipapas", disponible: true },
  { id: 24, nombre: "Salchipapa Especial", precio: 40.00, categoria: "Salchipapas", disponible: true },
  { id: 25, nombre: "Club House", precio: 30.00, categoria: "Club House", disponible: true },
  { id: 26, nombre: "Patacon de Carne", precio: 35.00, categoria: "Patacon criollo", disponible: true },
  { id: 27, nombre: "Patacon de Pollo", precio: 35.00, categoria: "Patacon criollo", disponible: true },
  { id: 28, nombre: "Patacon Mixto", precio: 40.00, categoria: "Patacon criollo", disponible: true },
  { id: 29, nombre: "Arepa Viuda", precio: 8.00, categoria: "Arepas", disponible: true },
  { id: 30, nombre: "Arepa de Queso", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 31, nombre: "Arepa de Carne Mechada", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 32, nombre: "Arepa de Pollo Mechado", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 33, nombre: "Arepa de Pollo en Filet", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 34, nombre: "Arepa de Jamon y Queso", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 35, nombre: "Arepa de Calabresa", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 36, nombre: "Arepa de Calabresa c/Queso", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 37, nombre: "Arepa de Perico", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 57, nombre: "Arepa de Pollo c/Queso", precio: 22.00, categoria: "Arepas", disponible: true },
  { id: 38, nombre: "Arepa de Cordon Blue de Pollo", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 39, nombre: "Arepa de Cordon Blue de Carne", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 40, nombre: "Arepa de Llanera", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 41, nombre: "Arepa de Reina Pepiada", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 42, nombre: "Arepa La Peluda", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 43, nombre: "Arepa de Reina Peluda", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 44, nombre: "Arepa de Pabellon Criollo", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 45, nombre: "Arepa La Catira", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 46, nombre: "Arepa La Sifrina", precio: 25.00, categoria: "Arepas", disponible: true },
  { id: 47, nombre: "Coca Cola 350ml", precio: 7.50, categoria: "Bebidas", disponible: true },
  { id: 48, nombre: "Coca Cola 1L", precio: 12.00, categoria: "Bebidas", disponible: true },
  { id: 49, nombre: "Coca Cola 1.5L", precio: 15.00, categoria: "Bebidas", disponible: true },
  { id: 50, nombre: "Coca Cola 2L", precio: 20.00, categoria: "Bebidas", disponible: true },
  { id: 51, nombre: "Cerveza", precio: 7.00, categoria: "Bebidas", disponible: true },
  { id: 52, nombre: "Malta", precio: 12.00, categoria: "Bebidas", disponible: true },
  { id: 53, nombre: "Papelon con Limon", precio: 15.00, categoria: "Bebidas", disponible: true },
  { id: 54, nombre: "Harina Pan", precio: 17.00, categoria: "Otros", disponible: true },
  { id: 55, nombre: "Queso Llanero 1Kg", precio: 63.00, categoria: "Otros", disponible: true },
  { id: 56, nombre: "Queso Llanero 500g", precio: 31.50, categoria: "Otros", disponible: true },
  { id: 58, nombre: "Tequeños (10 Unidades)", precio: 35.00, categoria: "Otros", disponible: true },
  { id: 59, nombre: "Adicional Queso", precio: 6.00, categoria: "Adicionales", disponible: true },
  { id: 60, nombre: "Adicional Queso Blanco Llanero", precio: 8.00, categoria: "Adicionales", disponible: true },
  { id: 61, nombre: "Adicional Jamon", precio: 5.00, categoria: "Adicionales", disponible: true },
  { id: 62, nombre: "Adicional Aguacate", precio: 5.00, categoria: "Adicionales", disponible: true },
  { id: 63, nombre: "Adicional Platano", precio: 4.00, categoria: "Adicionales", disponible: true },
  { id: 64, nombre: "Adicional Salchicha", precio: 3.00, categoria: "Adicionales", disponible: true },
  { id: 65, nombre: "Adicional Caraota", precio: 3.00, categoria: "Adicionales", disponible: true },
  { id: 66, nombre: "Adicional Huevo", precio: 3.00, categoria: "Adicionales", disponible: true },
  { id: 67, nombre: "Adicional Tomate", precio: 3.00, categoria: "Adicionales", disponible: true },
  { id: 68, nombre: "Adicional Cebolla", precio: 3.00, categoria: "Adicionales", disponible: true },
  { id: 69, nombre: "Adicional Lechuga", precio: 2.50, categoria: "Adicionales", disponible: true },
  { id: 70, nombre: "Adicional Papita", precio: 4.00, categoria: "Adicionales", disponible: true },
  { id: 71, nombre: "Adicional Tocineta", precio: 5.00, categoria: "Adicionales", disponible: true },
  { id: 72, nombre: "Adicional Papas Fritas", precio: 10.00, categoria: "Adicionales", disponible: true },
  { id: 73, nombre: "Adicional Filet de Pollo", precio: 7.00, categoria: "Adicionales", disponible: true },
  { id: 74, nombre: "Adicional Filet de Carne", precio: 10.00, categoria: "Adicionales", disponible: true },
  { id: 75, nombre: "Adicional Carne de Hamburguer", precio: 10.00, categoria: "Adicionales", disponible: true },
  { id: 76, nombre: "Adicional Calabresa Rebanada", precio: 7.00, categoria: "Adicionales", disponible: true },
  { id: 77, nombre: "Adicional Pollo Mechado", precio: 8.00, categoria: "Adicionales", disponible: true },
  { id: 78, nombre: "Adicional Carne Mechada", precio: 11.00, categoria: "Adicionales", disponible: true },
];

export const CATEGORIAS = ["Hamburguesas", "Perros Calientes", "Salchipapas", "Bebidas", "Empanadas", "Arepas", "Patacon criollo", "Club House", "Adicionales", "Otros"];

export const METODOS_PAGO = ["Efectivo", "Tarjeta", "Transferencia", "PIX"];

// ─── HELPERS DE FECHA (LOCAL YYYY-MM-DD) ─────────────────────
export function obtenerFechaISO(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function obtenerFechaPedidoISO(pedido) {
  if (pedido.fechaPagoISO) return pedido.fechaPagoISO;
  if (pedido.fechaISO) return pedido.fechaISO;
  if (pedido.fechaHoraCompleta) {
    const iso = obtenerFechaISO(new Date(pedido.fechaHoraCompleta));
    if (iso) return iso;
  }
  if (pedido.fecha && typeof pedido.fecha === "string") {
    const partes = pedido.fecha.split("/");
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }
  return obtenerFechaISO(new Date(pedido.id));
}
