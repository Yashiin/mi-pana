import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { CATEGORIAS } from "../data/store";

const emptyForm = { nombre: "", precio: "", categoria: CATEGORIAS[0] };

export default function Alimentos({ alimentos, setAlimentos }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa un nombre";
    if (!form.precio || isNaN(form.precio) || parseFloat(form.precio) <= 0) e.precio = "Precio inválido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = () => {
    if (!validar()) return;
    if (editandoId !== null) {
      setAlimentos(prev => prev.map(a => a.id === editandoId
        ? { ...a, nombre: form.nombre.trim(), precio: parseFloat(form.precio), categoria: form.categoria }
        : a
      ));
      setEditandoId(null);
    } else {
      const nuevo = {
        id: Date.now(),
        nombre: form.nombre.trim(),
        precio: parseFloat(form.precio),
        categoria: form.categoria,
        disponible: true,
      };
      setAlimentos(prev => [...prev, nuevo]);
    }
    setForm(emptyForm);
    setMostrarForm(false);
    setErrores({});
  };

  const cancelar = () => {
    setForm(emptyForm);
    setEditandoId(null);
    setMostrarForm(false);
    setErrores({});
  };

  const editar = (alimento) => {
    setForm({ nombre: alimento.nombre, precio: String(alimento.precio), categoria: alimento.categoria });
    setEditandoId(alimento.id);
    setMostrarForm(true);
  };

  const eliminar = (id) => {
    if (confirm("¿Eliminar este alimento?")) {
      setAlimentos(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleDisponible = (id) => {
    setAlimentos(prev => prev.map(a => a.id === id ? { ...a, disponible: !a.disponible } : a));
  };

  const categorias = ["Todos", ...CATEGORIAS];
  const alimentosFiltrados = alimentos.filter(a => {
    const matchBusqueda = a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === "Todos" || a.categoria === categoriaFiltro;
    return matchBusqueda && matchCategoria;
  });

  return (
    <div className="flex gap-4 h-full">

      {/* ─── LISTA DE ALIMENTOS ─────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Filtros y búsqueda */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm w-52"
            />
          </div>
          <div className="flex gap-2 flex-wrap flex-1">
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

        {/* Stats rápidas */}
        <div className="flex gap-3">
          {[
            { label: "Total", val: alimentos.length, color: "text-white" },
            { label: "Disponibles", val: alimentos.filter(a => a.disponible).length, color: "text-emerald-400" },
            { label: "Inactivos", val: alimentos.filter(a => !a.disponible).length, color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-700 flex items-center gap-2">
              <span className={`font-black text-lg ${s.color}`}>{s.val}</span>
              <span className="text-slate-400 text-xs">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {alimentosFiltrados.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>Sin resultados para la búsqueda</p>
              </div>
            )}
            {alimentosFiltrados.map(alimento => (
              <div
                key={alimento.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  alimento.disponible
                    ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                    : "bg-slate-800/50 border-slate-700/50 opacity-60"
                }`}
              >
                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm ${alimento.disponible ? "text-white" : "text-slate-500"}`}>
                      {alimento.nombre}
                    </p>
                    <p className="text-xs text-orange-400 mt-0.5">{alimento.categoria}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-white font-bold text-sm w-24 text-right">R$ {alimento.precio.toFixed(2)}</span>

                  <button
                    onClick={() => toggleDisponible(alimento.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      alimento.disponible
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600"
                    }`}
                  >
                    {alimento.disponible ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {alimento.disponible ? "Activo" : "Inactivo"}
                  </button>

                  <div className="flex gap-1">
                    <button
                      onClick={() => editar(alimento)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => eliminar(alimento.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PANEL FORMULARIO ────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-4">
        {!mostrarForm ? (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full py-3 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-400 text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Agregar Alimento
          </button>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm">
              {editandoId !== null ? "✏️ Editar Alimento" : "➕ Nuevo Alimento"}
            </h3>

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: Hamburguesa Clásica"
                className={`px-3 py-2 rounded-xl bg-slate-900 border text-white placeholder-slate-600 focus:outline-none text-sm ${
                  errores.nombre ? "border-red-500 focus:border-red-400" : "border-slate-700 focus:border-orange-500"
                }`}
              />
              {errores.nombre && <p className="text-red-400 text-xs">{errores.nombre}</p>}
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Precio (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                placeholder="0.00"
                className={`px-3 py-2 rounded-xl bg-slate-900 border text-white placeholder-slate-600 focus:outline-none text-sm ${
                  errores.precio ? "border-red-500 focus:border-red-400" : "border-slate-700 focus:border-orange-500"
                }`}
              />
              {errores.precio && <p className="text-red-400 text-xs">{errores.precio}</p>}
            </div>

            {/* Categoría */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Categoría *</label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500 text-sm"
              >
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={guardar}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-400 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} /> {editandoId !== null ? "Guardar" : "Agregar"}
              </button>
              <button
                onClick={cancelar}
                className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Info de ayuda */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs text-slate-500 font-medium mb-2">CONSEJOS</p>
          <ul className="text-xs text-slate-500 space-y-1.5">
            <li>• Usa <strong className="text-slate-400">Activo/Inactivo</strong> para ocultar items del menú sin eliminarlos</li>
            <li>• Los items inactivos <strong className="text-slate-400">no aparecen</strong> en la pantalla de pedidos</li>
            <li>• Los precios aparecen en reales (R$)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
