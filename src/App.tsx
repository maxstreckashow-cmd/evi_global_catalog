import React, { useEffect, useState, useMemo } from "react";
import { Product, FilterState, SeoOverride } from "./types";
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
import { AdminSeoManager } from "./components/AdminSeoManager";
import { AdminBackupManager } from "./components/AdminBackupManager";
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
  DollarSign,
  Globe
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

function getCoinsForAlgorithm(algorithm: string): string {
  const algo = (algorithm || "").toLowerCase();
  if (algo.includes("scrypt")) return "Litecoin";
  if (algo.includes("sha-256") || algo.includes("sha256")) return "Bitcoin";
  if (algo.includes("kheavyhash") || algo.includes("kaspa")) return "Kaspa";
  if (algo.includes("blake3")) return "Alephium";
  if (algo.includes("kadena")) return "Kadena";
  if (algo.includes("eaglesong")) return "Nervos";
  if (algo.includes("handshake")) return "Handshake";
  if (algo.includes("equihash")) return "Zcash";
  if (algo.includes("x11")) return "Dash";
  if (algo.includes("etchash") || algo.includes("ethash")) return "Ethereum Classic";
  return "";
}

function generateDefaultSeo(product: Product) {
  const hashrate = product.hashrate || "";
  const model = product.model || "";
  const algo = product.algorithm || "";
  const coin = getCoinsForAlgorithm(algo);
  const mfr = product.manufacturer || "";

  const coinStr = coin ? `${coin}. ` : "";

  const title = `${model} ${hashrate}. ASIC-устройство. ${algo}`;
  const description = `${model} ${hashrate}. ASIC-устройство. ${algo}. ${coinStr}${mfr}. EVI Global Group`;

  const kws = ["EVI Global Group", "майнинг", "устройство", "майнер", "ASIC"];
  if (hashrate) {
    const cleanHashForKw = hashrate.replace(/\s+/g, "").replace(/\//g, "");
    kws.push(cleanHashForKw);
    if (hashrate.includes(" ")) {
      kws.push(hashrate);
    }
  }
  if (algo) {
    kws.push(algo);
  }
  if (coin) {
    kws.push(coin);
  }
  if (mfr) {
    kws.push(mfr);
  }
  const modelParts = model.trim().split(/\s+/);
  if (modelParts.length > 0) {
    modelParts.forEach((part) => {
      if (part && !kws.includes(part)) {
        kws.push(part);
      }
    });
  }

  const keywords = kws.join(", ");

  return { title, description, keywords };
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Detect if URL is for admin/editor
  const [isAdmin, setIsAdmin] = useState<boolean>(
    window.location.pathname === "/admin" || window.location.pathname === "/editor" || window.location.search.includes("admin=true")
  );
  
  const [adminTab, setAdminTab] = useState<"tilda" | "images" | "logos" | "parser" | "catalog_preview" | "prices" | "seo" | "backup">("tilda");
  const [syncTime, setSyncTime] = useState<string>("");

  // Client pages state
  const [activePage, setActivePage] = useState<"catalog" | "about" | "legal" | "contacts">("catalog");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [comparedSlugs, setComparedSlugs] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [seoOverrides, setSeoOverrides] = useState<Record<string, SeoOverride>>({});
  
  const [hasBrowserBackup, setHasBrowserBackup] = useState<boolean>(false);
  const [isServerReset, setIsServerReset] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      try {
        const backup = localStorage.getItem("evi_catalog_backup");
        if (backup) {
          setHasBrowserBackup(true);
          // Check if server is currently default
          fetch("/api/admin/backup/export")
            .then(res => res.json())
            .then(data => {
              const hasCustomLogo = data.site_config?.customLogoUrl && data.site_config.customLogoUrl !== "/logo.png";
              const hasCustomImages = data.product_images && Object.keys(data.product_images).length > 0;
              const hasCorrections = data.price_corrections && Object.keys(data.price_corrections).length > 0;
              const hasSeo = data.seo_overrides && Object.keys(data.seo_overrides).length > 0;
              
              if (!hasCustomLogo && !hasCustomImages && !hasCorrections && !hasSeo) {
                setIsServerReset(true);
              } else {
                setIsServerReset(false);
              }
            })
            .catch(err => console.error("Error checking backup status:", err));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isAdmin, adminTab, logoUrl]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    manufacturer: "",
    condition: "",
    algorithm: "",
    hasPrice: false,
  });

  const handlePathRouting = (pathname: string, productList: Product[] = products) => {
    const pathIsAdmin = pathname === "/admin" || pathname === "/editor";
    setIsAdmin(pathIsAdmin);

    if (pathname === "/about") {
      setActivePage("about");
      setSelectedProduct(null);
    } else if (pathname === "/legal") {
      setActivePage("legal");
      setSelectedProduct(null);
    } else if (pathname === "/contacts") {
      setActivePage("contacts");
      setSelectedProduct(null);
    } else {
      const match = pathname.match(/^\/product\/([^/]+)$/);
      if (match) {
        const slug = decodeURIComponent(match[1]);
        if (productList.length > 0) {
          const found = productList.find((p) => p.slug === slug);
          if (found) {
            setSelectedProduct(found);
            return;
          }
        }
      }
      setSelectedProduct(null);
      setActivePage("catalog");
    }
  };

  const handleNavigatePage = (page: "catalog" | "about" | "legal" | "contacts") => {
    setActivePage(page);
    setSelectedProduct(null);
    window.history.pushState(null, "", page === "catalog" ? "/" : `/${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      handlePathRouting(window.location.pathname, data);
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

  const loadSeoOverrides = async () => {
    try {
      const res = await fetch("/api/seo-overrides");
      if (res.ok) {
        const data = await res.json();
        setSeoOverrides(data || {});
      }
    } catch (e) {
      console.error("Error loading SEO overrides:", e);
    }
  };

  const handleRestoreFromBanner = async () => {
    try {
      const backup = localStorage.getItem("evi_catalog_backup");
      if (!backup) return;
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: backup,
      });
      if (res.ok) {
        setIsServerReset(false);
        loadData(true);
        loadLogoConfig();
        loadSeoOverrides();
        alert("Все настройки успешно восстановлены!");
      }
    } catch (e) {
      console.error(e);
      alert("Не удалось восстановить настройки.");
    }
  };

  // Load products and handle deep-linked URLs
  useEffect(() => {
    loadData();
    loadLogoConfig();
    loadSeoOverrides();

    // Support browser Back/Forward routing
    const handlePopState = () => {
      handlePathRouting(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Dynamically update document head when selected product or SEO overrides change
  useEffect(() => {
    if (selectedProduct) {
      const override = seoOverrides[selectedProduct.slug] || {};
      const defaultSeo = generateDefaultSeo(selectedProduct);
      const title = override.title || defaultSeo.title;
      const desc = override.description || defaultSeo.description;
      const keywords = override.keywords || defaultSeo.keywords;

      // Update client-side head
      document.title = title;

      // Update canonical link
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', `https://catalog.evi-global.com/product/${selectedProduct.slug}`);
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', desc);

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);

      // Update og:title
      let metaOgTitle = document.querySelector('meta[property="og:title"]');
      if (!metaOgTitle) {
        metaOgTitle = document.createElement('meta');
        metaOgTitle.setAttribute('property', 'og:title');
        document.head.appendChild(metaOgTitle);
      }
      metaOgTitle.setAttribute('content', override.ogTitle || title);

      // Update og:description
      let metaOgDesc = document.querySelector('meta[property="og:description"]');
      if (!metaOgDesc) {
        metaOgDesc = document.createElement('meta');
        metaOgDesc.setAttribute('property', 'og:description');
        document.head.appendChild(metaOgDesc);
      }
      metaOgDesc.setAttribute('content', override.ogDescription || desc);

      // Update og:image
      const ogImg = override.ogImage || selectedProduct.imageUrl;
      if (ogImg) {
        let metaOgImg = document.querySelector('meta[property="og:image"]');
        if (!metaOgImg) {
          metaOgImg = document.createElement('meta');
          metaOgImg.setAttribute('property', 'og:image');
          document.head.appendChild(metaOgImg);
        }
        metaOgImg.setAttribute('content', ogImg);
      }
    } else {
      // Default general title
      document.title = "Каталог ASIC-майнеров | Цены на асики в наличии и под заказ | EVI Global Group";

      // Reset canonical link
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', 'https://catalog.evi-global.com/');
    }
  }, [selectedProduct, seoOverrides]);

  // Update selected product when catalog list updates (if popstate happens before products load)
  useEffect(() => {
    if (products.length > 0) {
      handlePathRouting(window.location.pathname, products);
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

          {/* Server Reset Detected banner */}
          {hasBrowserBackup && isServerReset && (
            <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-white uppercase tracking-wider font-mono mr-2">Обнаружен сброс сервера!</span>
                  Поскольку хостинг Render стирает файлы при перезапуске, ваши настройки сбросились. Но в вашем браузере сохранена автокопия!
                </div>
              </div>
              <button
                onClick={handleRestoreFromBanner}
                className="rounded bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Восстановить в 1 клик
              </button>
            </div>
          )}

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
              onClick={() => setAdminTab("seo")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "seo"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <Globe className="h-4 w-4" />
              Управление SEO-тегами
            </button>
            <button
              onClick={() => setAdminTab("backup")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                adminTab === "backup"
                  ? "border-[#D3A76C] text-[#D3A76C]"
                  : "border-transparent text-zinc-400 hover:border-zinc-800 hover:text-white"
              }`}
            >
              <Database className="h-4 w-4" />
              Бэкап и сохранность настроек
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
          ) : adminTab === "seo" ? (
            <AdminSeoManager products={products} onRefreshSeo={loadSeoOverrides} />
          ) : adminTab === "backup" ? (
            <AdminBackupManager 
              onRestoreComplete={() => {
                loadData(true);
                loadLogoConfig();
                loadSeoOverrides();
              }} 
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
              <a 
                href="/" 
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleNavigatePage("catalog");
                    setMobileMenuOpen(false);
                  }
                }}
                className="cursor-pointer block"
                title="На главную"
              >
                <EviLogo logoUrl={logoUrl} height={44} />
              </a>

              {/* Desktop Menu links as on evi-global.com */}
              <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-[11px] lg:text-xs font-bold uppercase tracking-wider">
                <a
                  href="/"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("catalog");
                    }
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "catalog" && !selectedProduct
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  Оборудование
                </a>
                <a
                  href="/about"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("about");
                    }
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "about"
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  О компании
                </a>
                <a
                  href="/legal"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("legal");
                    }
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "legal"
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  Правовая информация
                </a>
                <a
                  href="/contacts"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("contacts");
                    }
                  }}
                  className={`px-3 py-2 rounded transition-all cursor-pointer ${
                    activePage === "contacts"
                      ? "text-[#D3A76C] bg-[#D3A76C]/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  Контакты
                </a>
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
                <a
                  href="/"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("catalog");
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "catalog" && !selectedProduct
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  Оборудование (Каталог)
                </a>
                <a
                  href="/about"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("about");
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "about"
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  О компании
                </a>
                <a
                  href="/legal"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("legal");
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "legal"
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  Правовая информация
                </a>
                <a
                  href="/contacts"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigatePage("contacts");
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    activePage === "contacts"
                      ? "text-[#D3A76C] bg-[#D3A76C]/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  Контакты
                </a>
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

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-semibold">
              <a
                href="/legal"
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleNavigatePage("legal");
                  }
                }}
                className="hover:text-[#D3A76C] transition-colors cursor-pointer"
              >
                Политика конфиденциальности
              </a>
              <span>•</span>
              <a
                href="/legal"
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleNavigatePage("legal");
                  }
                }}
                className="hover:text-[#D3A76C] transition-colors cursor-pointer"
              >
                Пользовательское соглашение
              </a>
              <span>•</span>
              <a
                href="/contacts"
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    handleNavigatePage("contacts");
                  }
                }}
                className="hover:text-[#D3A76C] transition-colors cursor-pointer"
              >
                Контакты
              </a>
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

