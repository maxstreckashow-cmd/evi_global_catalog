import React from "react";
import { Product } from "../types";
import { X, Cpu, Zap, Scale, Layers, Trash2, Coins, Calendar } from "lucide-react";
import { MinerImage } from "./MinerImage";

interface CompareModalProps {
  selectedProducts: Product[];
  onClose: () => void;
  onRemove: (slug: string) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  selectedProducts,
  onClose,
  onRemove,
  onClearAll,
}) => {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-850 bg-zinc-950 p-6 md:p-8 shadow-2xl shadow-[#D3A76C]/5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#D3A76C]" />
              <span>Сравнение ASIC-майнеров</span>
            </h2>
            <p className="text-xs text-zinc-450 mt-1">
              Сравнительный анализ технических характеристик и окупаемости выбранного оборудования ({selectedProducts.length})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Очистить все</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-850 text-zinc-400 hover:text-white p-2 transition-all cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Table Container (Scrollable) */}
        <div className="flex-1 overflow-auto rounded-xl border border-zinc-900 bg-zinc-950/40">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/80">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono w-[200px]">
                  Характеристика
                </th>
                {selectedProducts.map((p) => (
                  <th key={p.slug} className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono relative group">
                    <div className="flex flex-col space-y-2">
                      <div className="h-20 w-full relative">
                        <MinerImage
                          manufacturer={p.manufacturer}
                          model={p.model}
                          imageUrl={p.imageUrl}
                          className="h-full w-full"
                        />
                        <button
                          onClick={() => onRemove(p.slug)}
                          className="absolute top-0 right-0 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white p-1 transition-all shadow-md cursor-pointer"
                          title="Удалить из сравнения"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="pt-2 text-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                          {p.manufacturer}
                        </span>
                        <span className="text-xs font-black text-white uppercase block leading-tight mt-0.5 truncate max-w-[180px] mx-auto">
                          {p.model}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Algorithm */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[#D3A76C]/60" />
                  <span>Алгоритм</span>
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-xs font-bold text-zinc-200">
                    {p.algorithm || "—"}
                  </td>
                ))}
              </tr>

              {/* Row: Hashrate */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-[#D3A76C]/60" />
                  <span>Хэшрейт</span>
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-xs font-black text-white font-mono">
                    {p.hashrate ? `${p.hashrate} TH` : "—"}
                  </td>
                ))}
              </tr>

              {/* Row: Power */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#D3A76C]/60" />
                  <span>Мощность</span>
                </td>
                {selectedProducts.map((p) => {
                  return (
                    <td key={p.slug} className="p-4 text-xs font-bold text-zinc-200">
                      {p.power ? `${p.power} кВт` : "—"}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Energy Efficiency */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Scale className="h-3.5 w-3.5 text-[#D3A76C]/60" />
                  <span>Энергоэфф.</span>
                </td>
                {selectedProducts.map((p) => {
                  const hashrateNum = parseFloat(p.hashrate.replace(/,/g, "."));
                  const powerNum = parseFloat(p.power.replace(/,/g, ".")) * 1000;
                  const efficiency = isNaN(hashrateNum) || isNaN(powerNum) || hashrateNum === 0 
                    ? null 
                    : Math.round(powerNum / hashrateNum);
                  return (
                    <td key={p.slug} className="p-4 text-xs font-bold text-zinc-200 font-mono">
                      {efficiency ? `${efficiency} J/T` : "—"}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Price RUB */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 text-emerald-500/75" />
                  <span>Цена в ₽</span>
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-sm font-black text-white">
                    {p.priceRubNumeric > 0 ? (
                      <span className="text-emerald-400">{p.priceRub}</span>
                    ) : (
                      <span className="text-zinc-650 text-xs italic">По запросу</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Price USD */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Цена в $</span>
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-xs font-bold text-zinc-400">
                    {p.priceUsdNumeric > 0 ? p.priceUsd : <span className="text-zinc-650 italic">По запросу</span>}
                  </td>
                ))}
              </tr>

              {/* Row: Payback time */}
              <tr className="border-b border-zinc-900/50 hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#D3A76C]/60" />
                  <span>Окупаемость</span>
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-xs font-bold text-zinc-300">
                    {p.payback ? `~${p.payback} мес.` : "—"}
                  </td>
                ))}
              </tr>

              {/* Row: Condition */}
              <tr className="hover:bg-zinc-900/10 transition-colors">
                <td className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Состояние
                </td>
                {selectedProducts.map((p) => (
                  <td key={p.slug} className="p-4 text-xs">
                    <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      p.condition.toLowerCase() === "new" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-[#D3A76C]/10 text-[#D3A76C] border border-[#D3A76C]/20"
                    }`}>
                      {p.condition === "New" ? "Новый" : "Б/У"}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
          <p>
            * Энергоэффективность рассчитывается автоматически при наличии данных о потреблении и хэшрейте.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded bg-[#D3A76C] hover:bg-[#E7C08B] hover:text-[#0F0D09] px-6 py-2.5 text-center text-xs font-bold text-[#0F0D09] transition-all cursor-pointer uppercase tracking-wider"
          >
            Закрыть таблицу
          </button>
        </div>
      </div>
    </div>
  );
};
