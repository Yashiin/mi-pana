import { useState } from "react";
import {
  Package,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Link2,
} from "lucide-react";
import { CATEGORIAS, CATEGORIAS_INSUMO, UNIDADES_INSUMO } from "../data/store";

const emptyForm = {
  nombre: "",
  categoria: CATEGORIAS_INSUMO[0],
  cantidad: "",
  minimo: "",
  unidad: UNIDADES_INSUMO[0],
};

function estadoBadge(cantidad, minimo) {
  if (cantidad <= 0) {
    return { label: "Agotado", cls: "bg-red-500/20 text-red-400 border-red-500/30" };
  }
  if (cantidad <= minimo) {
    return { label: "Stock bajo", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  }
  return { label: "OK", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
}

export default function Inventario({ alimentos, setAlimentos, insumos, setInsumos }) {
  const [tab, setTab] = useState("insumos"); // "insumos" | "productos"
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [soloAlertas, setSoloAlertas] = useState(false);

  // Form insumos
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [errores, setErrores] = useState({});

  // Recetas (vínculo producto -> insumos)
  const [recetaProductoId, setRecetaProductoId] = useState(null);
  const [nuevoInsumoId, setNuevoInsumoId] = useState("");
  const [nuevaCantidadReceta, setNuevaCantidadReceta] = useState("1");

  // ─── INSUMOS ────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa un nombre";
    if (form.cantidad === "" || isNaN(form.cantidad) || parseFloat(form.cantidad) < 0) {
      e.cantidad = "Cantidad inválida";
    }
    if (form.minimo === "" || isNaN(form.minimo) || parseFloat(form.minimo) < 0) {
      e.minimo = "Mínimo inválido";
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardarInsumo = () => {
    if (!validar()) return;
    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      cantidad: parseFloat(form.cantidad),
      minimo: parseFloat(form.minimo),
      unidad: form.unidad,
    };
    if (editandoId !== null) {
      setInsumos(prev => prev.map(i => (i.id === editandoId ? { ...i, ...payload } : i)));
      setEditandoId(null);
    } else {
      setInsumos(prev => [...prev, { id: Date.now(), ...payload }]);
    }
    setForm(emptyForm);
    setMostrarForm(false);
    setErrores({});
  };

  const cancelarForm = () => {
    setForm(emptyForm);
    setEditandoId(null);
    setMostrarForm(false);
    setErrores({});
  };

  const editarInsumo = (insumo) => {
    setForm({
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      cantidad: String(insumo.cantidad),
      minimo: String(insumo.minimo),
      unidad: insumo.unidad,
    });
    setEditandoId(insumo.id);
    setMostrarForm(true);
  };

  const eliminarInsumo = (id) => {
    if (confirm("¿Eliminar este insumo del inventario?")) {
      setInsumos(prev => prev.filter(i => i.id !== id));
    }
  };

  const ajustarInsumo = (id, delta) => {
    setInsumos(prev =>
      prev.map(i =>
        i.id === id ? { ...i, cantidad: Math.max(0, +(i.cantidad + delta).toFixed(2)) } : i
      )
    );
  };

  // ─── STOCK EN PRODUCTOS DEL MENÚ ────────────────────────────
  const toggleControlStock = (id) => {
    setAlimentos(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        const activar = !a.controlarStock;
        return {
          ...a,
          controlarStock: activar,
          stock: typeof a.stock === "number" ? a.stock : 20,
          stockMinimo: typeof a.stockMinimo === "number" ? a.stockMinimo : 5,
        };
      })
    );
  };

  const ajustarStockProducto = (id, delta) => {
    setAlimentos(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, stock: Math.max(0, (a.stock ?? 0) + delta) }
          : a
      )
    );
  };

  const actualizarCampoProducto = (id, campo, valor) => {
    const num = parseInt(valor, 10);
    setAlimentos(prev =>
      prev.map(a =>
        a.id === id ? { ...a, [campo]: isNaN(num) || num < 0 ? 0 : num } : a
      )
    );
  };

  const agregarIngredienteReceta = (productoId) => {
    const insId = Number(nuevoInsumoId);
    const cant = parseFloat(nuevaCantidadReceta);
    if (!insId || isNaN(cant) || cant <= 0) return;

    setAlimentos(prev =>
      prev.map(a => {
        if (a.id !== productoId) return a;
        const actual = a.receta || [];
        const existe = actual.find(r => r.insumoId === insId);
        const receta = existe
          ? actual.map(r => (r.insumoId === insId ? { ...r, cantidad: cant } : r))
          : [...actual, { insumoId: insId, cantidad: cant }];
        return { ...a, receta };
      })
    );
    setNuevoInsumoId("");
    setNuevaCantidadReceta("1");
  };

  const quitarIngredienteReceta = (productoId, insumoId) => {
    setAlimentos(prev =>
      prev.map(a =>
        a.id === productoId
          ? { ...a, receta: (a.receta || []).filter(r => r.insumoId !== insumoId) }
          : a
      )
    );
  };

  // ─── FILTROS Y MÉTRICAS ─────────────────────────────────────
  const insumosFiltrados = insumos.filter(i => {
    const matchBusq = i.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = categoriaFiltro === "Todos" || i.categoria === categoriaFiltro;
    const matchAlerta = !soloAlertas || i.cantidad <= i.minimo;
    return matchBusq && matchCat && matchAlerta;
  });

  const productosFiltrados = alimentos.filter(a => {
    const matchBusq = a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat =
      categoriaFiltro === "Todos" ||
      (categoriaFiltro === "Con control" ? a.controlarStock : a.categoria === categoriaFiltro);
    const matchAlerta = !soloAlertas || (a.controlarStock && (a.stock ?? 0) <= (a.stockMinimo ?? 5));
    return matchBusq && matchCat && matchAlerta;
  });

  const alertasInsumos = insumos.filter(i => i.cantidad <= i.minimo).length;
  const alertasProductos = alimentos.filter(a => a.controlarStock && (a.stock ?? 0) <= (a.stockMinimo ?? 5)).length;

  const cambiarTab = (nuevoTab) => {
    setTab(nuevoTab);
    setCategoriaFiltro("Todos");
    setBusqueda("");
    setSoloAlertas(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ─── SUB-NAVEGACIÓN Y MÉTRICAS ──────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => cambiarTab("insumos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "insumos" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Package size={14} />
            Insumos de Cocina
            {alertasInsumos > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {alertasInsumos}
              </span>
            )}
          </button>
          <button
            onClick={() => cambiarTab("productos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "productos" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Stock del Menú (Auto-descuento)
            {alertasProductos > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {alertasProductos}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <div className="bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 flex items-center gap-2">
            <span className="font-black text-base text-white">
              {tab === "insumos" ? insumos.length : alimentos.filter(a => a.controlarStock).length}
            </span>
            <span className="text-slate-400 text-xs">
              {tab === "insumos" ? "Insumos" : "Con control"}
            </span>
          </div>
          <div className="bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 flex items-center gap-2">
            <span className="font-black text-base text-amber-400">
              {tab === "insumos" ? alertasInsumos : alertasProductos}
            </span>
            <span className="text-slate-400 text-xs">Alertas</span>
          </div>
        </div>
      </div>

      {/* ─── CONTENIDO PRINCIPAL ────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Lista izquierda */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Búsqueda y filtros */}
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm w-48"
              />
            </div>

            <button
              onClick={() => setSoloAlertas(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                soloAlertas
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <AlertTriangle size={13} /> Solo alertas
            </button>

            <div className="flex gap-1.5 flex-wrap flex-1">
              {(tab === "insumos"
                ? ["Todos", ...CATEGORIAS_INSUMO]
                : ["Todos", "Con control", ...CATEGORIAS]
              ).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

          {/* Lista de items */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {tab === "insumos" ? (
              insumosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Sin insumos que coincidan con el filtro
                </div>
              ) : (
                insumosFiltrados.map(insumo => {
                  const badge = estadoBadge(insumo.cantidad, insumo.minimo);
                  return (
                    <div
                      key={insumo.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-white truncate">{insumo.nombre}</p>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          <span className="text-orange-400">{insumo.categoria}</span> · Mínimo: {insumo.minimo} {insumo.unidad}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => ajustarInsumo(insumo.id, -1)}
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                          title="Descontar 1"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-white font-bold text-sm w-20 text-center">
                          {insumo.cantidad} {insumo.unidad}
                        </span>
                        <button
                          onClick={() => ajustarInsumo(insumo.id, 1)}
                          className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white transition-colors"
                          title="Agregar 1"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={() => ajustarInsumo(insumo.id, 5)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                          title="Reponer +5"
                        >
                          +5
                        </button>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => editarInsumo(insumo)}
                          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => eliminarInsumo(insumo.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : productosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                Sin productos que coincidan con el filtro
              </div>
            ) : (
              productosFiltrados.map(producto => {
                const controlado = !!producto.controlarStock;
                const stock = producto.stock ?? 0;
                const minimo = producto.stockMinimo ?? 5;
                const badge = estadoBadge(stock, minimo);

                return (
                  <div
                    key={producto.id}
                    className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                      controlado
                        ? "bg-slate-800 border-slate-700"
                        : "bg-slate-800/50 border-slate-700/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-white truncate">{producto.nombre}</p>
                        {controlado && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-orange-400 mt-0.5">{producto.categoria}</p>
                      {producto.receta && producto.receta.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          Descuenta:{" "}
                          {producto.receta
                            .map(r => {
                              const ins = insumos.find(i => i.id === r.insumoId);
                              return ins ? `${r.cantidad} ${ins.unidad} ${ins.nombre}` : null;
                            })
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    {controlado && (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => ajustarStockProducto(producto.id, -1)}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={e => actualizarCampoProducto(producto.id, "stock", e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-center text-xs font-bold focus:outline-none focus:border-orange-500"
                          />
                          <button
                            onClick={() => ajustarStockProducto(producto.id, 1)}
                            className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>Mín:</span>
                          <input
                            type="number"
                            min="0"
                            value={minimo}
                            onChange={e => actualizarCampoProducto(producto.id, "stockMinimo", e.target.value)}
                            className="w-12 px-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-center text-xs focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setRecetaProductoId(recetaProductoId === producto.id ? null : producto.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 ${
                        recetaProductoId === producto.id
                          ? "bg-orange-500 text-white border-orange-500"
                          : producto.receta?.length
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                          : "bg-slate-700 text-slate-300 border-slate-600 hover:text-white"
                      }`}
                      title="Vincular insumos que descuenta este plato"
                    >
                      <Link2 size={13} />
                      Receta{producto.receta?.length ? ` (${producto.receta.length})` : ""}
                    </button>

                    <button
                      onClick={() => toggleControlStock(producto.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 ${
                        controlado
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-slate-700 text-slate-400 border-slate-600 hover:text-white"
                      }`}
                    >
                      {controlado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {controlado ? "Control activo" : "Sin límite"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel derecho */}
        {tab === "insumos" ? (
          <div className="w-72 shrink-0 flex flex-col gap-4">
            {!mostrarForm ? (
              <button
                onClick={() => setMostrarForm(true)}
                className="w-full py-3 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-400 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Agregar Insumo
              </button>
            ) : (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-3.5">
                <h3 className="font-bold text-white text-sm">
                  {editandoId !== null ? "Editar Insumo" : "Nuevo Insumo"}
                </h3>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Nombre *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Aceite Vegetal"
                    className={`px-3 py-2 rounded-xl bg-slate-900 border text-white placeholder-slate-600 focus:outline-none text-sm ${
                      errores.nombre ? "border-red-500" : "border-slate-700 focus:border-orange-500"
                    }`}
                  />
                  {errores.nombre && <p className="text-red-400 text-xs">{errores.nombre}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500 text-sm"
                  >
                    {CATEGORIAS_INSUMO.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Cantidad *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.cantidad}
                      onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                      placeholder="0"
                      className={`px-3 py-2 rounded-xl bg-slate-900 border text-white focus:outline-none text-sm ${
                        errores.cantidad ? "border-red-500" : "border-slate-700 focus:border-orange-500"
                      }`}
                    />
                    {errores.cantidad && <p className="text-red-400 text-xs">{errores.cantidad}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">Unidad</label>
                    <select
                      value={form.unidad}
                      onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500 text-sm"
                    >
                      {UNIDADES_INSUMO.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium">Stock Mínimo (alerta) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.minimo}
                    onChange={e => setForm(f => ({ ...f, minimo: e.target.value }))}
                    placeholder="5"
                    className={`px-3 py-2 rounded-xl bg-slate-900 border text-white focus:outline-none text-sm ${
                      errores.minimo ? "border-red-500" : "border-slate-700 focus:border-orange-500"
                    }`}
                  />
                  {errores.minimo && <p className="text-red-400 text-xs">{errores.minimo}</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={guardarInsumo}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-400 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> {editandoId !== null ? "Guardar" : "Agregar"}
                  </button>
                  <button
                    onClick={cancelarForm}
                    className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
              <p className="text-xs text-slate-500 font-medium mb-2">CONSEJOS</p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Registra aquí ingredientes clave (carnes, quesos, panes, empaques).</li>
                <li>• Cuando la cantidad baje del mínimo verás una alerta en el menú superior.</li>
                <li>• Usa <strong className="text-slate-400">+5</strong> para reponer compras rápidas.</li>
              </ul>
            </div>
          </div>
        ) : (() => {
          const productoReceta = alimentos.find(a => a.id === recetaProductoId);
          return (
            <div className="w-72 shrink-0 flex flex-col gap-4">
              {productoReceta ? (
                <div className="bg-slate-800 rounded-2xl border border-orange-500/50 p-5 flex flex-col gap-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-orange-400 font-semibold uppercase">Receta / Descuento</p>
                      <h3 className="font-bold text-white text-sm leading-tight">{productoReceta.nombre}</h3>
                    </div>
                    <button
                      onClick={() => setRecetaProductoId(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Insumos que se descuentan automáticamente al vender 1 unidad:
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {(!productoReceta.receta || productoReceta.receta.length === 0) ? (
                      <p className="text-xs text-slate-500 py-2 text-center bg-slate-900/50 rounded-xl">
                        Sin insumos vinculados
                      </p>
                    ) : (
                      productoReceta.receta.map(r => {
                        const ins = insumos.find(i => i.id === r.insumoId);
                        if (!ins) return null;
                        return (
                          <div key={r.insumoId} className="flex items-center justify-between bg-slate-900 rounded-xl px-3 py-2 border border-slate-700">
                            <span className="text-xs text-white truncate">
                              <strong className="text-orange-400">{r.cantidad} {ins.unidad}</strong> · {ins.nombre}
                            </span>
                            <button
                              onClick={() => quitarIngredienteReceta(productoReceta.id, r.insumoId)}
                              className="text-slate-500 hover:text-red-400 shrink-0 ml-2"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-slate-700 pt-3 flex flex-col gap-2">
                    <select
                      value={nuevoInsumoId}
                      onChange={e => setNuevoInsumoId(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Elegir insumo...</option>
                      {insumos.map(ins => (
                        <option key={ins.id} value={ins.id}>
                          {ins.nombre} ({ins.unidad})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.1"
                        value={nuevaCantidadReceta}
                        onChange={e => setNuevaCantidadReceta(e.target.value)}
                        placeholder="Cant."
                        className="w-20 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
                      />
                      <button
                        onClick={() => agregarIngredienteReceta(productoReceta.id)}
                        disabled={!nuevoInsumoId}
                        className="flex-1 py-2 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> Vincular
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                  <p className="text-xs text-slate-400 font-semibold mb-2">AUTO-DESCUENTO EN PEDIDOS</p>
                  <ul className="text-xs text-slate-400 space-y-2">
                    <li>• Usa <strong className="text-blue-400">Receta</strong> para vincular un plato con sus insumos (ej. 1 Hamburguesa de Carne descuenta 1 Carne de Hamburguesa y 1 Pan).</li>
                    <li>• Activa <strong className="text-emerald-400">Control activo</strong> para contar unidades directas (bebidas, queso, harina).</li>
                    <li>• Si un insumo o producto llega a <strong className="text-red-400">0</strong>, aparecerá como Agotado en Pedidos.</li>
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
