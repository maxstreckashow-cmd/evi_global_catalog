import React, { useState, useEffect } from "react";
import { Product } from "../types";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sliders,
  Settings,
  Cpu,
  Coins,
  Scale,
  Zap,
  RotateCcw
} from "lucide-react";

interface ProductPriceManagerProps {
  products: Product[];
  onRefreshProducts: () => void;
}

interface OverridesState {
  priceUsd: string;
  priceRub: string;
  hashrate: string;
  power: string;
  weight: string;
  efficiency: string;
  payback: string;
}

export const ProductPriceManager: React.FC<ProductPriceManagerProps> = ({
  products,
  onRefreshProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, any>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form States for Custom Product Creation
  const [addForm, setAddForm] = useState({
    manufacturer: "Antminer",
    model: "",
    hashrate: "",
    power: "",
    weight: "",
    algorithm: "SHA-256",
    condition: "New",
    priceUsd: "",
    priceRub: "",
    payback: "",
    efficiency: "",
  });

  // Form States for Editing
  const [editForm, setEditForm] = useState<OverridesState>({
    priceUsd: "",
    priceRub: "",
    hashrate: "",
    power: "",
    weight: "",
    efficiency: "",
    payback: "",
  });

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/price-corrections");
      if (res.ok) {
        const data = await res.json();
        setCorrections(data);
      }
    } catch (e) {
      console.error("Error fetching corrections:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.manufacturer.toLowerCase().includes(term) ||
      p.model.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term) ||
      (p.algorithm && p.algorithm.toLowerCase().includes(term))
    );
  });

  // Handle saving completely new custom product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.manufacturer.trim() || !addForm.model.trim()) {
      setStatusMsg({ type: "error", text: "Укажите производителя и модель!" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/custom-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: "success", text: `Товар ${addForm.manufacturer} ${addForm.model} успешно добавлен!` });
        setIsAddModalOpen(false);
        // Reset form
        setAddForm({
          manufacturer: "Antminer",
          model: "",
          hashrate: "",
          power: "",
          weight: "",
          algorithm: "SHA-256",
          condition: "New",
          priceUsd: "",
          priceRub: "",
          payback: "",
          efficiency: "",
        });
        onRefreshProducts();
      } else {
        throw new Error(data.error || "Failed to add custom product");
      }
    } catch (e: any) {
      console.error(e);
      setStatusMsg({ type: "error", text: e.message || "Не удалось добавить товар вручную." });
    } finally {
      setLoading(false);
    }
  };

  // Open Edit modal and load values
  const handleOpenEditModal = (p: Product) => {
    setSelectedProduct(p);
    
    // For sheet products, check if we have manual overrides in corrections
    const corr = corrections[p.slug] || {};
    
    setEditForm({
      priceUsd: p.isCustom ? p.priceUsd : (corr.priceUsd || ""),
      priceRub: p.isCustom ? p.priceRub : (corr.priceRub || ""),
      hashrate: p.isCustom ? p.hashrate : (corr.hashrate || ""),
      power: p.isCustom ? p.power : (corr.power || ""),
      weight: p.isCustom ? p.weight : (corr.weight || ""),
      efficiency: p.isCustom ? (p.efficiency || "") : (corr.efficiency || ""),
      payback: p.isCustom ? p.payback : (corr.payback || ""),
    });
    
    setIsEditModalOpen(true);
  };

  // Submit edits
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    try {
      if (selectedProduct.isCustom) {
        // Direct save to custom products API
        const updatedPayload = {
          ...selectedProduct,
          priceUsd: editForm.priceUsd.trim(),
          priceRub: editForm.priceRub.trim(),
          hashrate: editForm.hashrate.trim(),
          power: editForm.power.trim(),
          weight: editForm.weight.trim(),
          efficiency: editForm.efficiency.trim(),
          payback: editForm.payback.trim(),
        };

        const res = await fetch("/api/custom-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPayload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg({ type: "success", text: "Параметры вручную добавленного товара сохранены!" });
          setIsEditModalOpen(false);
          onRefreshProducts();
        } else {
          throw new Error("Failed to edit custom product");
        }
      } else {
        // Save to price corrections overrides API for Google Sheet products
        const res = await fetch(`/api/price-corrections/${selectedProduct.slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceUsd: editForm.priceUsd.trim() || undefined,
            priceRub: editForm.priceRub.trim() || undefined,
            hashrate: editForm.hashrate.trim() || undefined,
            power: editForm.power.trim() || undefined,
            weight: editForm.weight.trim() || undefined,
            efficiency: editForm.efficiency.trim() || undefined,
            payback: editForm.payback.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMsg({ type: "success", text: "Ручные корректировки сохранены и применены!" });
          await fetchCorrections();
          setIsEditModalOpen(false);
          onRefreshProducts();
        } else {
          throw new Error("Failed to save corrections");
        }
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось сохранить изменения параметров." });
    } finally {
      setLoading(false);
    }
  };

  // Delete custom product
  const handleDeleteCustomProduct = async (slug: string) => {
    if (!confirm("Вы уверены, что хотите безвозвратно удалить этот вручную добавленный товар?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/custom-products/${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Вручную добавленный товар удален!" });
        onRefreshProducts();
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось удалить товар." });
    } finally {
      setLoading(false);
    }
  };

  // Reset all overrides for a Google sheet product
  const handleResetOverrides = async (slug: string) => {
    if (!confirm("Сбросить все ручные корректировки для этого товара? Будут возвращены оригинальные значения из Google Таблицы и алгоритмов.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/price-corrections/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceUsd: undefined,
          priceRub: undefined,
          hashrate: undefined,
          power: undefined,
          weight: undefined,
          efficiency: undefined,
          payback: undefined,
        }),
      });
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Ручные корректировки сброшены!" });
        await fetchCorrections();
        onRefreshProducts();
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось сбросить ручные параметры." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-sans">
            <Sliders className="h-5 w-5 text-[#D3A76C]" />
            Редактор каталога товаров
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Добавляйте новые товары самостоятельно и вручную корректируйте цены, энергоэффективность, вес, хэшрейт, мощность и окупаемость для любых моделей.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {/* Add custom product button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded bg-[#D3A76C] hover:bg-[#E7C08B] text-[#0F0D09] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Добавить товар вручную
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`flex items-center justify-between gap-2 rounded border px-4 py-3 text-xs font-semibold transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Поиск по производителю, модели или алгоритму..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded border border-zinc-800 bg-zinc-950/40 py-2 pl-9 pr-4 text-xs font-semibold text-zinc-300 outline-none transition-colors focus:border-[#D3A76C] focus:bg-zinc-900/40"
        />
      </div>

      {/* Loading state or Empty results */}
      {loading && Object.keys(corrections).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-[#D3A76C] animate-spin" />
          <p className="mt-2 text-xs font-mono text-zinc-500">Загрузка параметров каталога...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded border border-dashed border-zinc-850 py-12 text-center text-zinc-500">
          Товары не найдены
        </div>
      ) : (
        /* Products spec list table */
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="p-4">Модель и бренд</th>
                <th className="p-4">Цены</th>
                <th className="p-4">Мощность и Хэшрейт</th>
                <th className="p-4">Энергоэффективность и Вес</th>
                <th className="p-4">Окупаемость</th>
                <th className="p-4">Статус/Источник</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredProducts.map((p) => {
                const hasCorrection = !!corrections[p.slug];
                const isOverridden = hasCorrection || p.isCustom;
                
                return (
                  <tr
                    key={p.slug}
                    className={`transition-colors hover:bg-zinc-900/10 ${
                      p.isCustom ? "bg-emerald-500/5" : hasCorrection ? "bg-[#D3A76C]/5" : ""
                    }`}
                  >
                    {/* Model Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="font-bold text-white uppercase text-sm">
                          {p.manufacturer} {p.model}
                        </div>
                        {p.isCustom && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                            Вручную
                          </span>
                        )}
                        {hasCorrection && (
                          <span className="text-[9px] bg-[#D3A76C]/15 text-[#D3A76C] border border-[#D3A76C]/30 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                            Изменен
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] text-zinc-500">{p.slug}</span>
                        <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider">
                          {p.algorithm || "SHA-256"}
                        </span>
                      </div>
                    </td>

                    {/* Price Spec */}
                    <td className="p-4">
                      <div className="font-semibold text-zinc-200">
                        {p.priceRub ? p.priceRub : <span className="text-zinc-600">—</span>}
                      </div>
                      <div className="text-zinc-500 text-[10px] mt-0.5">
                        {p.priceUsd ? p.priceUsd : "—"}
                      </div>
                    </td>

                    {/* Hashrate and Power Spec */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-mono text-zinc-200 font-bold">
                        <Cpu className="h-3.5 w-3.5 text-zinc-500" />
                        {p.hashrate || "—"}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5 font-mono">
                        <Zap className="h-3 w-3 text-amber-500/60" />
                        Потр: {p.power || "—"}
                      </div>
                    </td>

                    {/* Efficiency and Weight Spec */}
                    <td className="p-4">
                      <div className="text-zinc-300 font-mono">
                        {p.efficiency ? `${p.efficiency}` : "—"}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5 font-mono">
                        <Scale className="h-3 w-3" />
                        Вес: {p.weight || "—"}
                      </div>
                    </td>

                    {/* Payback period */}
                    <td className="p-4 font-mono font-bold text-zinc-200">
                      {p.payback ? (
                        <span className="text-emerald-400">{p.payback} мес.</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Source / Status info */}
                    <td className="p-4">
                      <div className="text-[10px] font-semibold text-zinc-400">
                        {p.isCustom ? (
                          <span className="text-emerald-400">Локальная БД</span>
                        ) : isOverridden ? (
                          <span className="text-amber-400 font-mono">Вручную переопределен</span>
                        ) : (
                          <span className="text-zinc-500 font-mono">Синхронизировано (Таблица)</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Reset button for sheet products with overrides */}
                        {!p.isCustom && hasCorrection && (
                          <button
                            onClick={() => handleResetOverrides(p.slug)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title="Сбросить ручные параметры"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Delete button for custom added products */}
                        {p.isCustom && (
                          <button
                            onClick={() => handleDeleteCustomProduct(p.slug)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-950 bg-red-950/15 hover:bg-red-950/35 text-red-400 transition-all cursor-pointer"
                            title="Удалить товар"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="inline-flex h-8 items-center gap-1.5 rounded border border-[#D3A76C]/30 bg-[#D3A76C]/10 text-[#D3A76C] hover:bg-[#D3A76C]/20 px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Параметры</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================= */}
      {/* 1. MODAL: ADD CUSTOM PRODUCT                            */}
      {/* ======================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#D3A76C]" />
                Добавить товар вручную
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand / Manufacturer */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Производитель *
                  </label>
                  <select
                    value={addForm.manufacturer}
                    onChange={(e) => setAddForm({ ...addForm, manufacturer: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  >
                    <option value="Antminer">Antminer (Bitmain)</option>
                    <option value="Whatsminer">Whatsminer (MicroBT)</option>
                    <option value="Avalon">Avalon (Canaan)</option>
                    <option value="IceRiver">IceRiver</option>
                    <option value="ElphaPex">ElphaPex</option>
                    <option value="Goldshell">Goldshell</option>
                    <option value="Jasminer">Jasminer</option>
                    <option value="Innosilicon">Innosilicon</option>
                    <option value="Custom">Другой бренд</option>
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Модель *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: S21 XP Hydro"
                    value={addForm.model}
                    onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Hashrate */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Хэшрейт (Мощность хэширования)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 270 Th или 15000 Mh"
                    value={addForm.hashrate}
                    onChange={(e) => setAddForm({ ...addForm, hashrate: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Power */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Потребляемая мощность (кВт / Вт)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 3.5 kW или 3240 W"
                    value={addForm.power}
                    onChange={(e) => setAddForm({ ...addForm, power: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Вес (кг)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 14.5 kg"
                    value={addForm.weight}
                    onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Efficiency */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Энергоэффективность
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 12 J/T"
                    value={addForm.efficiency}
                    onChange={(e) => setAddForm({ ...addForm, efficiency: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Price USD */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Цена в USD ($)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: $3,250"
                    value={addForm.priceUsd}
                    onChange={(e) => setAddForm({ ...addForm, priceUsd: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Price RUB */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Цена в RUB (₽)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 325,000 ₽"
                    value={addForm.priceRub}
                    onChange={(e) => setAddForm({ ...addForm, priceRub: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Payback period */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Окупаемость (месяцев)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: 12"
                    value={addForm.payback}
                    onChange={(e) => setAddForm({ ...addForm, payback: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Algorithm */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Алгоритм
                  </label>
                  <input
                    type="text"
                    placeholder="Например: SHA-256"
                    value={addForm.algorithm}
                    onChange={(e) => setAddForm({ ...addForm, algorithm: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded border border-zinc-800 hover:bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-[#D3A76C] hover:bg-[#E7C08B] text-[#0F0D09] px-5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? "Добавление..." : "Создать товар"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. MODAL: EDIT SPECIFICATIONS / OVERRIDES               */}
      {/* ======================================================= */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-[#D3A76C]" />
                  Редактировать параметры
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {selectedProduct.manufacturer} {selectedProduct.model} ({selectedProduct.slug})
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="bg-[#D3A76C]/5 border border-[#D3A76C]/10 rounded-lg p-3 text-xs text-zinc-300">
                {!selectedProduct.isCustom ? (
                  <span>
                    Корректировка заменяет исходные значения из Google Таблицы. Если оставить поле пустым, будет использовано исходное системное значение.
                  </span>
                ) : (
                  <span>Вы изменяете параметры вручную созданного товара.</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price USD */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Цена в USD ($)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.priceUsd || "Например: $3,500"}
                    value={editForm.priceUsd}
                    onChange={(e) => setEditForm({ ...editForm, priceUsd: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Price RUB */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Цена в RUB (₽)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.priceRub || "Например: 350,000 ₽"}
                    value={editForm.priceRub}
                    onChange={(e) => setEditForm({ ...editForm, priceRub: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Hashrate */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Хэшрейт (Hashrate)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.hashrate || "Например: 240 Th"}
                    value={editForm.hashrate}
                    onChange={(e) => setEditForm({ ...editForm, hashrate: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Power */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Потребляемая мощность (Power)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.power || "Например: 3.4 kW"}
                    value={editForm.power}
                    onChange={(e) => setEditForm({ ...editForm, power: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Вес устройства (Weight)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.weight || "Например: 16 kg"}
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Efficiency */}
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Энергоэффективность (Efficiency)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.efficiency || "Например: 15 J/T"}
                    value={editForm.efficiency}
                    onChange={(e) => setEditForm({ ...editForm, efficiency: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>

                {/* Payback period */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 mb-1.5">
                    Срок окупаемости (Payback period в месяцах)
                  </label>
                  <input
                    type="text"
                    placeholder={selectedProduct.payback || "Например: 10"}
                    value={editForm.payback}
                    onChange={(e) => setEditForm({ ...editForm, payback: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#D3A76C]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded border border-zinc-800 hover:bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-[#D3A76C] hover:bg-[#E7C08B] text-[#0F0D09] px-5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                >
                  {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
