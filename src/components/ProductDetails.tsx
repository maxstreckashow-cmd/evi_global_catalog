import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { ArrowLeft, Send, Phone, Copy, Check, Search, Eye, Share2, Info, Calendar, Key } from "lucide-react";
import { MinerImage } from "./MinerImage";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  isAdmin?: boolean;
}

export function formatPayback(payback: string): string {
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

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, isAdmin = false }) => {
  const [copied, setCopied] = useState(false);
  const [contactOpened, setContactOpened] = useState(false);

  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const isAvailable = product.priceRubNumeric > 0;

  const hashrateNum = parseFloat(product.hashrate.replace(/,/g, "."));
  const powerNum = parseFloat(product.power.replace(/,/g, ".")) * 1000;
  const efficiency = product.efficiency || (isNaN(hashrateNum) || isNaN(powerNum) || hashrateNum === 0 
    ? null 
    : Math.round(powerNum / hashrateNum));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoTitle = `Купить ASIC-майнер ${product.manufacturer} ${product.model} ${product.hashrate ? product.hashrate + " TH/s" : ""} - лучшая цена | EVI Global Group`;
  const seoDesc = `Официальные оптовые поставки ASIC-майнера ${product.manufacturer} ${product.model} (${product.condition === 'New' ? 'новый' : 'Б/У'}) на алгоритме ${product.algorithm} с хэшрейтом ${product.hashrate} TH/s. Потребление: ${product.power} кВт. Минимальный заказ от 30 устройств напрямую от производителя. Актуальные цены, быстрая доставка и профессиональный подбор в EVI Global Group.`;
  const seoKeywords = `asic майнер, купить ${product.manufacturer} ${product.model}, ${product.manufacturer} ${product.model} цена, ${product.algorithm} майнер, майнинг оборудование оптом, купить асики от 30 шт, evi global group, окупаемость майнера ${product.payback} месяцев`;

  // Dynamically update page title for professional SEO on the client-side
  useEffect(() => {
    const originalTitle = document.title;
    document.title = seoTitle;
    return () => {
      document.title = originalTitle;
    };
  }, [seoTitle]);

  return (
    <div id="product-details-container" className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <a 
        id="btn-back"
        href="/"
        onClick={(e) => {
          if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onBack();
          }
        }}
        className="inline-flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300 transition-all cursor-pointer hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 text-[#D3A76C]" />
        Назад в каталог
      </a>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: specs and details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Visual Representative */}
              <div className="md:w-1/3 shrink-0">
                <MinerImage 
                  manufacturer={product.manufacturer} 
                  model={product.model} 
                  imageUrl={product.imageUrl}
                  className="h-48 w-full" 
                />
              </div>

              {/* Title & Top Badges */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded bg-[#D3A76C]/10 border border-[#D3A76C]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D3A76C]">
                      {product.manufacturer}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      product.condition.toLowerCase() === "new" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-[#D3A76C]/10 text-[#D3A76C] border border-[#D3A76C]/20"
                    }`}>
                      {product.condition === "New" ? "Новый" : "Б/У"}
                    </span>
                    <span className="rounded bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                      {product.algorithm}
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase">
                    {product.manufacturer} {product.model}
                  </h1>
                </div>

                <p className="mt-4 text-[10px] font-mono text-zinc-550 border-t border-zinc-900 pt-3">
                  Спецификация (Part Number): {product.slug}
                </p>
              </div>
            </div>

            {/* Technical Specifications Bento Grid */}
            <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-900 pb-2 font-mono">
              Технические характеристики
            </h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded bg-zinc-950/60 p-4 border border-zinc-900">
                <p className="text-[10px] text-zinc-550 font-mono tracking-wider uppercase">Производитель</p>
                <p className="mt-1 text-base font-bold text-white">{product.manufacturer}</p>
              </div>
              <div className="rounded bg-zinc-950/60 p-4 border border-zinc-900">
                <p className="text-[10px] text-zinc-550 font-mono tracking-wider uppercase">Хэшрейт</p>
                <p className="mt-1 text-base font-bold text-[#D3A76C]">{product.hashrate ? `${product.hashrate} TH` : "—"}</p>
              </div>
              <div className="rounded bg-zinc-950/60 p-4 border border-zinc-900">
                <p className="text-[10px] text-zinc-550 font-mono tracking-wider uppercase">Потребление</p>
                <p className="mt-1 text-base font-bold text-emerald-400">{product.power ? `${product.power} кВт` : "—"}</p>
              </div>
              <div className="rounded bg-zinc-950/60 p-4 border border-zinc-900">
                <p className="text-[10px] text-zinc-550 font-mono tracking-wider uppercase">Энергоэффективность</p>
                <p className="mt-1 text-base font-bold text-amber-550">{efficiency ? `${efficiency} J/T` : "—"}</p>
              </div>
              <div className="rounded bg-zinc-950/60 p-4 border border-zinc-900">
                <p className="text-[10px] text-zinc-550 font-mono tracking-wider uppercase">Вес устройства</p>
                <p className="mt-1 text-base font-bold text-white">{product.weight ? `${product.weight} кг` : "—"}</p>
              </div>
              <div className="rounded bg-zinc-950/60 p-4 border border-zinc-900">
                <p className="text-[10px] text-zinc-550 font-mono tracking-wider uppercase">Окупаемость</p>
                <p className="mt-1 text-base font-bold text-white">{product.payback ? formatPayback(product.payback) : "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: buy actions and widgets */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-6 sticky top-6">
            <h3 className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2 font-bold">
              Актуальная стоимость
            </h3>

            {isAvailable ? (
              <div className="space-y-1">
                <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {product.priceRub}
                </p>
                <p className="text-base font-semibold text-zinc-400 mt-0.5">
                  {product.priceUsd}
                </p>
                {isAdmin ? (
                  <div className="inline-flex items-center gap-1.5 rounded bg-[#D3A76C]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#D3A76C] border border-[#D3A76C]/20 mt-3 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D3A76C] animate-pulse"></span>
                    GOOGLE SHEETS СИНХРОНИЗАЦИЯ
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 mt-3 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    АКТУАЛЬНОЕ ПРЕДЛОЖЕНИЕ
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                <p className="text-xl font-extrabold text-[#D3A76C] uppercase tracking-wider font-mono">
                  Цена по запросу
                </p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Для уточнения актуальной стоимости по текущему курсу свяжитесь с менеджером.
                </p>
              </div>
            )}

            {/* Minimum Order Warning Badge (Продажа от 30 устройств) */}
            <div className="mt-6 rounded-lg border border-[#D3A76C]/30 bg-[#D3A76C]/5 p-4 flex gap-3">
              <Info className="h-5 w-5 text-[#D3A76C] shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Продажа от 30 устройств
                </span>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Поставка данного оборудования осуществляется исключительно оптовыми партиями от 30 единиц напрямую от производителя со склада или под заказ.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <a 
                id="btn-buy-tg"
                href={`https://t.me/EVI_Global_Customersupport?text=${encodeURIComponent(`Здравствуйте! Интересует майнер: ${product.manufacturer} ${product.model} (ID: ${product.slug}) по цене ${product.priceRub || "По запросу"}.`)}`}
                target="_blank" 
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded bg-[#D3A76C] hover:bg-[#E7C08B] hover:text-[#0F0D09] px-4 py-3.5 text-xs font-bold text-[#0F0D09] transition-all duration-300 cursor-pointer shadow-lg shadow-[#D3A76C]/15 uppercase tracking-widest"
              >
                <Send className="h-4 w-4" />
                Купить в Telegram
              </a>

              <a 
                id="btn-buy-tel"
                href="tel:+74958593089"
                className="flex w-full items-center justify-center gap-2.5 rounded bg-zinc-900 hover:bg-zinc-800 px-4 py-3.5 text-xs font-bold text-zinc-200 transition-all duration-300 cursor-pointer border border-zinc-800 uppercase tracking-widest"
              >
                <Phone className="h-4 w-4 text-[#D3A76C]" />
                Связаться
              </a>

              <button 
                id="btn-copy-link"
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-300 transition-all duration-300 cursor-pointer uppercase tracking-wider"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-zinc-500" />
                    Скопировать ссылку товара
                  </>
                )}
              </button>
            </div>

            {isAdmin && (
              <div className="mt-6 border-t border-zinc-900 pt-5 text-xs text-zinc-400">
                <div className="flex gap-2 items-start">
                  <Calendar className="h-4 w-4 text-zinc-550 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Цены синхронизируются в реальном времени с Google Sheets. Курс обновляется каждые 30 секунд.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
