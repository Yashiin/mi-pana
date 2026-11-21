import { useState } from "react";
import { Plus, Minus, ShoppingCart, X, Check, ChefHat, Clock, Pencil } from "lucide-react";
import { obtenerFechaISO } from "../data/store";

export default function Pedidos({ alimentos, setAlimentos, pedidos, setPedidos }) {
  const [mesa, setMesa] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [editandoPedidoId, setEditandoPedidoId] = useState(null);

  const categorias = ["Todos", ...new Set(alimentos.filter(a => a.disponible).map(a => a.categoria))];

  const alimentosFiltrados = alimentos.filter(a =>
    a.disponible && (categoriaFiltro === "Todos" || a.categoria === categoriaFiltro)
  );

  const maxDisponiblePara = (alimento) => {
    if (!alimento.controlarStock) return Infinity;
    const enPedidoEditado = editandoPedidoId !== null
      ? (pedidos.find(p => p.id === editandoPedidoId)?.items.find(i => i.id === alimento.id)?.cantidad || 0)
      : 0;
    return (alimento.stock ?? 0) + enPedidoEditado;
  };

  const agregarAlCarrito = (alimento) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === alimento.id);
      const actual = existe ? existe.cantidad : 0;
      if (actual >= maxDisponiblePara(alimento)) return prev;
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

  const iniciarEdicion = (pedido) => {
    setEditandoPedidoId(pedido.id);
    setMesa(String(pedido.mesa));
    setCarrito(pedido.items.map(i => ({ ...i })));
  };

  const cancelarEdicion = () => {
    setEditandoPedidoId(null);
    setMesa("");
    setCarrito([]);
  };

  const pedidosActivos = pedidos.filter(p => !p.pagado);
  const mesasOcupadas = new Set(pedidosActivos.map(p => p.mesa));
  let mesaAuto = 1;
  while (mesasOcupadas.has(mesaAuto)) {
    mesaAuto += 1;
  }

  const aplicarAjusteStock = (deltas) => {
    if (!setAlimentos) return;
    setAlimentos(prev => prev.map(a => {
      if (!a.controlarStock || !deltas[a.id]) return a;
      return { ...a, stock: Math.max(0, (a.stock ?? 0) - deltas[a.id]) };
    }));
  };

  const enviarPedido = () => {
    if (carrito.length === 0) return;

    const mesaNumero = mesa.trim() !== "" ? parseInt(mesa) : mesaAuto;
    if (isNaN(mesaNumero) || mesaNumero <= 0) return;

    if (editandoPedidoId !== null) {
      const pedidoOriginal = pedidos.find(p => p.id === editandoPedidoId);
      const deltas = {};
      if (pedidoOriginal) {
        pedidoOriginal.items.forEach(i => { deltas[i.id] = (deltas[i.id] || 0) - i.cantidad; });
      }
      carrito.forEach(i => { deltas[i.id] = (deltas[i.id] || 0) + i.cantidad; });
      aplicarAjusteStock(deltas);

      setPedidos(prev => prev.map(p =>
        p.id === editandoPedidoId
          ? {
              ...p,
              items: [...carrito],
              total,
              estado: p.estado === "entregado" ? "pendiente" : p.estado,
            }
          : p
      ));
      setEditandoPedidoId(null);
      setCarrito([]);
      setMesa("");
      return;
    }

    const pedidoExistente = pedidos.find(
      p => p.mesa === mesaNumero && !p.pagado
    );
    if (pedidoExistente) {
      if (!confirm(`La mesa ${mesaNumero} ya tiene un pedido activo. ¿Agregar estos platos a su cuenta?`)) {
        return;
      }
      const deltas = {};
      carrito.forEach(i => { deltas[i.id] = (deltas[i.id] || 0) + i.cantidad; });
      aplicarAjusteStock(deltas);

      setPedidos(prev => prev.map(p => {
        if (p.id !== pedidoExistente.id) return p;
        const itemsActualizados = p.items.map(i => ({ ...i }));
        carrito.forEach(nuevoItem => {
          const idx = itemsActualizados.findIndex(i => i.id === nuevoItem.id);
          if (idx >= 0) {
            itemsActualizados[idx].cantidad += nuevoItem.cantidad;
          } else {
            itemsActualizados.push({ ...nuevoItem });
          }
        });
        const nuevoTotal = itemsActualizados.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
        return {
          ...p,
          items: itemsActualizados,
          total: nuevoTotal,
          estado: p.estado === "entregado" ? "pendiente" : p.estado,
        };
      }));
      setCarrito([]);
      setMesa("");
      return;
    }

    const deltas = {};
    carrito.forEach(i => { deltas[i.id] = (deltas[i.id] || 0) + i.cantidad; });
    aplicarAjusteStock(deltas);

    const nuevo = {
      id: Date.now(),
      mesa: mesaNumero,
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

  return (
    <div className="flex gap-4 h-full">
      {/* ─── PANEL IZQUIERDO: MENÚ ─────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Mesa + Categorías */}
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="number"
            min="1"
            placeholder={`Auto (${mesaAuto})`}
            value={mesa}
            disabled={editandoPedidoId !== null}
            onChange={e => setMesa(e.target.value)}
            className="w-28 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm disabled:opacity-50"
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
            const maxDisp = maxDisponiblePara(alimento);
            const sinStock = alimento.controlarStock && maxDisp <= 0;
            const enLimite = alimento.controlarStock && qty >= maxDisp;
            const stockBajo = alimento.controlarStock && (alimento.stock ?? 0) <= (alimento.stockMinimo ?? 5);

            return (
              <div
                key={alimento.id}
                className={`bg-slate-800 rounded-2xl p-4 border transition-all ${
                  sinStock ? "border-red-500/30 opacity-60" :
                  qty > 0 ? "border-orange-500/50 shadow-lg shadow-orange-500/10" : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-orange-400 font-medium">{alimento.categoria}</p>
                      {alimento.controlarStock && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          (alimento.stock ?? 0) <= 0 ? "bg-red-500/20 text-red-400" :
                          stockBajo ? "bg-amber-500/20 text-amber-400" :
                          "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {(alimento.stock ?? 0) <= 0 ? "Agotado" : `Stock: ${alimento.stock}`}
                        </span>
                      )}
                    </div>
                    <p className="text-white font-semibold text-sm leading-tight mt-0.5">{alimento.nombre}</p>
                    <p className="text-slate-300 font-bold mt-1">R$ {alimento.precio.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {qty === 0 ? (
                      <button
                        onClick={() => agregarAlCarrito(alimento)}
                        disabled={sinStock}
                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full justify-center"
                      >
                        <Plus size={14} /> {sinStock ? "Agotado" : "Agregar"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full justify-between bg-slate-900 rounded-lg p-1">
                        <button onClick={() => quitarDelCarrito(alimento.id)} className="bg-slate-700 hover:bg-slate-600 rounded-md p-1 text-white transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-white font-bold text-sm">{qty}</span>
                        <button
                          onClick={() => agregarAlCarrito(alimento)}
                          disabled={enLimite}
                          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-md p-1 text-white transition-colors"
                        >
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
        <div className={`bg-slate-800 rounded-2xl border p-4 flex flex-col gap-3 ${
          editandoPedidoId !== null ? "border-orange-500/60" : "border-slate-700"
        }`}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-orange-400" />
            <h2 className="font-bold text-white text-sm">
              {editandoPedidoId !== null ? "Editando pedido" : "Pedido actual"}
            </h2>
            <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
              {mesa.trim() !== "" ? `Mesa ${mesa}` : `Auto: Mesa ${mesaAuto}`}
            </span>
            {editandoPedidoId !== null && (
              <button
                onClick={cancelarEdicion}
                title="Cancelar edición"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            )}
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

          <div className="flex gap-2">
            <button
              onClick={enviarPedido}
              disabled={carrito.length === 0}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-400 text-white"
            >
              {editandoPedidoId !== null ? "Actualizar Pedido" : "Enviar a Cocina"}
            </button>
            {editandoPedidoId !== null && (
              <button
                onClick={cancelarEdicion}
                className="px-3 py-2.5 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
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
            <div key={pedido.id} className={`bg-slate-800 rounded-xl border p-3 flex flex-col gap-2 ${
              editandoPedidoId === pedido.id ? "border-orange-500" : "border-slate-700"
            }`}>
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
                <button
                  onClick={() => iniciarEdicion(pedido)}
                  className="px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium flex items-center gap-1"
                  title="Editar o agregar platos a esta mesa"
                >
                  <Pencil size={12} /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
