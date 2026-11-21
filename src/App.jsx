import { useState, useEffect } from "react";
import { ShoppingBag, CreditCard, BarChart3, UtensilsCrossed, Trash2 } from "lucide-react";
import { initialAlimentos } from "./data/store";
import Pedidos from "./pages/Pedidos";
import Caja from "./pages/Caja";
import Reportes from "./pages/Reportes";
import Alimentos from "./pages/Alimentos";

const NAV = [
  { id: "pedidos",   label: "Pedidos",   icon: ShoppingBag     },
  { id: "caja",      label: "Caja",      icon: CreditCard      },
  { id: "reportes",  label: "Reportes",  icon: BarChart3       },
  { id: "alimentos", label: "Alimentos", icon: UtensilsCrossed },
];

// ─── Helpers localStorage ──────────────────────────────────────
function cargar(clave, valorDefault) {
  try {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : valorDefault;
  } catch {
    return valorDefault;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    console.warn("No se pudo guardar en localStorage");
  }
}

export default function App() {
  const [pagina, setPagina] = useState("pedidos");
  const [pedidos, setPedidos] = useState(() => cargar("pos_pedidos", []));
  const [alimentos, setAlimentos] = useState(() => cargar("pos_alimentos", initialAlimentos));
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);

  // Guardar automáticamente cuando cambian los datos
  useEffect(() => { guardar("pos_pedidos", pedidos); }, [pedidos]);
  useEffect(() => { guardar("pos_alimentos", alimentos); }, [alimentos]);

  const limpiarDatos = () => {
    localStorage.removeItem("pos_pedidos");
    localStorage.removeItem("pos_alimentos");
    setPedidos([]);
    setAlimentos(initialAlimentos);
    setConfirmLimpiar(false);
  };

  const pedidosPendientesPago = pedidos.filter(p => !p.pagado && p.estado === "entregado").length;
  const pedidosEnCocina = pedidos.filter(p => !p.pagado && p.estado !== "entregado").length;

  const PAGES = {
    pedidos:   <Pedidos   alimentos={alimentos} pedidos={pedidos} setPedidos={setPedidos} />,
    caja:      <Caja      pedidos={pedidos} setPedidos={setPedidos} />,
    reportes:  <Reportes  pedidos={pedidos} />,
    alimentos: <Alimentos alimentos={alimentos} setAlimentos={setAlimentos} />,
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Mi pana</h1>
            <p className="text-slate-500 text-xs">Sistema de Ventas</p>
          </div>
        </div>

        <nav className="flex gap-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const badge = id === "caja" ? pedidosPendientesPago : id === "pedidos" ? pedidosEnCocina : 0;
            return (
              <button
                key={id}
                onClick={() => setPagina(id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pagina === id
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white text-sm font-semibold">
              {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })}
            </p>
            <p className="text-slate-500 text-xs">
              {new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Botón limpiar datos */}
          {!confirmLimpiar ? (
            <button
              onClick={() => setConfirmLimpiar(true)}
              title="Limpiar todos los datos"
              className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-1.5">
              <span className="text-red-400 text-xs font-medium">¿Borrar todo?</span>
              <button onClick={limpiarDatos} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-lg font-bold hover:bg-red-400 transition-colors">Sí</button>
              <button onClick={() => setConfirmLimpiar(false)} className="text-xs text-slate-400 hover:text-white transition-colors">No</button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-5 overflow-hidden min-h-0">
        {PAGES[pagina]}
      </main>
    </div>
  );
}
