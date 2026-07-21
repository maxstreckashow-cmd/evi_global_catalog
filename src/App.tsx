import React, { useEffect, useState, useMemo } from "react";
import { Product, FilterState } from "./types";
import { SidebarFilters } from "./components/SidebarFilters";
import { ProductCard } from "./components/ProductCard";
import { ProductDetails } from "./components/ProductDetails";
import { TildaIntegration } from "./components/TildaIntegration";
import { ProductImageManager } from "./components/ProductImageManager";
import { ProductSpecsParser } from "./components/ProductSpecsParser";
import { CompareModal } from "./components/CompareModal";
import { EviLogo } from "./components/EviLogo";
import { AdminLogoManager } from "./components/AdminLogoManager";
import { ProductPriceManager } from "./components/ProductPriceManager";
import { AboutUs } from "./components/AboutUs";
import { LegalDocs } from "./components/LegalDocs";
import { ContactsView } from "./components/ContactsView";
import { 
  Database, 
  Table, 
  HelpCircle, 
  FileSpreadsheet, 
  RefreshCw, 
  Layers, 
  Image as ImageIcon, 
  ShieldAlert, 
  ArrowUpRight,
  Eye,
  Scale,
  Cpu,
  Menu,
  X,
  ExternalLink,
  DollarSign
} from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        openLink: (url: string) => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
      };
    };
  }
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Detect if URL is for admin/editor
  const [isAdmin, setIsAdmin] = useState<boolean>(
    window.location.pathname === "/admin" || window.location.pathname === "/editor" || window.location.search.includes("admin=true")
  );
  
  const [adminTab, setAdminTab] = useState<"tilda" | "images" | "logos" | "parser" | "catalog_preview" | "prices">("tilda");
  const [syncTime, setSyncTime] = useState<string>("");

  // Client pages state
  const [activePage, setActivePage] = useState<"catalog" | "about" | "legal" | "contacts">("catalog");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [comparedSlugs, setComparedSlugs] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    manufacturer: "",
    condition: "",
    algorithm: "",
    hasPrice: false,
  });

  // Telegram WebApp Integration
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      try {
        // Set match background colors to keep the premium dark theme
        tg.setHeaderColor("#0F0D09");
        tg.setBackgroundColor("#0F0D09");
      } catch (err) {
        console.warn("Could not set Telegram header/background colors:", err);
      }
    }
  }, []);

  // Telegram BackButton management
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const backButton = tg.BackButton;

      const hasActiveModalOrProductOrTab = selectedProduct !== null || isCompareModalOpen || activePage !== "catalog";

      if (hasActiveModalOrProductOrTab) {
        backButton.show();
        
        const handleBackClick = () => {
          if (isCompareModalOpen) {
            setIsCompareModalOpen(false);
          } else if (selectedProduct) {
            handleSelectProduct(null);
          } else if (activePage !== "catalog") {
            setActivePage("catalog");
          }
        };

        backButton.onClick(handleBackClick);
        return () => {
          backButton.offClick(handleBackClick);
          backButton.hide();
        };
      } else {
        backButton.hide();
      }
    }
  }, [selectedProduct, isCompareModalOpen, activePage]);

  // Toggle comparison state for a product
  const handleToggleCompare = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparedSlugs((prev) => {
      if (prev.includes(product.slug)) {
        return prev.filter((s) => s !== product.slug);
      } else {
        return [...prev, product.slug];
      }
    });
  };

  const handleRemoveCompared = (slug: string) => {
    setComparedSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const handleClearCompared = () => {
    setComparedSlugs([]);
  };

  const comparedProducts = useMemo(() => {
    return products.filter((p) => comparedSlugs.includes(p.slug));
  }, [products, comparedSlugs]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data: Product[] = await res.json();
      setProducts(data);
      setSyncTime(new Date().toLocaleTimeString());

      // Parse path for initial load
      const path = window.location.pathname;
      const match = path.match(/^\/product\/([^/]+)$/);
      if (match) {
        const slug = decodeURIComponent(match[1]);
        const found = data.find((p) => p.slug === slug);
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadLogoConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data && data.customLogoUrl) {
        setLogoUrl(data.customLogoUrl);
      }
    } catch (e) {
      console.error("Error loading logo config:", e);
    }
  };

  // Load products and handle deep-linked product URLs
  useEffect(() => {
    loadData();
    loadLogoConfig();

    // Support browser Back/Forward routing
    const handlePopState = () => {
      const path = window.location.pathname;
      const pathIsAdmin = path === "/admin" || path === "/editor";
      setIsAdmin(pathIsAdmin);

      const match = path.match(/^\/product\/([^/]+)$/);
      if (match) {
        const slug = decodeURIComponent(match[1]);
        const found = products.find((p) => p.slug === slug);
        if (found) {
          setSelectedProduct(found);
        }
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update selected product when catalog list updates (if popstate happens before products load)
  useEffect(() => {
    if (products.length > 0) {
      const path = window.location.pathname;
      const match = path.match(/^\/product\/([^/]+)$/);
      if (match) {
        const slug = decodeURIComponent(match[1]);
        const found = products.find((p) => p.slug === slug);
        if (found) {
          setSelectedProduct(found);
        }
      }
    }
  }, [products]);

  // Navigate to product with HTML5 history update (clean URLs without hash!)
  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      window.history.pushState(null, "", `/product/${product.slug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.history.pushState(null, "", isAdmin ? "/admin" : "/");
    }
  };

  // Switch between Client & Admin Mode
  const handleNavigateAdmin = (toAdmin: boolean) => {
    setIsAdmin(toAdmin);
    setSelectedProduct(null);
    window.history.pushState(null, "", toAdmin ? "/admin" : "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // State callback when an image is saved in the Manager
  const handleUpdateProductImage = (slug: string, imageUrl: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, imageUrl } : p))
    );
  };

  // Extract unique filters from loaded products list
  const uniqueManufacturers = useMemo(() => {
    const list = products.map((p) => p.manufacturer).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [products]);

  const uniqueAlgorithms = useMemo(() => {
    const list = products.map((p) => p.algorithm).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [products]);

  // Client-side instant filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesMfr = p.manufacturer.toLowerCase().includes(term);
        const matchesModel = p.model.toLowerCase().includes(term);
        const matchesSlug = p.slug.toLowerCase().includes(term);
        if (!matchesMfr && !matchesModel && !matchesSlug) return false;
      }

      if (filters.manufacturer && p.manufacturer !== filters.manufacturer) {
        return false;
      }

      if (filters.condition && p.condition.toLowerCase() !== filters.condition.toLowerCase()) {
        return false;
      }

      if (filters.algorithm && p.algorithm !== filters.algorithm) {
        return false;
      }

      if (filters.hasPrice && p.priceRubNumeric <= 0) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  // Manual Trigger to re-fetch from google sheet bypassing local caches (Admin only)
  const handleForceRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?force=true");
      const data = await res.json();
      setProducts(data);
      setSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-app-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* ========================================= */}
      {/* 1. ADMIN / EDITOR INTERFACE               */}
      {/* ========================================= */}
      {isAdmin ? (
        <div id="admin-panel" className="space-y-6">
          <header className="mb-6 border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 items-center justify-center rounded bg-[#D3A76C]/10 px-2 text-[9px] uppercase font-bold tracking-widest text-[#D3A76C] border border-[#D3A76C]/20 font-mono">
                  Панель Редактора
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 font-mono">
                  EVI Global Group
                </span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight mt-1 uppercase">
                Управление Каталогом и Интеграциями
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Добавляйте изображения к товарам, генерируйте YML-экспорт для Tilda и управляйте кэшем из Google Sheets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a 
                href="https://docs.google.com/spreadsheets/d/12TtXAVyKBj1yGnO8Zbw8UcCPB-ks0nJ-ONN5pZmH3vg/edit?gid=52943044#gid=52943044" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#D3A76C]" />
                <span>Google Таблица</span>
              </a>

              <button 
                onClick={handleForceRefresh}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-300 transition-all hover:text-white cursor-pointer disabled:opacity-50"
                title="Обновить данные из таблицы"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#D3A76C]' : ''}`} />
              </button>

              <button
                onClick={() => handleNavigateAdmin(false)}
                className="flex items-center gap-1 rounded bg-[#D3A76C] hover:bg-[#E7C08B] hover:text-[#0F0D09] px-4 py-2 text-xs font-bold text-[#0F0D09] transition-all cursor-pointer uppercase tracking-wider"
              >
                <span>Клиентский виджет</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* Admin Tabs */}
          <div className="mb-6 flex border-b border-zinc-900 overflow-x-auto">
            <button
              onClick={() => setAdminTab("tilda")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "tilda"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              Интеграция с Tilda
            </button>
            <button
              onClick={() => setAdminTab("images")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "images"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Добавление Изображений
            </button>
            <button
              onClick={() => setAdminTab("logos")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "logos"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <ImageIcon className="h-4 w-4 text-[#D3A76C]" />
              Менеджер логотипов
            </button>
            <button
              onClick={() => setAdminTab("parser")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "parser"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <Cpu className="h-4 w-4" />
              Скрипт-Парсер AI
            </button>
            <button
              onClick={() => setAdminTab("prices")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "prices"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Управление товарами и ценами
            </button>
            <button
              onClick={() => setAdminTab("catalog_preview")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "catalog_preview"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <Eye className="h-4 w-4" />
              Просмотр каталога разработчиком
            </button>
          </div>

          {/* Main Admin Contents */}
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="h-10 w-10 text-[#D3A76C] animate-spin" />
              <p className="mt-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Синхронизация с таблицей...
              </p>
            </div>
          ) : adminTab === "tilda" ? (
            <TildaIntegration />
          ) : adminTab === "images" ? (
            <ProductImageManager 
              products={products} 
              onUpdateProductImage={handleUpdateProductImage} 
            />
          ) : adminTab === "logos" ? (
            <AdminLogoManager 
              activeLogoUrl={logoUrl}
              onLogoUpdated={(url) => setLogoUrl(url)}
            />
          ) : adminTab === "parser" ? (
            <ProductSpecsParser 
              products={products} 
              onRefreshProducts={() => loadData(true)} 
            />
          ) : adminTab === "prices" ? (
            <ProductPriceManager 
              products={products} 
              onRefreshProducts={handleForceRefresh} 
            />
          ) : (
            <div>
              <div className="mb-4 rounded border border-[#D3A76C]/20 bg-[#D3A76C]/5 p-4 text-xs text-zinc-300 flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#D3A76C] font-mono mr-2">Режим превью:</span>
                  Так выглядит каталог в виджете клиента, но с сохранением панели управления выше.
                </div>
                <div className="font-mono text-[10px] text-zinc-400">
                  Всего товаров: {products.length} (Обновлено в {syncTime})
                </div>
              </div>
              
              {/* Client Content Preview */}
              {selectedProduct ? (
                <ProductDetails 
                  product={selectedProduct} 
                  onBack={() => handleSelectProduct(null)} 
                  isAdmin={true}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <SidebarFilters
                      filters={filters}
                      onChange={setFilters}
                      manufacturers={uniqueManufacturers}
                      algorithms={uniqueAlgorithms}
                      totalCount={products.length}
                      filteredCount={filteredProducts.length}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <div id="product-grid-admin" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.slug}
                          product={p}
                          onSelect={handleSelectProduct}
                          isCompared={comparedSlugs.includes(p.slug)}
                          onToggleCompare={handleToggleCompare}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        
        // ========================================= //
        // 2. CLIENT WIDGET (CLEAN CATALOG ONLY)      //
        // ========================================= //
        <div id="client-widget" className="space-y-6">
          {/* ========================================= */}
          {/* PREMIUM TOP HEADER NAVIGATION MENU        */}
          {/* ========================================= */}
          <header className="mb-8 border-b border-zinc-950 pb-5">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div 
                className="cursor-pointer" 
                onClick={() => {
                  handleSelectProduct(null);
                  setActivePage("catalog");
                  setMobileMenuOpen(false);
                }} 
                title="На главную"
              >
                <EviLogo logoUrl={logoUrl} height={44} />
              </div>

              {/* Desktop Menu links as on evi-global.com */}
              <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-[11px] lg:text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("catalog");
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "catalog" && !selectedProduct
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  Оборудование
                </button>
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("about");
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "about"
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  О компании
                </button>
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("legal");
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "legal"
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  Правовая информация
                </button>
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("contacts");
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "contacts"
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  Контакты
                </button>
                <a
                  href="https://evi-global.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded text-zinc-500 hover:text-[#D3A76C] hover:bg-zinc-900/30 transition-all font-semibold"
                >
                  <span>evi-global.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </nav>

              {/* Mobile hamburger menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded border border-zinc-900 bg-zinc-950 text-zinc-300 hover:text-white transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-zinc-950/60 flex flex-col gap-1.5 animate-slide-down">
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("catalog");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "catalog" && !selectedProduct
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  Оборудование (Каталог)
                </button>
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("about");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "about"
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  О компании
                </button>
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("legal");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "legal"
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  Правовая информация
                </button>
                <button
                  onClick={() => {
                    handleSelectProduct(null);
                    setActivePage("contacts");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "contacts"
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  Контакты
                </button>
                <a
                  href="https://evi-global.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-[#D3A76C] hover:bg-zinc-900/20"
                >
                  <span>Наш сайт evi-global.com</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </header>

          {/* ========================================= */}
          {/* CLIENT CONTENT VIEWS SWITCH               */}
          {/* ========================================= */}
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <RefreshCw className="h-8 w-8 text-[#D3A76C] animate-spin" />
              <p className="mt-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Загрузка каталога...
              </p>
            </div>
          ) : selectedProduct ? (
            <ProductDetails 
              product={selectedProduct} 
              onBack={() => handleSelectProduct(null)} 
              isAdmin={false}
            />
          ) : activePage === "about" ? (
            <AboutUs />
          ) : activePage === "legal" ? (
            <LegalDocs />
          ) : activePage === "contacts" ? (
            <ContactsView />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <SidebarFilters
                  filters={filters}
                  onChange={setFilters}
                  manufacturers={uniqueManufacturers}
                  algorithms={uniqueAlgorithms}
                  totalCount={products.length}
                  filteredCount={filteredProducts.length}
                />
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-3">
                {filteredProducts.length === 0 ? (
                  <div className="rounded border border-dashed border-zinc-850 py-16 text-center">
                    <HelpCircle className="mx-auto h-10 w-10 text-zinc-600" />
                    <h3 className="mt-4 text-sm font-semibold text-zinc-300">Ничего не найдено</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Попробуйте изменить параметры поиска или сбросить фильтры.
                    </p>
                  </div>
                ) : (
                  <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.slug}
                        product={p}
                        onSelect={handleSelectProduct}
                        isCompared={comparedSlugs.includes(p.slug)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* CLIENT WIDGET FOOTER                       */}
          {/* ========================================= */}
          <footer className="mt-16 pt-6 border-t border-zinc-950/40 text-center flex flex-col md:flex-row items-center justify-between text-[11px] text-zinc-600 gap-4">
            <div>
              &copy; {new Date().getFullYear()} АО «ЭВИ ГЛОБАЛ ГРУПП». Все права защищены.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <button
                onClick={() => {
                  handleSelectProduct(null);
                  setActivePage("legal");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Политика конфиденциальности
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  handleSelectProduct(null);
                  setActivePage("legal");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Пользовательское соглашение
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  handleSelectProduct(null);
                  setActivePage("contacts");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Контакты
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* Floating comparison status bar */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 rounded-full border border-[#D3A76C]/30 bg-zinc-950/90 backdrop-blur-md px-5 py-3 shadow-2xl shadow-[#D3A76C]/10 transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D3A76C]/20 text-[#D3A76C] text-[10px] font-black font-mono border border-[#D3A76C]/30">
              {comparedProducts.length}
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider hidden sm:inline">
              {comparedProducts.length === 1 ? "выбран для сравнения" : "выбрано для сравнения"}
            </span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider sm:hidden">
              В сравнении
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="rounded-full bg-[#D3A76C] hover:bg-[#E7C08B] hover:text-[#0F0D09] px-4 py-2 text-xs font-black text-[#0F0D09] uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-lg"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Сравнить</span>
            </button>
            <button
              onClick={handleClearCompared}
              className="rounded-full border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <CompareModal
          selectedProducts={comparedProducts}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={handleRemoveCompared}
          onClearAll={handleClearCompared}
        />
      )}
    </div>
  );
}

