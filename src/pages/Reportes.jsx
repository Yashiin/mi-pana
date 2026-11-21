import { useState } from "react";
import { TrendingUp, ShoppingBag, DollarSign, Users, Award, Calendar } from "lucide-react";
import { METODOS_PAGO, obtenerFechaISO, obtenerFechaPedidoISO } from "../data/store";

const FILTROS_RAPIDOS = [
  { id: "hoy", label: "Hoy" },
  { id: "ayer", label: "Ayer" },
  { id: "semana", label: "Últimos 7 días" },
  { id: "mes", label: "Este mes" },
  { id: "todos", label: "Todo" },
];

export default function Reportes({ pedidos }) {
  const [filtro, setFiltro] = useState("hoy");
  const [fechaEspecifica, setFechaEspecifica] = useState(obtenerFechaISO());

  const hoy = new Date();
  const hoyISO = obtenerFechaISO(hoy);

  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const ayerISO = obtenerFechaISO(ayer);

  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hace7Dias.getDate() - 6);
  const hace7DiasISO = obtenerFechaISO(hace7Dias);

  const inicioMesISO = `${hoyISO.slice(0, 7)}-01`;

  const pedidosHoy = pedidos.filter(p => {
    if (!p.pagado) return false;
    const f = obtenerFechaPedidoISO(p);
    if (filtro === "hoy") return f === hoyISO;
    if (filtro === "ayer") return f === ayerISO;
    if (filtro === "semana") return f >= hace7DiasISO && f <= hoyISO;
    if (filtro === "mes") return f >= inicioMesISO && f <= hoyISO;
    if (filtro === "fecha") return f === fechaEspecifica;
    return true;
  });

  const etiquetaPeriodo =
    filtro === "hoy" ? "del Día" :
    filtro === "ayer" ? "de Ayer" :
    filtro === "semana" ? "de los Últimos 7 Días" :
    filtro === "mes" ? "del Mes" :
    filtro === "fecha" ? `del ${fechaEspecifica.split("-").reverse().join("/")}` :
    "Históricas";

  // Métricas principales
  const totalVentas = pedidosHoy.reduce((s, p) => s + p.total, 0);
  const totalPedidos = pedidosHoy.length;
  const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

  // Ventas por método de pago
  const porMetodo = METODOS_PAGO.map(m => {
    let total = 0;
    let cantidad = 0;
    pedidosHoy.forEach(p => {
      if (p.pagos && p.pagos.length > 0) {
        const sumaMetodo = p.pagos
          .filter(pg => pg.metodoPago === m)
          .reduce((s, pg) => s + pg.monto, 0);
        if (sumaMetodo > 0) {
          total += sumaMetodo;
          cantidad += 1;
        }
      } else if (p.metodoPago === m) {
        total += p.total;
        cantidad += 1;
      }
    });
    return { nombre: m, total, cantidad };
  }).filter(m => m.cantidad > 0);

  // Items más vendidos
  const itemsConteo = {};
  pedidosHoy.forEach(pedido => {
    pedido.items.forEach(item => {
      if (!itemsConteo[item.nombre]) itemsConteo[item.nombre] = { nombre: item.nombre, cantidad: 0, total: 0 };
      itemsConteo[item.nombre].cantidad += item.cantidad;
      itemsConteo[item.nombre].total += item.precio * item.cantidad;
    });
  });
  const rankingItems = Object.values(itemsConteo).sort((a, b) => b.cantidad - a.cantidad);

  // Ventas por hora
  const porHora = {};
  pedidosHoy.forEach(p => {
    const hora = p.horaPago?.split(":")[0] || "00";
    if (!porHora[hora]) porHora[hora] = 0;
    porHora[hora] += p.total;
  });
  const horasOrdenadas = Object.entries(porHora).sort((a, b) => a[0].localeCompare(b[0]));
  const maxHora = Math.max(...horasOrdenadas.map(([, v]) => v), 1);

  const metodoColores = {
    Efectivo: "bg-emerald-500",
    Tarjeta: "bg-blue-500",
    Transferencia: "bg-purple-500",
    PIX: "bg-orange-500",
  };

  return (
    <div className="flex flex-col gap-6 overflow-y-auto pb-4 h-full">

      {/* ─── FILTRO DE DÍAS ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 rounded-2xl border border-slate-700 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={16} className="text-orange-400 ml-1" />
          {FILTROS_RAPIDOS.map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filtro === f.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Día específico:</span>
          <input
            type="date"
            value={fechaEspecifica}
            onChange={e => {
              if (e.target.value) {
                setFechaEspecifica(e.target.value);
                setFiltro("fecha");
              }
            }}
            className={`px-3 py-1.5 rounded-xl bg-slate-900 border text-white text-xs focus:outline-none ${
              filtro === "fecha" ? "border-orange-500" : "border-slate-700 focus:border-orange-500"
            }`}
          />
        </div>
      </div>

      {/* ─── MÉTRICAS PRINCIPALES ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: `Ventas ${etiquetaPeriodo}`, value: `R$ ${totalVentas.toFixed(2)}`, icon: <DollarSign size={20} />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Total de Pedidos", value: totalPedidos, icon: <ShoppingBag size={20} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Ticket Promedio", value: `R$ ${ticketPromedio.toFixed(2)}`, icon: <TrendingUp size={20} />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "Mesas Atendidas", value: new Set(pedidosHoy.map(p => p.mesa)).size, icon: <Users size={20} />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map(m => (
          <div key={m.label} className={`bg-slate-800 rounded-2xl border p-5 flex flex-col gap-3 ${m.bg}`}>
            <div className={`${m.color}`}>{m.icon}</div>
            <div>
              <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-slate-400 text-xs mt-1">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ─── PRODUCTOS MÁS VENDIDOS ─────────────────────────── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-orange-400" />
            <h3 className="font-bold text-white text-sm">Productos Más Vendidos</h3>
          </div>

          {rankingItems.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Sin datos disponibles</p>
          ) : (
            <div className="flex flex-col gap-3">
              {rankingItems.slice(0, 6).map((item, i) => (
                <div key={item.nombre} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? "bg-yellow-500 text-black" :
                    i === 1 ? "bg-slate-400 text-black" :
                    i === 2 ? "bg-orange-700 text-white" : "bg-slate-700 text-slate-300"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-sm font-medium truncate">{item.nombre}</p>
                      <p className="text-slate-300 text-sm font-bold ml-2 shrink-0">{item.cantidad} uds</p>
                    </div>
                    <div className="mt-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(item.cantidad / rankingItems[0].cantidad) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-emerald-400 text-sm font-bold shrink-0">R$ {item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── FORMA DE PAGO ──────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" /> Por Forma de Pago
            </h3>
            {porMetodo.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Sin datos disponibles</p>
            ) : (
              <div className="flex flex-col gap-3">
                {porMetodo.map(m => (
                  <div key={m.nombre} className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">{m.nombre}</span>
                      <div className="text-right">
                        <span className="text-white font-bold text-sm">R$ {m.total.toFixed(2)}</span>
                        <span className="text-slate-500 text-xs ml-2">({m.cantidad} ped.)</span>
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${metodoColores[m.nombre] || "bg-gray-500"}`}
                        style={{ width: `${(m.total / totalVentas) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ventas por hora */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm">Ventas por Hora</h3>
            {horasOrdenadas.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Sin datos disponibles</p>
            ) : (
              <div className="flex items-end gap-2 h-24">
                {horasOrdenadas.map(([hora, valor]) => (
                  <div key={hora} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-orange-500/70 rounded-t-sm transition-all"
                      style={{ height: `${(valor / maxHora) * 80}px` }}
                      title={`R$ ${valor.toFixed(2)}`}
                    />
                    <span className="text-slate-500 text-xs">{hora}h</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── HISTORIAL DE PEDIDOS ───────────────────────────────── */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-4">
        <h3 className="font-bold text-white text-sm">Historial de Pedidos ({pedidosHoy.length})</h3>
        {pedidosHoy.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">Sin pedidos cobrados en este periodo</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-700">
                  <th className="text-left pb-3 pr-4">Mesa</th>
                  <th className="text-left pb-3 pr-4">Fecha</th>
                  <th className="text-left pb-3 pr-4">Items</th>
                  <th className="text-left pb-3 pr-4">Hora Pedido</th>
                  <th className="text-left pb-3 pr-4">Hora Cobro</th>
                  <th className="text-left pb-3 pr-4">Método</th>
                  <th className="text-right pb-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {[...pedidosHoy].reverse().map(p => (
                  <tr key={p.id} className="text-slate-300 hover:bg-slate-700/30 transition-colors">
                    <td className="py-2.5 pr-4 font-bold text-white">#{p.mesa}</td>
                    <td className="py-2.5 pr-4 text-xs text-slate-400">{p.fechaPago || p.fecha || obtenerFechaPedidoISO(p)}</td>
                    <td className="py-2.5 pr-4 text-slate-400 text-xs">
                      {p.items.slice(0, 2).map(i => `${i.cantidad}x ${i.nombre}`).join(", ")}
                      {p.items.length > 2 && ` +${p.items.length - 2}`}
                    </td>
                    <td className="py-2.5 pr-4">{p.hora}</td>
                    <td className="py-2.5 pr-4">{p.horaPago}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        p.metodoPago === "Efectivo" ? "bg-green-500/20 text-green-400" :
                        p.metodoPago === "Tarjeta" ? "bg-blue-500/20 text-blue-400" :
                        p.metodoPago === "Dividido" ? "bg-orange-500/20 text-orange-400" :
                        "bg-purple-500/20 text-purple-400"
                      }`}>
                        {p.pagos?.length > 1 ? `Dividido (${p.pagos.length}x)` : p.metodoPago}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">R$ {p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
