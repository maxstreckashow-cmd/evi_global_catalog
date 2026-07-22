import React, { useState, useEffect } from "react";
import { Product, SeoOverride } from "../types";
import { Search, Save, Trash2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Eye, Globe } from "lucide-react";
import { MinerImage } from "./MinerImage";

interface AdminSeoManagerProps {
  products: Product[];
  onRefreshSeo?: () => void;
}

export const AdminSeoManager: React.FC<AdminSeoManagerProps> = ({ products, onRefreshSeo }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [seoOverrides, setSeoOverrides] = useState<Record<string, SeoOverride>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for selected product
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Fetch current overrides on mount
  useEffect(() => {
    fetchOverrides();
  }, []);

  const fetchOverrides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo-overrides");
      if (res.ok) {
        const data = await res.json();
        setSeoOverrides(data || {});
      }
    } catch (e) {
      console.error("Error fetching SEO overrides:", e);
    } finally {
      setLoading(false);
    }
  };

  // Set form values when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      const override = seoOverrides[selectedProduct.slug] || {};
      setTitle(override.title || "");
      setDescription(override.description || "");
      setKeywords(override.keywords || "");
      setOgTitle(override.ogTitle || "");
      setOgDescription(override.ogDescription || "");
      setOgImage(override.ogImage || "");
      setStatusMsg(null);
    } else {
      setTitle("");
      setDescription("");
      setKeywords("");
      setOgTitle("");
      setOgDescription("");
      setOgImage("");
    }
  }, [selectedProduct, seoOverrides]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleGenerateDraft = () => {
    if (!selectedProduct) return;
    const p = selectedProduct;
    
    // Standard template formulas
    const draftTitle = `Купить ASIC-майнер ${p.manufacturer} ${p.model} ${p.hashrate ? p.hashrate + " TH/s" : ""} - лучшая цена | EVI Global Group`;
    const draftDesc = `Официальные оптовые поставки ASIC-майнера ${p.manufacturer} ${p.model} (${p.condition === 'New' ? 'новый' : 'Б/У'}) на алгоритме ${p.algorithm} с хэшрейтом ${p.hashrate} TH/s. Потребление: ${p.power} кВт. Минимальный заказ от 30 устройств напрямую от производителя. Актуальные цены, быстрая доставка и профессиональный подбор в EVI Global Group.`;
    const draftKeywords = `asic майнер, купить ${p.manufacturer} ${p.model}, ${p.manufacturer} ${p.model} цена, ${p.algorithm} майнер, майнинг оборудование оптом, купить асики от 30 шт, evi global group, окупаемость майнера ${p.payback || 12} месяцев`;
    
    setTitle(draftTitle);
    setDescription(draftDesc);
    setKeywords(draftKeywords);
    setOgTitle(draftTitle);
    setOgDescription(draftDesc);
    setOgImage(p.imageUrl || "");
    
    setStatusMsg({ type: "success", text: "Шаблон SEO успешно сгенерирован! Не забудьте сохранить изменения." });
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    setStatusMsg(null);

    const overrideData: SeoOverride = {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      keywords: keywords.trim() || undefined,
      ogTitle: ogTitle.trim() || undefined,
      ogDescription: ogDescription.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
    };

    try {
      const res = await fetch(`/api/seo-overrides/${selectedProduct.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrideData),
      });

      if (res.ok) {
        setSeoOverrides((prev) => ({
          ...prev,
          [selectedProduct.slug]: overrideData,
        }));
        setStatusMsg({ type: "success", text: "SEO метаданные успешно сохранены!" });
        if (onRefreshSeo) onRefreshSeo();
      } else {
        throw new Error("Failed to save SEO override");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось сохранить SEO метаданные." });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!selectedProduct) return;
    if (!confirm("Вы уверены, что хотите сбросить SEO настройки для этого товара на стандартные?")) return;
    
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/seo-overrides/${selectedProduct.slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSeoOverrides((prev) => {
          const updated = { ...prev };
          delete updated[selectedProduct.slug];
          return updated;
        });
        
        // Reset inputs
        setTitle("");
        setDescription("");
        setKeywords("");
        setOgTitle("");
        setOgDescription("");
        setOgImage("");
        
        setStatusMsg({ type: "success", text: "SEO настройки успешно сброшены!" });
        if (onRefreshSeo) onRefreshSeo();
      } else {
        throw new Error("Failed to clear SEO override");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось сбросить SEO настройки." });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.manufacturer.toLowerCase().includes(term) ||
      p.model.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term)
    );
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Product list column */}
      <div className="xl:col-span-5 space-y-4">
        <div className="rounded border border-zinc-900 bg-zinc-950/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#D3A76C] mb-3">
            Выберите продукт для настройки SEO
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Поиск по названию или slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#D3A76C] focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 text-[#D3A76C] animate-spin" />
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto space-y-2 rounded border border-zinc-900 bg-zinc-950/20 p-2">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                Товары не найдены
              </div>
            ) : (
              filteredProducts.map((p) => {
                const hasCustom = !!seoOverrides[p.slug] && Object.values(seoOverrides[p.slug]).some(v => v);
                const isSelected = selectedProduct?.slug === p.slug;
                
                return (
                  <button
                    key={p.slug}
                    onClick={() => handleSelectProduct(p)}
                    className={`w-full flex items-center gap-3 p-3 rounded text-left transition-all border ${
                      isSelected
                        ? "bg-[#D3A76C]/10 border-[#D3A76C] text-white"
                        : "bg-zinc-950/50 border-zinc-900/40 text-zinc-400 hover:border-zinc-800 hover:text-white"
                    }`}
                  >
                    <div className="h-10 w-10 shrink-0 bg-zinc-900/80 rounded border border-zinc-800 flex items-center justify-center overflow-hidden">
                      <MinerImage imageUrl={p.imageUrl} className="h-8 w-8 object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-tight text-white">
                          {p.manufacturer} {p.model}
                        </span>
                        {hasCustom && (
                          <span className="bg-[#D3A76C]/10 text-[#D3A76C] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-[#D3A76C]/20 font-mono">
                            SEO CUSTOM
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">
                        /product/{p.slug}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* SEO Editor column */}
      <div className="xl:col-span-7">
        {selectedProduct ? (
          <div className="rounded border border-zinc-900 bg-zinc-950/40 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-zinc-900 pb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  SEO Редактор: {selectedProduct.manufacturer} {selectedProduct.model}
                </h3>
                <p className="text-[11px] text-[#D3A76C] font-mono mt-0.5">
                  URL: https://catalog.evi-global.com/product/{selectedProduct.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateDraft}
                  className="flex items-center gap-1.5 rounded border border-[#D3A76C]/20 bg-[#D3A76C]/5 hover:bg-[#D3A76C]/10 text-[#D3A76C] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                  title="Сгенерировать заполненный шаблон на основе характеристик"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Заполнить шаблон</span>
                </button>
                {seoOverrides[selectedProduct.slug] && (
                  <button
                    onClick={handleClear}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded border border-red-900/30 bg-red-950/10 hover:bg-red-950/30 text-red-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Сбросить</span>
                  </button>
                )}
              </div>
            </div>

            {statusMsg && (
              <div
                className={`flex items-start gap-2.5 rounded p-3 text-xs ${
                  statusMsg.type === "success"
                    ? "bg-green-950/20 border border-green-800/20 text-green-400"
                    : "bg-red-950/20 border border-red-800/20 text-red-400"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div>{statusMsg.text}</div>
              </div>
            )}

            {/* Inputs Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Meta Title (Заголовок)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Купить ASIC-майнер..."
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#D3A76C] focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                    <span>Рекомендуется до 60 символов</span>
                    <span className={title.length > 60 ? "text-[#D3A76C]" : ""}>{title.length} симв.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Meta Keywords (Ключевые слова)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="asic майнер, купить, цена, ..."
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#D3A76C] focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Разделяйте ключевые слова запятыми</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Meta Description (Описание)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Введите уникальное SEO-описание товара для поисковых систем..."
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#D3A76C] focus:outline-none resize-none"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>Рекомендуется 140–160 символов</span>
                  <span className={description.length > 160 ? "text-[#D3A76C]" : ""}>{description.length} симв.</span>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-[#D3A76C]" />
                  <span>Социальные теги (Open Graph)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      OG Title (Заголовок ссылки)
                    </label>
                    <input
                      type="text"
                      value={ogTitle}
                      onChange={(e) => setOgTitle(e.target.value)}
                      placeholder="Оставьте пустым для наследования Meta Title"
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#D3A76C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      OG Image URL (Ссылка на превью-картинку)
                    </label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="Оставьте пустым для наследования картинки товара"
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#D3A76C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    OG Description (Описание ссылки)
                  </label>
                  <textarea
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                    rows={2}
                    placeholder="Оставьте пустым для наследования Meta Description"
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:border-[#D3A76C] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PREVIEWS SECTION */}
            <div className="border-t border-zinc-900 pt-6 space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[#D3A76C]" />
                <span>Предпросмотр отображения</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Google Snippet Preview */}
                <div className="rounded border border-zinc-900 bg-zinc-950 p-4 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-1">
                    Google Поиск
                  </span>
                  <div className="text-[#1a0dab] hover:underline text-lg font-medium leading-snug truncate cursor-pointer font-sans">
                    {title || `Купить ASIC-майнер ${selectedProduct.manufacturer} ${selectedProduct.model}...`}
                  </div>
                  <div className="text-[#006621] text-xs font-sans leading-tight truncate">
                    catalog.evi-global.com › product › {selectedProduct.slug}
                  </div>
                  <div className="text-zinc-400 text-xs font-sans leading-normal line-clamp-2">
                    {description || `Официальные оптовые поставки ASIC-майнера ${selectedProduct.manufacturer} ${selectedProduct.model}...`}
                  </div>
                </div>

                {/* Telegram Telegram Card Preview */}
                <div className="rounded border border-zinc-900 bg-zinc-950 p-4 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono block mb-1">
                    Telegram Ссылка
                  </span>
                  <div className="border-l-2 border-[#2481cc] pl-3 py-0.5 flex gap-3 justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <div className="text-[#2481cc] text-[11px] font-sans font-semibold">
                        EVI Global Group
                      </div>
                      <div className="text-white text-xs font-sans font-bold mt-0.5 line-clamp-1">
                        {ogTitle || title || `Купить ASIC-майнер ${selectedProduct.manufacturer} ${selectedProduct.model}`}
                      </div>
                      <div className="text-zinc-400 text-[11px] font-sans mt-0.5 leading-tight line-clamp-2">
                        {ogDescription || description || `Официальные оптовые поставки ASIC-майнера ${selectedProduct.manufacturer}...`}
                      </div>
                    </div>
                    {(ogImage || selectedProduct.imageUrl) && (
                      <div className="h-12 w-12 bg-zinc-900 shrink-0 rounded border border-zinc-800 overflow-hidden flex items-center justify-center">
                        <img
                          src={ogImage || selectedProduct.imageUrl}
                          alt="preview"
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-zinc-900 pt-4 flex justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded bg-[#D3A76C] hover:bg-[#E7C08B] disabled:opacity-50 text-[#0F0D09] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Сохранить SEO теги</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded bg-zinc-950/20 p-6 text-center">
            <Globe className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Продукт не выбран
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
              Выберите ASIC-майнер из списка слева, чтобы настроить для него индивидуальные SEO мета-теги, ключевые слова и превью для Telegram.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
