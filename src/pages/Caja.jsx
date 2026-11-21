import { useState } from "react";
import { CreditCard, Banknote, Smartphone, Check, Users, Plus, Minus } from "lucide-react";
import { METODOS_PAGO, obtenerFechaISO, obtenerFechaPedidoISO } from "../data/store";

const metodoIcono = {
  Efectivo: <Banknote size={16} />,
  Tarjeta: <CreditCard size={16} />,
  Transferencia: <Smartphone size={16} />,
  PIX: <Smartphone size={16} />,
};

function calcularCuotasIguales(total, personas) {
  const base = Math.floor((total / personas) * 100) / 100;
  const cuotas = Array.from({ length: personas }, () => base);
  const sumaBase = +(base * personas).toFixed(2);
  const diferencia = +(total - sumaBase).toFixed(2);
  if (diferencia !== 0) {
    cuotas[cuotas.length - 1] = +(cuotas[cuotas.length - 1] + diferencia).toFixed(2);
  }
  return cuotas;
}

export default function Caja({ pedidos, setPedidos }) {
  const [metodoPago, setMetodoPago] = useState({});
  const [divisiones, setDivisiones] = useState({});

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

  const toggleDividir = (pedido) => {
    setDivisiones(prev => {
      if (prev[pedido.id]) {
        const n = { ...prev };
        delete n[pedido.id];
        return n;
      }
      const cuotas = calcularCuotasIguales(pedido.total, 2);
      return {
        ...prev,
        [pedido.id]: {
          personas: 2,
          pagos: cuotas.map(m => ({ monto: m.toFixed(2), metodo: "" })),
        },
      };
    });
  };

  const cambiarPersonas = (pedido, delta) => {
    setDivisiones(prev => {
      const actual = prev[pedido.id];
      if (!actual) return prev;
      const nuevasPersonas = Math.max(2, Math.min(10, actual.personas + delta));
      const cuotas = calcularCuotasIguales(pedido.total, nuevasPersonas);
      return {
        ...prev,
        [pedido.id]: {
          personas: nuevasPersonas,
          pagos: cuotas.map((m, idx) => ({
            monto: m.toFixed(2),
            metodo: actual.pagos[idx]?.metodo || "",
          })),
        },
      };
    });
  };

  const actualizarPagoParcial = (pedidoId, index, campo, valor) => {
    setDivisiones(prev => {
      const actual = prev[pedidoId];
      if (!actual) return prev;
      const pagos = actual.pagos.map((pg, i) =>
        i === index ? { ...pg, [campo]: valor } : pg
      );
      return { ...prev, [pedidoId]: { ...actual, pagos } };
    });
  };

  const confirmarPagoDividido = (pedido) => {
    const div = divisiones[pedido.id];
    if (!div) return;
    const suma = div.pagos.reduce((s, pg) => s + (parseFloat(pg.monto) || 0), 0);
    const todosValidos = div.pagos.every(pg => pg.metodo && parseFloat(pg.monto) > 0);
    if (!todosValidos || Math.abs(suma - pedido.total) >= 0.02) return;

    setPedidos(prev => prev.map(p =>
      p.id === pedido.id
        ? {
            ...p,
            pagado: true,
            metodoPago: "Dividido",
            pagos: div.pagos.map(pg => ({
              monto: parseFloat(pg.monto),
              metodoPago: pg.metodo,
            })),
            horaPago: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
            fechaPago: new Date().toLocaleDateString("es"),
            fechaPagoISO: obtenerFechaISO(),
          }
        : p
    ));
    setDivisiones(prev => { const n = { ...prev }; delete n[pedido.id]; return n; });
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

                {/* Método de pago / Dividir cuenta */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {divisiones[pedido.id] ? "Dividir cuenta" : "Forma de pago"}
                  </p>
                  <button
                    onClick={() => toggleDividir(pedido)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      divisiones[pedido.id]
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                    }`}
                  >
                    <Users size={13} />
                    {divisiones[pedido.id] ? "Pago único" : "Dividir cuenta"}
                  </button>
                </div>

                {!divisiones[pedido.id] ? (
                  <>
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

                    <button
                      onClick={() => confirmarPago(pedido.id)}
                      disabled={!metodoPago[pedido.id]}
                      className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-white"
                    >
                      ✓ Confirmar Pago
                    </button>
                  </>
                ) : (() => {
                  const div = divisiones[pedido.id];
                  const sumaPagos = div.pagos.reduce((s, pg) => s + (parseFloat(pg.monto) || 0), 0);
                  const diferencia = +(pedido.total - sumaPagos).toFixed(2);
                  const todosMetodos = div.pagos.every(pg => pg.metodo && parseFloat(pg.monto) > 0);
                  const listo = todosMetodos && Math.abs(diferencia) < 0.02;

                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-slate-900 rounded-xl px-3 py-2 border border-slate-700">
                        <span className="text-xs text-slate-400">Personas:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => cambiarPersonas(pedido, -1)}
                            className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-white font-bold text-sm w-5 text-center">{div.personas}</span>
                          <button
                            onClick={() => cambiarPersonas(pedido, 1)}
                            className="p-1 rounded-md bg-orange-500 hover:bg-orange-400 text-white"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-xs text-orange-400 font-semibold">
                          ~R$ {(pedido.total / div.personas).toFixed(2)} c/u
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {div.pagos.map((pg, idx) => (
                          <div key={idx} className="bg-slate-900 rounded-xl p-2.5 border border-slate-700 flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-bold w-6">#{idx + 1}</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={pg.monto}
                              onChange={e => actualizarPagoParcial(pedido.id, idx, "monto", e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-orange-500"
                            />
                            <select
                              value={pg.metodo}
                              onChange={e => actualizarPagoParcial(pedido.id, idx, "metodo", e.target.value)}
                              className="flex-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                            >
                              <option value="">Método...</option>
                              {METODOS_PAGO.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>

                      {Math.abs(diferencia) >= 0.02 && (
                        <p className="text-xs text-amber-400 text-right font-medium">
                          {diferencia > 0
                            ? `Falta asignar: R$ ${diferencia.toFixed(2)}`
                            : `Excede por: R$ ${Math.abs(diferencia).toFixed(2)}`}
                        </p>
                      )}

                      <button
                        onClick={() => confirmarPagoDividido(pedido)}
                        disabled={!listo}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-white"
                      >
                        ✓ Confirmar Pago Dividido
                      </button>
                    </div>
                  );
                })()}
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
              const total = pedidosPagadosHoy.reduce((s, p) => {
                if (p.pagos && p.pagos.length > 0) {
                  return s + p.pagos.filter(pg => pg.metodoPago === m).reduce((acc, pg) => acc + pg.monto, 0);
                }
                return p.metodoPago === m ? s + p.total : s;
              }, 0);
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">{pedido.horaPago}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  pedido.metodoPago === "Efectivo" ? "bg-green-500/20 text-green-400" :
                  pedido.metodoPago === "Tarjeta" ? "bg-blue-500/20 text-blue-400" :
                  pedido.metodoPago === "Dividido" ? "bg-orange-500/20 text-orange-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {pedido.pagos?.length > 1 ? `Dividido (${pedido.pagos.length}x)` : pedido.metodoPago}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
