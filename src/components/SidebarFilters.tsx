import React from "react";
import { FilterState } from "../types";
import { Search, RotateCcw, SlidersHorizontal, CheckSquare, Square } from "lucide-react";

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  manufacturers: string[];
  algorithms: string[];
  totalCount: number;
  filteredCount: number;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onChange,
  manufacturers,
  algorithms,
  totalCount,
  filteredCount,
}) => {
  const handleReset = () => {
    onChange({
      search: "",
      manufacturer: "",
      condition: "",
      algorithm: "",
      hasPrice: false,
    });
  };

  return (
    <div id="sidebar-filters-container" className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-white font-bold">
          <SlidersHorizontal className="h-4 w-4 text-[#D3A76C]" />
          <span>Фильтры</span>
        </div>
        {(filters.search || filters.manufacturer || filters.algorithm || filters.hasPrice) && (
          <button 
            id="btn-reset-filters"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono block mb-2">
          Поиск по модели
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            id="input-search"
            type="text"
            placeholder="Например, S21, S19, XP..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#D3A76C] focus:outline-none focus:ring-1 focus:ring-[#D3A76C]"
          />
        </div>
      </div>

      {/* Manufacturer Select */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono block mb-2">
          Производитель
        </label>
        <select
          id="select-manufacturer"
          value={filters.manufacturer}
          onChange={(e) => onChange({ ...filters, manufacturer: e.target.value })}
          className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-[#D3A76C] focus:outline-none"
        >
          <option value="">Все производители</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Algorithm Select */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono block mb-2">
          Алгоритм хэширования
        </label>
        <select
          id="select-algorithm"
          value={filters.algorithm}
          onChange={(e) => onChange({ ...filters, algorithm: e.target.value })}
          className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-[#D3A76C] focus:outline-none"
        >
          <option value="">Все алгоритмы</option>
          {algorithms.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Price Availability Filter */}
      <div className="pt-2">
        <button
          id="btn-toggle-has-price"
          type="button"
          onClick={() => onChange({ ...filters, hasPrice: !filters.hasPrice })}
          className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer select-none"
        >
          {filters.hasPrice ? (
            <CheckSquare className="h-4 w-4 text-[#D3A76C]" />
          ) : (
            <Square className="h-4 w-4 text-zinc-650" />
          )}
          <span>Только товары с ценами</span>
        </button>
      </div>

      {/* Stats Counter */}
      <div className="pt-4 border-t border-zinc-900 text-xs text-zinc-400 flex justify-between font-mono">
        <span>Показано моделей:</span>
        <span className="font-bold text-white">
          {filteredCount} из {totalCount}
        </span>
      </div>
    </div>
  );
};
