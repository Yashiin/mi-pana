import { useState } from "react";
import { CreditCard, Banknote, Smartphone, Check } from "lucide-react";
import { METODOS_PAGO, obtenerFechaISO, obtenerFechaPedidoISO } from "../data/store";

const metodoIcono = {
  Efectivo: <Banknote size={16} />,
  Tarjeta: <CreditCard size={16} />,
  Transferencia: <Smartphone size={16} />,
  PIX: <Smartphone size={16} />,
};

export default function Caja({ pedidos, setPedidos }) {
  const [metodoPago, setMetodoPago] = useState({});

  const hoyISO = obtenerFechaISO();
  const pedidosParaPagar = pedidos.filter(p => !p.pagado && p.estado === "entregado");
  const pedidosPagadosHoy = pedidos.filter(p => p.pagado && obtenerFechaPedidoISO(p) === hoyISO);

  const confirmarPago = (pedidoId) => {
    const metodo = metodoPago[pedidoId];
    if (!metodo) return;
    setPedidos(prev => prev.map(p =>
      p.id === pedidoId
        ? {
            ...p,
            pagado: true,
            metodoPago: metodo,
            horaPago: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
            fechaPago: new Date().toLocaleDateString("es"),
            fechaPagoISO: obtenerFechaISO(),
          }
        : p
    ));
    setMetodoPago(prev => { const n = { ...prev }; delete n[pedidoId]; return n; });
  };

  const totalCajaHoy = pedidosPagadosHoy.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="flex gap-4 h-full">

      {/* ─── PEDIDOS PARA PAGAR ───────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white">Pedidos por Cobrar</h2>
          <span className="text-xs text-slate-400">{pedidosParaPagar.length} pendiente(s)</span>
        </div>

        {pedidosParaPagar.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Check size={48} className="text-emerald-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400">Sin pedidos pendientes de cobro</p>
              <p className="text-slate-600 text-sm mt-1">Los pedidos entregados aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
            {pedidosParaPagar.map(pedido => (
              <div key={pedido.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-black text-white">Mesa {pedido.mesa}</p>
                    <p className="text-slate-400 text-sm">{pedido.hora} · {pedido.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-black text-orange-400">R$ {pedido.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-slate-900/50 rounded-xl p-3 flex flex-col gap-1.5">
                  {pedido.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-300">{item.cantidad}x {item.nombre}</span>
                      <span className="text-white font-medium">R$ {(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Método de pago */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Forma de pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {METODOS_PAGO.map(m => (
                      <button
                        key={m}
                        onClick={() => setMetodoPago(prev => ({ ...prev, [pedido.id]: m }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          metodoPago[pedido.id] === m
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {metodoIcono[m]}
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => confirmarPago(pedido.id)}
                  disabled={!metodoPago[pedido.id]}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-white"
                >
                  ✓ Confirmar Pago
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── PANEL DERECHO: RESUMEN + HISTORIAL ─────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-4">

        {/* Resumen del día */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-3">
          <h3 className="font-bold text-white text-sm">Caja del Día</h3>
          <div className="text-3xl font-black text-emerald-400">R$ {totalCajaHoy.toFixed(2)}</div>
          <div className="grid grid-cols-2 gap-2">
            {METODOS_PAGO.map(m => {
              const total = pedidosPagadosHoy.filter(p => p.metodoPago === m).reduce((s, p) => s + p.total, 0);
              if (total === 0) return null;
              return (
                <div key={m} className="bg-slate-900 rounded-xl p-2.5">
                  <p className="text-slate-400 text-xs">{m}</p>
                  <p className="text-white font-bold text-sm">R$ {total.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historial */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Últimos cobros ({pedidosPagadosHoy.length})
          </h3>
          {pedidosPagadosHoy.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-4">Sin cobros hoy</p>
          )}
          {[...pedidosPagadosHoy].reverse().map(pedido => (
            <div key={pedido.id} className="bg-slate-800 rounded-xl border border-slate-700 p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">Mesa {pedido.mesa}</span>
                <span className="text-emerald-400 font-bold text-sm">R$ {pedido.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{pedido.horaPago}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  pedido.metodoPago === "Efectivo" ? "bg-green-500/20 text-green-400" :
                  pedido.metodoPago === "Tarjeta" ? "bg-blue-500/20 text-blue-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>{pedido.metodoPago}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
