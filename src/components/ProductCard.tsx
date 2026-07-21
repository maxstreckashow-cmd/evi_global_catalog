import React from "react";
import { Product } from "../types";
import { Cpu, Zap, Scale, Layers, HelpCircle, Calendar, Weight } from "lucide-react";
import { MinerImage } from "./MinerImage";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product, e: React.MouseEvent) => void;
}

function formatPayback(payback: string): string {
  if (!payback) return "—";
  const num = parseInt(payback, 10);
  if (isNaN(num)) return payback;
  
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${num} месяцев`;
  }
  if (lastDigit === 1) {
    return `${num} месяц`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${num} месяца`;
  }
  return `${num} месяцев`;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  isCompared = false, 
  onToggleCompare 
}) => {
  const isAvailable = product.priceRubNumeric > 0;
  
  // Compute efficiency in J/Th if possible
  const hashrateNum = parseFloat(product.hashrate.replace(/,/g, "."));
  const powerNum = parseFloat(product.power.replace(/,/g, ".")) * 1000; // convert kW to W if power is in kW (e.g. 3.5 or 3,5)
  const efficiency = product.efficiency || (isNaN(hashrateNum) || isNaN(powerNum) || hashrateNum === 0 
    ? null 
    : Math.round(powerNum / hashrateNum));

  return (
    <div 
      id={`card-${product.slug}`}
      onClick={() => onSelect(product)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D3A76C]/5 cursor-pointer ${
        isCompared 
          ? "border-[#D3A76C] bg-zinc-900/80 ring-1 ring-[#D3A76C]/30" 
          : "border-zinc-800/80 bg-zinc-950/40 hover:border-[#D3A76C]/50 hover:bg-zinc-900/60"
      }`}
    >
      {/* Background Glow */}
      <div className="absolute -right-16 -top-16 -z-10 h-32 w-32 rounded-full bg-[#D3A76C]/5 blur-3xl transition-all duration-300 group-hover:bg-[#D3A76C]/10"></div>

      <div>
        {/* Top Badges */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="rounded bg-[#D3A76C]/10 border border-[#D3A76C]/30 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-[#D3A76C] font-mono truncate">
            {product.manufacturer.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product, e);
                }}
                className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  isCompared
                    ? "bg-[#D3A76C]/20 text-[#D3A76C] border-[#D3A76C]/40"
                    : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={isCompared}
                  readOnly
                  className="rounded border-zinc-700 text-[#D3A76C] focus:ring-0 focus:ring-offset-0 h-3 w-3 cursor-pointer accent-[#D3A76C]" 
                />
                <span>Сравнить</span>
              </button>
            )}
            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
              product.condition.toLowerCase() === "new" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-[#D3A76C]/10 text-[#D3A76C] border border-[#D3A76C]/20"
            }`}>
              {product.condition === "New" ? "Новый" : "Б/У"}
            </span>
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 bg-amber-500/15 text-amber-400 border border-amber-500/25">
              от 30 шт.
            </span>
          </div>
        </div>

        {/* Real Official Manufacturer ASIC Image */}
        <MinerImage 
          manufacturer={product.manufacturer} 
          model={product.model} 
          imageUrl={product.imageUrl}
          className="mb-4 h-32 w-full" 
        />

        {/* Model Title */}
        <div className="text-[10px] font-mono font-bold tracking-widest text-[#D3A76C] uppercase mb-1">
          {product.manufacturer}
        </div>
        <h3 className="line-clamp-2 text-base font-extrabold tracking-tight text-white group-hover:text-[#D3A76C] transition-colors duration-300 uppercase">
          {product.model}
        </h3>
        <p className="mt-1 text-[10px] font-mono text-zinc-600">
          ID: {product.slug}
        </p>

        {/* Tech Specs Summary */}
        <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-2 border-t border-b border-zinc-900 py-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-[#D3A76C]/70" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Хэшрейт</p>
              <p className="font-bold text-zinc-200">{product.hashrate ? `${product.hashrate} TH` : "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-[#D3A76C]/70" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Мощность</p>
              <p className="font-bold text-zinc-200">{product.power ? `${product.power} кВт` : "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Layers className="h-3.5 w-3.5 text-zinc-500" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Алгоритм</p>
              <p className="font-bold text-zinc-200 truncate max-w-[90px]">{product.algorithm || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Scale className="h-3.5 w-3.5 text-zinc-500" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Энергоэфф.</p>
              <p className="font-bold text-zinc-200">{efficiency ? `${efficiency} J/T` : "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="h-3.5 w-3.5 text-[#D3A76C]/70" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Окупаемость</p>
              <p className="font-bold text-[#D3A76C]">{product.payback ? formatPayback(product.payback) : "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Weight className="h-3.5 w-3.5 text-zinc-500" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Вес</p>
              <p className="font-bold text-zinc-200">{product.weight ? `${product.weight} кг` : "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing and Button */}
      <div className="mt-5 pt-3">
        <div className="mb-4 flex flex-col justify-end">
          {isAvailable ? (
            <>
              <p className="text-xl font-black text-white tracking-tight">
                {product.priceRub}
              </p>
              <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                {product.priceUsd}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-1.5 py-1.5 text-zinc-500">
              <HelpCircle className="h-4 w-4 text-zinc-600" />
              <span className="font-bold text-xs uppercase tracking-wider">Цена по запросу</span>
            </div>
          )}
        </div>

        <button 
          id={`btn-details-${product.slug}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="w-full rounded bg-zinc-900 border border-zinc-800 hover:border-[#D3A76C] hover:bg-[#D3A76C] hover:text-[#0F0D09] px-4 py-2.5 text-center text-xs font-bold text-zinc-300 transition-all duration-300 cursor-pointer uppercase tracking-wider"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
};
