import { useState } from "react";
import { Plus, Minus, ShoppingCart, X, Check, ChefHat, Clock } from "lucide-react";
import { obtenerFechaISO } from "../data/store";

export default function Pedidos({ alimentos, pedidos, setPedidos }) {
  const [mesa, setMesa] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  const categorias = ["Todos", ...new Set(alimentos.filter(a => a.disponible).map(a => a.categoria))];

  const alimentosFiltrados = alimentos.filter(a =>
    a.disponible && (categoriaFiltro === "Todos" || a.categoria === categoriaFiltro)
  );

  const agregarAlCarrito = (alimento) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === alimento.id);
      if (existe) return prev.map(i => i.id === alimento.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...alimento, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (id) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id === id);
      if (item.cantidad === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i);
    });
  };

  const cantidadEnCarrito = (id) => carrito.find(i => i.id === id)?.cantidad || 0;

  const total = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  const enviarPedido = () => {
  if (!mesa || carrito.length === 0) return;

  // ── Validación nueva ──────────────────────────────
  const mesaOcupada = pedidos.some(
    p => p.mesa === parseInt(mesa) && !p.pagado
  );
  if (mesaOcupada) {
    alert(`La mesa ${mesa} ya tiene un pedido activo`);
    return;
  }
  // ─────────────────────────────────────────────────

  const nuevo = {
      id: Date.now(),
      mesa: parseInt(mesa),
      items: [...carrito],
      total,
      estado: "pendiente",
      hora: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
      fecha: new Date().toLocaleDateString("es"),
      fechaISO: obtenerFechaISO(),
      fechaHoraCompleta: new Date(),
      pagado: false,
    };
    setPedidos(prev => [nuevo, ...prev]);
    setCarrito([]);
    setMesa("");
  };

  const cambiarEstado = (id, estado) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const estadoColor = {
    pendiente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    preparando: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    entregado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const estadoIcono = {
    pendiente: <Clock size={12} />,
    preparando: <ChefHat size={12} />,
    entregado: <Check size={12} />,
  };

  const pedidosActivos = pedidos.filter(p => !p.pagado);

  return (
    <div className="flex gap-4 h-full">
      {/* ─── PANEL IZQUIERDO: MENÚ ─────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Mesa + Categorías */}
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="number"
            placeholder="Nº Mesa"
            value={mesa}
            onChange={e => setMesa(e.target.value)}
            className="w-28 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  categoriaFiltro === cat
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de alimentos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
          {alimentosFiltrados.map(alimento => {
            const qty = cantidadEnCarrito(alimento.id);
            return (
              <div
                key={alimento.id}
                className={`bg-slate-800 rounded-2xl p-4 border transition-all ${
                  qty > 0 ? "border-orange-500/50 shadow-lg shadow-orange-500/10" : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-orange-400 font-medium">{alimento.categoria}</p>
                    <p className="text-white font-semibold text-sm leading-tight mt-0.5">{alimento.nombre}</p>
                    <p className="text-slate-300 font-bold mt-1">R$ {alimento.precio.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {qty === 0 ? (
                      <button
                        onClick={() => agregarAlCarrito(alimento)}
                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full justify-center"
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full justify-between bg-slate-900 rounded-lg p-1">
                        <button onClick={() => quitarDelCarrito(alimento.id)} className="bg-slate-700 hover:bg-slate-600 rounded-md p-1 text-white transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-white font-bold text-sm">{qty}</span>
                        <button onClick={() => agregarAlCarrito(alimento)} className="bg-orange-500 hover:bg-orange-400 rounded-md p-1 text-white transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── PANEL DERECHO: CARRITO + PEDIDOS ACTIVOS ──────── */}
      <div className="w-72 flex flex-col gap-4 shrink-0">

        {/* Carrito */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-orange-400" />
            <h2 className="font-bold text-white text-sm">Pedido actual</h2>
            {mesa && <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">Mesa {mesa}</span>}
          </div>

          {carrito.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-4">Selecciona alimentos del menú</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {carrito.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.nombre}</p>
                    <p className="text-slate-400 text-xs">x{item.cantidad} · R$ {(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                  <button onClick={() => setCarrito(c => c.filter(i => i.id !== item.id))} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-white font-bold">R$ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={enviarPedido}
            disabled={!mesa || carrito.length === 0}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-400 text-white"
          >
            Enviar a Cocina
          </button>
        </div>

        {/* Pedidos activos */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pedidos Activos ({pedidosActivos.length})
          </h2>
          {pedidosActivos.length === 0 && (
            <p className="text-slate-600 text-xs text-center py-4">Sin pedidos activos</p>
          )}
          {pedidosActivos.map(pedido => (
            <div key={pedido.id} className="bg-slate-800 rounded-xl border border-slate-700 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">Mesa {pedido.mesa}</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${estadoColor[pedido.estado]}`}>
                  {estadoIcono[pedido.estado]}
                  {pedido.estado}
                </div>
              </div>
              <p className="text-slate-400 text-xs">{pedido.hora} · {pedido.items.length} items · <span className="text-white font-semibold">R$ {pedido.total.toFixed(2)}</span></p>
              <div className="flex gap-1.5">
                {pedido.estado === "pendiente" && (
                  <button onClick={() => cambiarEstado(pedido.id, "preparando")}
                    className="flex-1 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors font-medium">
                    Preparar
                  </button>
                )}
                {pedido.estado === "preparando" && (
                  <button onClick={() => cambiarEstado(pedido.id, "entregado")}
                    className="flex-1 py-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium">
                    Entregar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
