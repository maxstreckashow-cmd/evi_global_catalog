import React, { useState } from "react";
import { Copy, Check, Download, Layers, RefreshCw, Code, ArrowUpRight, HelpCircle } from "lucide-react";

export const TildaIntegration: React.FC = () => {
  const [copiedYml, setCopiedYml] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);

  const appUrl = window.location.origin;
  const ymlUrl = `${appUrl}/api/catalog.xml`;
  const csvUrl = `${appUrl}/api/catalog.csv`;

  const widgetEmbedCode = `<!-- ИНТЕРАКТИВНЫЙ КАТАЛОГ ASIC-МАЙНЕРОВ ДЛЯ TILDA (EVI GLOBAL GROUP) -->
<div id="evi-catalog-widget" class="bg-[#08080a] text-zinc-100 font-sans p-0 m-0 min-h-screen relative overflow-hidden" style="color-scheme: dark;">
  <!-- Фоновое свечение -->
  <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; border-radius: 50%; background: rgba(211, 167, 108, 0.05); filter: blur(100px); pointer-events: none; z-index: 1;"></div>
  <div style="position: absolute; bottom: -100px; left: -100px; width: 300px; height: 300px; border-radius: 50%; background: rgba(211, 167, 108, 0.03); filter: blur(100px); pointer-events: none; z-index: 1;"></div>

  <div class="max-w-7xl mx-auto px-4 py-8 relative z-10">
    <!-- Шапка каталога -->
    <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800/80 pb-6 mb-8 gap-4">
      <div class="flex items-center gap-4">
        <img src="${appUrl}/logo.png" alt="EVI Global Group" style="height: 48px; object-fit: contain; pointer-events: none;" referrerPolicy="no-referrer">
      </div>
      <div class="flex items-center gap-3">
        <div id="sync-badge" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" style="box-shadow: 0 0 8px #10B981; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
          ОНЛАЙН СИНХРОНИЗАЦИЯ
        </div>
        <button id="widget-btn-compare-trigger" class="hidden inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-[#D3A76C] px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer">
          <span>Сравнение</span>
          <span id="widget-compare-count" class="rounded bg-[#D3A76C] px-1.5 py-0.5 text-[10px] font-black text-[#0F0D09]">0</span>
        </button>
      </div>
    </div>

    <!-- Загрузка -->
    <div id="catalog-loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="w-10 h-10 border-4 border-[#D3A76C]/20 border-t-[#D3A76C] rounded-full" style="animation: spin 1s linear infinite;"></div>
      <p class="text-sm font-mono text-zinc-450 uppercase tracking-wider">Загрузка актуального каталога из Google Sheets...</p>
    </div>

    <!-- Основной интерфейс каталога (скрыт по умолчанию) -->
    <div id="catalog-main" class="hidden">
      <!-- Поиск и фильтры -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mb-8">
        <!-- Поисковая строка -->
        <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900">
          <div class="md:col-span-2 relative">
            <input type="text" id="filter-search" placeholder="Поиск по модели (например, S21, M60)..." class="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#D3A76C] focus:outline-none rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors">
          </div>
          <div>
            <select id="filter-mfr" class="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#D3A76C] focus:outline-none rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors">
              <option value="">Все производители</option>
            </select>
          </div>
          <div>
            <select id="filter-condition" class="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#D3A76C] focus:outline-none rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors">
              <option value="">Любое состояние</option>
              <option value="New">Новые (New)</option>
              <option value="Used">Б/У (Used)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Сетка товаров -->
      <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>

      <!-- Пустой каталог -->
      <div id="empty-results" class="hidden py-16 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
        <p class="text-zinc-500 text-sm font-mono">Товары с выбранными фильтрами не найдены. Попробуйте сбросить фильтры.</p>
        <button id="btn-reset-filters" class="mt-4 inline-flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold text-[#D3A76C] hover:bg-zinc-900 transition-all">Сбросить фильтры</button>
      </div>
    </div>

    <!-- Детальный просмотр товара (скрыт по умолчанию) -->
    <div id="catalog-details" class="hidden space-y-6">
      <button id="btn-details-back" class="inline-flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300 transition-all cursor-pointer">
        <svg style="width: 16px; height: 16px; transform: scaleX(-1); fill: none; stroke: currentColor; stroke-width: 2.5;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        Назад в каталог
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Спецификации -->
        <div class="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-6">
          <div class="flex flex-col md:flex-row gap-6">
            <div id="details-image-container" class="md:w-1/3 shrink-0 flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900 p-4">
              <!-- Картинка асика -->
            </div>
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <span id="details-mfr-badge" class="rounded bg-[#D3A76C]/10 border border-[#D3A76C]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D3A76C]"></span>
                  <span id="details-condition-badge" class="inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"></span>
                  <span id="details-algorithm-badge" class="rounded bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400"></span>
                </div>
                <h1 id="details-title" class="text-2xl md:text-3xl font-black text-white tracking-tight uppercase"></h1>
              </div>
              <p id="details-slug" class="mt-4 text-[10px] font-mono text-zinc-600 border-t border-zinc-900 pt-3"></p>
            </div>
          </div>

          <h3 class="mt-8 text-sm font-bold uppercase tracking-wider text-zinc-300 border-b border-zinc-900 pb-2 font-mono">Технические характеристики</h3>
          <div class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4" id="details-specs-grid"></div>
        </div>

        <!-- Покупка -->
        <div class="space-y-6">
          <div class="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-6">
            <h3 class="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2 font-bold">Актуальная стоимость</h3>
            <div id="details-price-box"></div>

            <div class="mt-6 rounded-lg border border-[#D3A76C]/30 bg-[#D3A76C]/5 p-4 flex gap-3">
              <svg style="width: 20px; height: 20px; color: #D3A76C; flex-shrink: 0;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <div>
                <span class="block text-xs font-bold text-white uppercase tracking-wider font-mono">Продажа от 30 устройств</span>
                <p class="text-[11px] text-zinc-400 mt-1 leading-relaxed">Поставка данного оборудования осуществляется исключительно оптовыми партиями от 30 единиц напрямую со склада производителя.</p>
              </div>
            </div>

            <div class="mt-8 space-y-3">
              <a id="details-tg-link" href="#" target="_blank" class="flex w-full items-center justify-center gap-2.5 rounded bg-[#D3A76C] hover:bg-[#E7C08B] px-4 py-3.5 text-xs font-bold text-[#0F0D09] transition-all duration-300 uppercase tracking-widest shadow-lg shadow-[#D3A76C]/15">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M11.944 0C5.344 0 0 5.344 0 11.944c0 5.25 3.394 9.713 8.113 11.288.594.113.813-.256.813-.569v-2.225c-3.325.719-4.025-1.606-4.025-1.606-.544-1.381-1.325-1.75-1.325-1.75-1.088-.744.081-.725.081-.725 1.2.081 1.831 1.231 1.831 1.231 1.069 1.831 2.806 1.3 3.494.994.106-.775.419-1.3.762-1.6-2.656-.3-5.45-1.331-5.45-5.912 0-1.306.469-2.375 1.231-3.212-.119-.3-.531-1.519.119-3.163 0 0 1-.319 3.3 1.231.956-.269 1.981-.394 3-.4 1.019.006 2.044.131 3 .4 2.3-1.55 3.3-1.231 3.3-1.231.656 1.644.244 2.863.125 3.163.769.837 1.231 1.906 1.231 3.212 0 4.594-2.8 5.606-5.462 5.9.431.369.813 1.106.813 2.225v3.294c0 .319.219.694.825.575C20.612 21.65 24 17.194 24 11.944 24 5.344 18.656 0 11.944 0z" class="hidden"/></svg>
                <!-- Telegram Icon replacement -->
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                Купить в Telegram
              </a>

              <a id="details-wa-link" href="#" target="_blank" class="flex w-full items-center justify-center gap-2.5 rounded bg-zinc-900 hover:bg-zinc-800 px-4 py-3.5 text-xs font-bold text-zinc-200 transition-all border border-zinc-800 uppercase tracking-widest">
                <svg style="width: 16px; height: 16px; color: #D3A76C;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                Связаться в WhatsApp
              </a>

              <button id="btn-details-copy-link" class="flex w-full items-center justify-center gap-2.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-300 transition-all uppercase tracking-wider">
                Скопировать ссылку товара
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка сравнения (скрыта по умолчанию) -->
    <div id="compare-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div class="bg-zinc-950 border border-zinc-800 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
          <h2 class="text-base font-bold text-white uppercase tracking-wider font-mono">Сравнение оборудования</h2>
          <button id="btn-compare-close" class="text-zinc-400 hover:text-white cursor-pointer">
            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="overflow-x-auto p-6" id="compare-table-container"></div>
        <div class="border-t border-zinc-900 px-6 py-4 flex justify-between bg-zinc-950/80">
          <button id="btn-compare-clear-all" class="text-xs font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider cursor-pointer">Очистить список</button>
          <button id="btn-compare-close-footer" class="rounded bg-zinc-900 hover:bg-zinc-800 px-5 py-2 text-xs font-bold text-white uppercase tracking-wider border border-zinc-800 cursor-pointer">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Хэши стилей для анимаций -->
<style>
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
</style>

<!-- Скрипт логики виджета -->
<script>
(function() {
  const API_URL = "${appUrl}/api/products";
  
  // Состояние
  let allProducts = [];
  let comparedSlugs = [];
  let activeProductSlug = null;
  
  // Кэш элементов
  const container = document.getElementById("evi-catalog-widget");
  const elLoading = document.getElementById("catalog-loading");
  const elMain = document.getElementById("catalog-main");
  const elDetails = document.getElementById("catalog-details");
  const elGrid = document.getElementById("products-grid");
  const elEmpty = document.getElementById("empty-results");
  
  const elSearch = document.getElementById("filter-search");
  const elMfr = document.getElementById("filter-mfr");
  const elCond = document.getElementById("filter-condition");
  const elReset = document.getElementById("btn-reset-filters");
  
  const btnCompareTrigger = document.getElementById("widget-btn-compare-trigger");
  const badgeCompareCount = document.getElementById("widget-compare-count");
  const modalCompare = document.getElementById("compare-modal");
  const elCompareTable = document.getElementById("compare-table-container");
  
  // Хэш кастомных SVG диаграмм для майнеров (чтобы не было пустых серых плашек)
  function getMinerVectorSvg(manufacturer, model) {
    const mfr = manufacturer.toLowerCase();
    if (mfr.includes("antminer") || mfr.includes("bitmain")) {
      return \`<svg class="w-full h-24 text-zinc-400" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="35" y="40" width="90" height="55" rx="4" fill="#2E2E33" stroke="#D3A76C" stroke-width="1.5" />
        <rect x="39" y="44" width="82" height="47" rx="2" fill="#1C1C1F" />
        <path d="M45 40 L45 22 C45 20.5 46.5 19 48 19 L112 19 C113.5 19 115 20.5 115 22 L115 40 Z" fill="#2E2E33" stroke="#D3A76C" stroke-width="1" />
        <circle cx="58" cy="67" r="16" fill="#0F0D09" stroke="#D3A76C" stroke-width="1" />
        <circle cx="102" cy="67" r="16" fill="#0F0D09" stroke="#D3A76C" stroke-width="1" />
        <text x="73" y="73" fill="#D3A76C" font-size="8" font-weight="900" font-family="monospace">ANT</text>
      </svg>\`;
    } else if (mfr.includes("whatsminer")) {
      return \`<svg class="w-full h-24 text-zinc-400" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="32" width="22" height="66" rx="2" fill="#202024" stroke="#E7C08B" stroke-width="1" />
        <rect x="47" y="38" width="88" height="54" rx="3" fill="#2E2E33" stroke="#E7C08B" stroke-width="1.5" />
        <rect x="51" y="42" width="80" height="46" rx="1" fill="#1C1C1F" />
        <circle cx="91" cy="65" r="18" fill="#0F0D09" stroke="#E7C08B" stroke-width="1.25" />
        <text x="56" y="52" fill="#E7C08B" font-size="6" font-weight="900" font-family="monospace">M60</text>
      </svg>\`;
    } else if (mfr.includes("iceriver")) {
      return \`<svg class="w-full h-24 text-zinc-400" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="100" height="60" rx="6" fill="#1C1C1F" stroke="#D3A76C" stroke-width="1.5" />
        <circle cx="56" cy="60" r="12" fill="#0F0D09" stroke="#D3A76C" stroke-width="1" />
        <circle cx="104" cy="60" r="12" fill="#0F0D09" stroke="#D3A76C" stroke-width="1" />
        <rect x="74" y="52" width="12" height="16" rx="1" fill="#D3A76C" />
        <text x="76" y="62" fill="#0F0D09" font-size="5" font-weight="900" font-family="monospace">KAS</text>
      </svg>\`;
    } else {
      return \`<svg class="w-full h-24 text-zinc-400" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="36" width="100" height="56" rx="4" fill="#2E2E33" stroke="#D3A76C" stroke-width="1.5" />
        <circle cx="80" cy="64" r="18" fill="#0F0D09" stroke="#D3A76C" stroke-width="1.25" />
        <circle cx="80" cy="64" r="4" fill="#D3A76C" />
      </svg>\`;
    }
  }

  // Запуск инициализации
  init();

  async function init() {
    setupListeners();
    await loadProducts();
    handleRouting();
  }

  // Настройка слушателей событий браузера и UI
  function setupListeners() {
    elSearch.addEventListener("input", filterAndRender);
    elMfr.addEventListener("change", filterAndRender);
    elCond.addEventListener("change", filterAndRender);
    elReset.addEventListener("click", () => {
      elSearch.value = "";
      elMfr.value = "";
      elCond.value = "";
      filterAndRender();
    });

    // Обработка кнопки Назад в браузере
    window.addEventListener("popstate", () => {
      handleRouting();
    });

    // Модалка сравнения
    btnCompareTrigger.addEventListener("click", () => {
      openCompareModal();
    });
    document.getElementById("btn-compare-close").addEventListener("click", closeCompareModal);
    document.getElementById("btn-compare-close-footer").addEventListener("click", closeCompareModal);
    document.getElementById("btn-compare-clear-all").addEventListener("click", () => {
      comparedSlugs = [];
      updateCompareBadge();
      closeCompareModal();
      filterAndRender();
    });

    // Назад в деталях
    document.getElementById("btn-details-back").addEventListener("click", () => {
      navigateToCatalog();
    });
  }

  // Загрузка товаров из API
  async function loadProducts() {
    try {
      const res = await fetch(API_URL);
      allProducts = await res.json();
      
      // Заполняем фильтр по производителям динамически
      const manufacturers = [...new Set(allProducts.map(p => p.manufacturer))].sort();
      manufacturers.forEach(mfr => {
        if (!mfr) return;
        const opt = document.createElement("option");
        opt.value = mfr;
        opt.textContent = mfr;
        elMfr.appendChild(opt);
      });

      elLoading.classList.add("hidden");
      elMain.classList.remove("hidden");
    } catch (e) {
      console.error("Ошибка загрузки продуктов виджета EVI:", e);
      elLoading.innerHTML = \`<p class="text-rose-400 font-mono text-xs">Ошибка загрузки каталога. Пожалуйста, попробуйте позже.</p>\`;
    }
  }

  // Роутинг по URL параметрам (?product=slug)
  function handleRouting() {
    const params = new URLSearchParams(window.location.search);
    const productSlug = params.get("product") || params.get("id");
    
    if (productSlug) {
      const product = allProducts.find(p => p.slug === productSlug);
      if (product) {
        showProductDetails(product);
        return;
      }
    }
    
    showCatalog();
  }

  function navigateToProduct(slug) {
    const newUrl = window.location.pathname + "?product=" + encodeURIComponent(slug);
    window.history.pushState({ product: slug }, "", newUrl);
    
    const product = allProducts.find(p => p.slug === slug);
    if (product) {
      showProductDetails(product);
    }
  }

  function navigateToCatalog() {
    const newUrl = window.location.pathname;
    window.history.pushState({}, "", newUrl);
    showCatalog();
  }

  function showCatalog() {
    elDetails.classList.add("hidden");
    elMain.classList.remove("hidden");
    window.scrollTo({ top: container.offsetTop - 20, behavior: "smooth" });
    filterAndRender();
  }

  function showProductDetails(product) {
    elMain.classList.add("hidden");
    elDetails.classList.remove("hidden");
    window.scrollTo({ top: container.offsetTop - 20, behavior: "smooth" });

    // Заполнение полей детального просмотра
    document.getElementById("details-title").textContent = \`\${product.manufacturer} \${product.model}\`;
    document.getElementById("details-slug").textContent = \`Спецификация (Part Number): \${product.slug}\`;
    document.getElementById("details-mfr-badge").textContent = product.manufacturer;
    
    // Алгоритм
    document.getElementById("details-algorithm-badge").textContent = product.algorithm || "SHA-256";
    
    // Состояние
    const condBadge = document.getElementById("details-condition-badge");
    condBadge.textContent = product.condition === "New" ? "Новый" : "Б/У";
    if (product.condition === "New") {
      condBadge.className = "inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    } else {
      condBadge.className = "inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D3A76C]/10 text-[#D3A76C] border border-[#D3A76C]/20";
    }

    // Рендер картинки
    const imgContainer = document.getElementById("details-image-container");
    if (product.imageUrl) {
      imgContainer.innerHTML = \`<img src="\${product.imageUrl}" alt="\${product.manufacturer} \${product.model}" style="max-height: 192px; object-fit: contain;" referrerPolicy="no-referrer">\`;
    } else {
      imgContainer.innerHTML = getMinerVectorSvg(product.manufacturer, product.model);
    }

    // Рендер характеристик (сетка бенто)
    const hashrateNum = parseFloat(product.hashrate.replace(/,/g, "."));
    const powerNum = parseFloat(product.power.replace(/,/g, ".")) * 1000;
    const efficiency = product.efficiency || (isNaN(hashrateNum) || isNaN(powerNum) || hashrateNum === 0 
      ? null 
      : Math.round(powerNum / hashrateNum));

    const specs = [
      { label: "Производитель", val: product.manufacturer },
      { label: "Хэшрейт", val: product.hashrate ? \`\${product.hashrate} TH\` : "—" },
      { label: "Потребление", val: product.power ? \`\${product.power} кВт\` : "—" },
      { label: "Энергоэффективность", val: efficiency ? \`\${efficiency} J/T\` : "—" },
      { label: "Вес устройства", val: product.weight ? \`\${product.weight} кг\` : "—" },
      { label: "Окупаемость", val: product.payback ? \`\${product.payback} мес.\` : "—" }
    ];

    document.getElementById("details-specs-grid").innerHTML = specs.map(spec => \`
      <div class="rounded bg-zinc-950/60 p-4 border border-zinc-900">
        <p class="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">\${spec.label}</p>
        <p class="mt-1 text-base font-bold text-white">\${spec.val}</p>
      </div>
    \`).join("");

    // Блок цен
    const priceBox = document.getElementById("details-price-box");
    if (product.priceRubNumeric > 0) {
      priceBox.innerHTML = \`
        <div class="space-y-1">
          <p class="text-3xl md:text-4xl font-black text-white tracking-tight">\${product.priceRub}</p>
          <p class="text-base font-semibold text-zinc-400 mt-0.5">\${product.priceUsd}</p>
          <div class="inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 mt-3 font-mono">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" style="animation: pulse 2s infinite;"></span>
            АКТУАЛЬНОЕ ПРЕДЛОЖЕНИЕ
          </div>
        </div>
      \`;
    } else {
      priceBox.innerHTML = \`
        <div class="py-2">
          <p class="text-xl font-extrabold text-[#D3A76C] uppercase tracking-wider font-mono">Цена по запросу</p>
          <p class="text-xs text-zinc-400 mt-2 leading-relaxed">Для уточнения актуальной стоимости по текущему курсу свяжитесь с менеджером.</p>
        </div>
      \`;
    }

    // Ссылки на контакты
    const msg = \`Здравствуйте! Интересует майнер: \${product.manufacturer} \${product.model} (ID: \s\${product.slug}) по цене \${product.priceRub || "По запросу"}.\`;
    document.getElementById("details-tg-link").href = "https://t.me/EVI_Global_Customersupport?text=" + encodeURIComponent(msg);
    document.getElementById("details-wa-link").href = "https://wa.me/79999999999?text=" + encodeURIComponent(msg);

    // Копирование ссылки
    const copyBtn = document.getElementById("btn-details-copy-link");
    copyBtn.onclick = () => {
      const fullUrl = window.location.origin + window.location.pathname + "?product=" + encodeURIComponent(product.slug);
      navigator.clipboard.writeText(fullUrl).then(() => {
        copyBtn.textContent = "Ссылка скопирована!";
        copyBtn.classList.add("text-emerald-400", "border-emerald-500/30", "bg-emerald-500/5");
        setTimeout(() => {
          copyBtn.textContent = "Скопировать ссылку товара";
          copyBtn.classList.remove("text-emerald-400", "border-emerald-500/30", "bg-emerald-500/5");
        }, 2000);
      });
    };
  }

  // Фильтрация и рендеринг
  function filterAndRender() {
    const q = elSearch.value.trim().toLowerCase();
    const mfrVal = elMfr.value;
    const condVal = elCond.value;

    const filtered = allProducts.filter(p => {
      if (q) {
        const matchesMfr = p.manufacturer.toLowerCase().includes(q);
        const matchesModel = p.model.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        if (!matchesMfr && !matchesModel && !matchesSlug) return false;
      }
      if (mfrVal && p.manufacturer !== mfrVal) return false;
      if (condVal && p.condition !== condVal) return false;
      return true;
    });

    if (filtered.length === 0) {
      elGrid.innerHTML = "";
      elEmpty.classList.remove("hidden");
    } else {
      elEmpty.classList.add("hidden");
      renderGrid(filtered);
    }
  }

  // Рендер сетки асиков
  function renderGrid(products) {
    elGrid.innerHTML = products.map(p => {
      const isCompared = comparedSlugs.includes(p.slug);
      const isAvailable = p.priceRubNumeric > 0;
      
      const hashrateNum = parseFloat(p.hashrate.replace(/,/g, "."));
      const powerNum = parseFloat(p.power.replace(/,/g, ".")) * 1000;
      const efficiency = p.efficiency || (isNaN(hashrateNum) || isNaN(powerNum) || hashrateNum === 0 
        ? null 
        : Math.round(powerNum / hashrateNum));

      const imgHtml = p.imageUrl 
        ? \`<img src="\${p.imageUrl}" alt="\${p.manufacturer} \${p.model}" class="h-full w-full object-contain p-2 relative z-10 transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer">\`
        : getMinerVectorSvg(p.manufacturer, p.model);

      return \`
        <div id="widget-card-\${p.slug}" class="group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D3A76C]/5 cursor-pointer \${isCompared ? 'border-[#D3A76C] bg-zinc-900/80 ring-1 ring-[#D3A76C]/30' : 'border-zinc-800/80 bg-zinc-950/40 hover:border-[#D3A76C]/50 hover:bg-zinc-900/60'}" onclick="window.eviCatalogWidgetAction('\${p.slug}', event)">
          <div class="absolute -right-16 -top-16 -z-10 h-32 w-32 rounded-full bg-[#D3A76C]/5 blur-3xl transition-all duration-300 group-hover:bg-[#D3A76C]/10"></div>
          
          <div>
            <div class="mb-4 flex items-center justify-between gap-2">
              <span class="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-bold tracking-wider text-zinc-400 font-mono truncate">\${p.manufacturer.toUpperCase()}</span>
              <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                <button onclick="window.eviCatalogWidgetToggleCompare('\${p.slug}', event)" class="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase border cursor-pointer \${isCompared ? 'bg-[#D3A76C]/20 text-[#D3A76C] border-[#D3A76C]/40' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-300'}" style="outline: none;">
                  <span class="inline-block w-2 h-2 rounded-full \${isCompared ? 'bg-[#D3A76C]' : 'bg-zinc-700'}"></span>
                  <span>Сравнить</span>
                </button>
                <span class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 \${p.condition === 'New' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#D3A76C]/10 text-[#D3A76C] border border-[#D3A76C]/20'}">\${p.condition === 'New' ? 'Новый' : 'Б/У'}</span>
              </div>
            </div>

            <div class="mb-4 h-32 w-full flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900">
              \${imgHtml}
            </div>

            <h3 class="line-clamp-2 text-base font-extrabold tracking-tight text-white group-hover:text-[#D3A76C] transition-colors duration-300 uppercase">\${p.model}</h3>
            <p class="mt-1 text-[10px] font-mono text-zinc-650">ID: \${p.slug}</p>

            <div class="mt-4 grid grid-cols-2 gap-y-3 gap-x-2 border-t border-b border-zinc-900 py-4 text-xs">
              <div>
                <p class="text-[9px] text-zinc-500 uppercase font-mono">Хэшрейт</p>
                <p class="font-bold text-zinc-200">\${p.hashrate ? \`\${p.hashrate} TH\` : '—'}</p>
              </div>
              <div>
                <p class="text-[9px] text-zinc-500 uppercase font-mono">Мощность</p>
                <p class="font-bold text-zinc-200">\${p.power ? \`\${p.power} кВт\` : '—'}</p>
              </div>
              <div>
                <p class="text-[9px] text-zinc-500 uppercase font-mono">Алгоритм</p>
                <p class="font-bold text-zinc-200 truncate max-w-[90px]">\${p.algorithm || '—'}</p>
              </div>
              <div>
                <p class="text-[9px] text-zinc-500 uppercase font-mono">Энергоэфф.</p>
                <p class="font-bold text-zinc-200">\${efficiency ? \`\${efficiency} J/T\` : '—'}</p>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3">
            <div class="mb-4 flex flex-col justify-end">
              \${isAvailable ? \`
                <p class="text-xl font-black text-white tracking-tight">\${p.priceRub}</p>
                <p class="text-xs font-semibold text-zinc-500 mt-0.5">\${p.priceUsd}</p>
              \` : \`
                <div class="flex items-center gap-1.5 py-1.5 text-zinc-500">
                  <span class="font-bold text-xs uppercase tracking-wider">Цена по запросу</span>
                </div>
              \`}
            </div>
            <button class="w-full rounded bg-zinc-900 border border-zinc-800 hover:border-[#D3A76C] hover:bg-[#D3A76C] hover:text-[#0F0D09] px-4 py-2.5 text-center text-xs font-bold text-zinc-300 transition-all duration-300 uppercase tracking-wider">Подробнее</button>
          </div>
        </div>
      \`;
    }).join("");
  }

  // Действие клика на карточку товара
  window.eviCatalogWidgetAction = function(slug, event) {
    // Предотвращаем срабатывание клика, если нажали на "Сравнить"
    if (event.target.closest("button") || event.target.closest("input")) return;
    navigateToProduct(slug);
  };

  // Действие сравнения
  window.eviCatalogWidgetToggleCompare = function(slug, event) {
    if (event) event.stopPropagation();
    
    const idx = comparedSlugs.indexOf(slug);
    if (idx > -1) {
      comparedSlugs.splice(idx, 1);
    } else {
      comparedSlugs.push(slug);
    }
    
    updateCompareBadge();
    filterAndRender();
  };

  // Обновление плашки сравнения
  function updateCompareBadge() {
    badgeCompareCount.textContent = comparedSlugs.length;
    if (comparedSlugs.length > 0) {
      btnCompareTrigger.classList.remove("hidden");
    } else {
      btnCompareTrigger.classList.add("hidden");
    }
  }

  // Открытие модалки сравнения
  function openCompareModal() {
    const productsToCompare = allProducts.filter(p => comparedSlugs.includes(p.slug));
    if (productsToCompare.length === 0) return;

    let html = \`
      <table class="w-full min-w-[600px] border-collapse text-left text-xs text-zinc-300">
        <thead>
          <tr class="border-b border-zinc-900 bg-zinc-950">
            <th class="p-4 font-mono font-bold uppercase text-zinc-500">Характеристика</th>
            \${productsToCompare.map(p => \`
              <th class="p-4 font-extrabold text-white uppercase tracking-wider font-mono">
                \${p.manufacturer} <span class="text-[#D3A76C]">\${p.model}</span>
              </th>
            \`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-900 bg-zinc-950/40">
          <tr>
            <td class="p-4 font-medium text-zinc-400">Стоимость RUB</td>
            \${productsToCompare.map(p => \`<td class="p-4 font-extrabold text-white">\${p.priceRub || 'По запросу'}</td>\`).join("")}
          </tr>
          <tr>
            <td class="p-4 font-medium text-zinc-400">Стоимость USD</td>
            \${productsToCompare.map(p => \`<td class="p-4 font-semibold text-zinc-400">\${p.priceUsd || 'По запросу'}</td>\`).join("")}
          </tr>
          <tr>
            <td class="p-4 font-medium text-zinc-400">Хэшрейт</td>
            \${productsToCompare.map(p => \`<td class="p-4 font-bold text-[#D3A76C]">\${p.hashrate ? p.hashrate + ' TH' : '—'}</td>\`).join("")}
          </tr>
          <tr>
            <td class="p-4 font-medium text-zinc-400">Потребление</td>
            \${productsToCompare.map(p => \`<td class="p-4 text-emerald-400 font-bold">\${p.power ? p.power + ' кВт' : '—'}</td>\`).join("")}
          </tr>
          <tr>
            <td class="p-4 font-medium text-zinc-400">Алгоритм</td>
            \${productsToCompare.map(p => \`<td class="p-4 font-mono text-zinc-300">\${p.algorithm || '—'}</td>\`).join("")}
          </tr>
          <tr>
            <td class="p-4 font-medium text-zinc-400">Состояние</td>
            \${productsToCompare.map(p => \`<td class="p-4 font-bold uppercase">\${p.condition === 'New' ? 'Новый' : 'Б/У'}</td>\`).join("")}
          </tr>
          <tr>
            <td class="p-4 font-medium text-zinc-400">Окупаемость</td>
            \${productsToCompare.map(p => \`<td class="p-4 font-bold text-white">\${p.payback ? p.payback + ' мес.' : '—'}</td>\`).join("")}
          </tr>
        </tbody>
      </table>
    \`;

    elCompareTable.innerHTML = html;
    modalCompare.classList.remove("hidden");
  }

  function closeCompareModal() {
    modalCompare.classList.add("hidden");
  }

})();
</script>
</div>`;

  const handleCopyYml = () => {
    navigator.clipboard.writeText(ymlUrl);
    setCopiedYml(true);
    setTimeout(() => setCopiedYml(false), 2000);
  };

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(widgetEmbedCode);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  return (
    <div id="tilda-integration-panel" className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-[#D3A76C]" />
          Интеграция каталога с платформой Tilda Publishing
        </h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Синхронизируйте товары, характеристики и цены из вашей Google Таблицы напрямую в Tilda. Выберите наиболее подходящий способ интеграции:
        </p>
      </div>

      {/* 3 Columns for integration types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Method 1: YML Auto Sync */}
        <div className="rounded-xl border border-[#D3A76C]/30 bg-[#D3A76C]/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D3A76C]/20 text-xs font-bold text-[#D3A76C]">
                1
              </span>
              <h3 className="text-base font-bold text-white">Автосинхронизация по YML</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong>Рекомендуется!</strong> Tilda автоматически скачивает каталог каждые несколько часов по нашему XML/YML адресу. Цены в Tilda будут обновляться сами без вашего участия.
            </p>
            <div className="mt-4 rounded bg-zinc-950 p-3 border border-zinc-900">
              <p className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 font-bold">Адрес YML фида</p>
              <input 
                type="text" 
                readOnly 
                value={ymlUrl} 
                className="mt-1 w-full bg-transparent text-xs font-mono text-[#D3A76C] focus:outline-none truncate font-bold"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button 
              id="btn-copy-yml"
              onClick={handleCopyYml}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#D3A76C] hover:bg-[#E7C08B] hover:text-[#0F0D09] px-4 py-2.5 text-xs font-bold text-[#0F0D09] transition-all cursor-pointer uppercase tracking-wider"
            >
              {copiedYml ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Ссылка скопирована!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Скопировать YML ссылку
                </>
              )}
            </button>
            <a 
              href="https://help-ru.tilda.cc/catalog/yml" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              Инструкция Tilda YML <ArrowUpRight className="h-3 w-3 text-[#D3A76C]" />
            </a>
          </div>
        </div>

        {/* Method 2: CSV Import */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-zinc-400 border border-zinc-850">
                2
              </span>
              <h3 className="text-base font-bold text-white">Разовый CSV Импорт</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Позволяет быстро загрузить все товары в каталог Tilda за один клик. Идеально подходит для первичного наполнения интернет-магазина. Скачайте файл и загрузите его в каталог Tilda Catalog.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <a 
              id="btn-download-csv"
              href={csvUrl}
              download="tilda_catalog.csv"
              className="flex w-full items-center justify-center gap-2 rounded bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer border border-zinc-800 uppercase tracking-wider"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              Скачать каталог CSV
            </a>
            <a 
              href="https://help-ru.tilda.cc/catalog/import-export" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              Инструкция Tilda CSV <ArrowUpRight className="h-3 w-3 text-[#D3A76C]" />
            </a>
          </div>
        </div>

        {/* Method 3: Live Widget */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-zinc-400 border border-zinc-850">
                3
              </span>
              <h3 className="text-base font-bold text-white">Интерактивный виджет</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Встройте этот красивый интерактивный каталог с поиском, фильтрами и карточками прямо на вашу страницу Tilda с помощью HTML-блока <strong>T123</strong>. Цены обновляются в реальном времени!
            </p>
          </div>

          <div className="mt-6">
            <button 
              id="btn-copy-widget"
              onClick={handleCopyWidget}
              className="flex w-full items-center justify-center gap-2 rounded bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-200 transition-all cursor-pointer border border-zinc-800 uppercase tracking-wider"
            >
              {copiedWidget ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Код скопирован!
                </>
              ) : (
                <>
                  <Code className="h-3.5 w-3.5 text-zinc-500" />
                  Скопировать HTML-код
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Integration Guide Box */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4 font-mono uppercase tracking-wider">
          <HelpCircle className="h-4 w-4 text-[#D3A76C]" />
          Пошаговое руководство по настройке YML-синхронизации (Рекомендуется)
        </h3>
        
        <ol className="text-xs text-zinc-300 space-y-3 pl-4 list-decimal leading-relaxed">
          <li>
            Откройте ваш проект на Tilda и перейдите во вкладку <span className="font-semibold text-white">"Магазин" (Tilda Каталог)</span>.
          </li>
          <li>
            В левом боковом меню выберите пункт <span className="font-semibold text-white">"Управление товарами"</span> и далее нажмите <span className="font-semibold text-white">"Импорт / Экспорт"</span> или нажмите шестеренку настроек каталога.
          </li>
          <li>
            Найдите раздел <span className="font-semibold text-white">"Автоматический импорт (по ссылке)"</span>.
          </li>
          <li>
            Вставьте скопированную ссылку на наш <span className="text-[#D3A76C] font-mono font-semibold">YML фид</span> в поле URL.
          </li>
          <li>
            Установите периодичность обновления (например, каждые 12 или 24 часа). Tilda будет опрашивать наш сервер, который мгновенно загружает свежие цены из вашей Google Таблицы.
          </li>
          <li>
            Нажмите <span className="font-semibold text-white">"Сохранить"</span>. Готово! Все товары теперь автоматически поддерживают актуальность цен!
          </li>
        </ol>
      </div>
    </div>
  );
};
