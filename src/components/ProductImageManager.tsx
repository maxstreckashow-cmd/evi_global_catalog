import React, { useState } from "react";
import { Product } from "../types";
import { Search, Upload, Link, Trash2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { MinerImage } from "./MinerImage";

interface ProductImageManagerProps {
  products: Product[];
  onUpdateProductImage: (slug: string, imageUrl: string) => void;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  products,
  onUpdateProductImage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter products by search term
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.manufacturer.toLowerCase().includes(term) ||
      p.model.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term)
    );
  });

  // Handle URL change for a product
  const handleUrlInputChange = (slug: string, val: string) => {
    setUrlInputs((prev) => ({ ...prev, [slug]: val }));
  };

  // Submit URL image for a product
  const handleSaveUrl = async (slug: string) => {
    const url = urlInputs[slug]?.trim();
    if (!url) return;

    setSavingSlug(slug);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/products/${slug}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateProductImage(slug, url);
        setStatusMsg({ type: "success", text: "Ссылка на изображение успешно сохранена!" });
      } else {
        throw new Error("Failed to save image");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось сохранить ссылку на изображение." });
    } finally {
      setSavingSlug(null);
    }
  };

  // Clear image
  const handleClearImage = async (slug: string) => {
    if (!confirm("Вы уверены, что хотите удалить изображение товара?")) return;

    setSavingSlug(slug);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/products/${slug}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: "" }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateProductImage(slug, "");
        setUrlInputs((prev) => ({ ...prev, [slug]: "" }));
        setStatusMsg({ type: "success", text: "Изображение успешно удалено!" });
      } else {
        throw new Error("Failed to clear image");
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось удалить изображение." });
    } finally {
      setSavingSlug(null);
    }
  };

  // Handle local file upload & base64 conversion
  const handleFileUpload = async (slug: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Standard safety check: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой. Пожалуйста, загрузите изображение размером менее 5 МБ.");
      return;
    }

    setSavingSlug(slug);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const res = await fetch(`/api/products/${slug}/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: base64data }),
        });
        const data = await res.json();
        if (data.success) {
          onUpdateProductImage(slug, base64data);
          setStatusMsg({ type: "success", text: "Изображение успешно загружено и сохранено на сервере!" });
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (err) {
        console.error(err);
        setStatusMsg({ type: "error", text: "Не удалось загрузить изображение на сервер." });
      } finally {
        setSavingSlug(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Менеджер изображений товаров
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Загружайте собственные изображения или вставляйте внешние ссылки. Изображения сохраняются на сервере и мгновенно интегрируются в каталог и экспорт.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Поиск по производителю, модели..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-zinc-950/40 py-2 pl-9 pr-4 text-xs font-semibold text-zinc-300 outline-none transition-colors focus:border-[#D3A76C] focus:bg-zinc-900/40"
          />
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded border px-4 py-3 text-xs font-semibold transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid of editable products */}
      {filteredProducts.length === 0 ? (
        <div className="rounded border border-dashed border-zinc-850 py-12 text-center text-zinc-500">
          Товары не найдены
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((p) => {
            const hasCustomImage = !!p.imageUrl;
            const currentUrlInput = urlInputs[p.slug] !== undefined ? urlInputs[p.slug] : p.imageUrl || "";

            return (
              <div
                key={p.slug}
                className="flex flex-col sm:flex-row gap-4 rounded-xl border border-zinc-800/80 bg-zinc-950/20 p-4 transition-all duration-300 hover:border-zinc-800"
              >
                {/* Visual preview */}
                <div className="w-full sm:w-32 shrink-0 flex flex-col justify-between">
                  <MinerImage
                    manufacturer={p.manufacturer}
                    model={p.model}
                    imageUrl={p.imageUrl}
                    className="h-28 w-full"
                  />
                  <div className="mt-2 text-center">
                    <span className="inline-block text-[9px] font-mono font-bold text-zinc-550 uppercase tracking-widest truncate max-w-full">
                      {p.manufacturer}
                    </span>
                    <span className="block text-[10px] font-black text-white truncate max-w-full uppercase">
                      {p.model}
                    </span>
                  </div>
                </div>

                {/* Edit forms */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 font-mono block">
                      ID: {p.slug}
                    </span>
                    <span className="text-[10px] font-bold text-[#D3A76C] font-mono uppercase">
                      Алгоритм: {p.algorithm || "—"} | Хэшрейт: {p.hashrate} TH
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* File Upload Button */}
                    <div>
                      <label className="flex items-center justify-center gap-1.5 rounded border border-zinc-850 bg-zinc-950/60 hover:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer w-full text-center">
                        {savingSlug === p.slug ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#D3A76C]" />
                        ) : (
                          <Upload className="h-3.5 w-3.5 text-[#D3A76C]" />
                        )}
                        <span>{savingSlug === p.slug ? "Сохранение..." : "Загрузить файл"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(p.slug, e)}
                          disabled={savingSlug === p.slug}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Or Paste URL */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-600">
                          <Link className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Или вставьте ссылку на изображение"
                          value={currentUrlInput}
                          onChange={(e) => handleUrlInputChange(p.slug, e.target.value)}
                          disabled={savingSlug === p.slug}
                          className="w-full rounded border border-zinc-850 bg-zinc-950/60 py-1.5 pl-8 pr-2 text-[10px] font-semibold text-zinc-300 outline-none transition-colors focus:border-[#D3A76C] focus:bg-zinc-900/60"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveUrl(p.slug)}
                        disabled={savingSlug === p.slug || !currentUrlInput || currentUrlInput === p.imageUrl}
                        className="rounded border border-[#D3A76C]/30 bg-[#D3A76C]/10 text-[#D3A76C] hover:bg-[#D3A76C] hover:text-[#0F0D09] px-3 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#D3A76C] cursor-pointer"
                      >
                        ОК
                      </button>
                    </div>
                  </div>

                  {/* Danger zone delete button if has custom image */}
                  {hasCustomImage && (
                    <div className="pt-2 border-t border-zinc-900 flex justify-end">
                      <button
                        onClick={() => handleClearImage(p.slug)}
                        disabled={savingSlug === p.slug}
                        className="flex items-center gap-1.5 rounded hover:bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Сбросить изображение</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
