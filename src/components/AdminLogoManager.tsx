import React, { useState, useEffect } from "react";
import { Upload, Check, Trash2, Image as ImageIcon, RotateCcw, Monitor } from "lucide-react";

interface AdminLogoManagerProps {
  onLogoUpdated: (newLogoUrl: string) => void;
  activeLogoUrl: string;
}

export const AdminLogoManager: React.FC<AdminLogoManagerProps> = ({
  onLogoUpdated,
  activeLogoUrl,
}) => {
  const [allLogos, setAllLogos] = useState<string[]>(["/logo.png"]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Favicon Management States
  const [allFavicons, setAllFavicons] = useState<string[]>(["/favicon.ico"]);
  const [activeFaviconUrl, setActiveFaviconUrl] = useState<string>("/favicon.ico");
  const [uploadingFavicon, setUploadingFavicon] = useState<boolean>(false);
  const [faviconStatusMsg, setFaviconStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data.allLogos) {
        setAllLogos(data.allLogos);
      }
      if (data.customFaviconUrl) {
        setActiveFaviconUrl(data.customFaviconUrl);
      } else {
        setActiveFaviconUrl("/favicon.ico");
      }
      if (data.allFavicons) {
        setAllFavicons(data.allFavicons);
      }
    } catch (e) {
      console.error("Error fetching site config:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update favicon link tags in DOM dynamically so browser tab icon reloads immediately
  const updateClientFavicons = (url: string) => {
    const links = document.querySelectorAll("link[rel*='icon']");
    const cacheBuster = `?cb=${Date.now()}`;
    
    links.forEach((link) => {
      const linkEl = link as HTMLLinkElement;
      if (linkEl.href.includes("favicon-32x32")) {
        linkEl.href = `/favicon-32x32.png${cacheBuster}`;
      } else if (linkEl.href.includes("favicon.svg")) {
        linkEl.href = `/favicon.svg${cacheBuster}`;
      } else if (linkEl.href.includes("favicon.png")) {
        linkEl.href = `/favicon.png${cacheBuster}`;
      } else {
        linkEl.href = `/favicon.ico${cacheBuster}`;
      }
    });
  };

  const handleSelectLogo = async (logoUrl: string) => {
    setStatusMsg(null);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customLogoUrl: logoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onLogoUpdated(logoUrl);
        setStatusMsg({ type: "success", text: "Логотип успешно выбран в качестве активного!" });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "Не удалось переключить активный логотип." });
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Размер логотипа должен быть меньше 5 МБ.");
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const res = await fetch("/api/config/logo/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoData: base64data }),
        });
        const data = await res.json();
        if (data.success) {
          onLogoUpdated(base64data);
          setAllLogos(data.config.allLogos);
          setStatusMsg({ type: "success", text: "Логотип успешно загружен и установлен активным!" });
        }
      } catch (err) {
        console.error(err);
        setStatusMsg({ type: "error", text: "Не удалось загрузить новый логотип." });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = async (logoUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (logoUrl === "/logo.png") {
      alert("Нельзя удалить стандартный логотип.");
      return;
    }
    if (!confirm("Вы уверены, что хотите удалить этот логотип из библиотеки?")) return;

    setStatusMsg(null);
    try {
      const updatedLogos = allLogos.filter((l) => l !== logoUrl);
      const isDeletingActive = activeLogoUrl === logoUrl;
      const nextActiveUrl = isDeletingActive ? "/logo.png" : activeLogoUrl;

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customLogoUrl: nextActiveUrl,
          allLogos: updatedLogos,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAllLogos(updatedLogos);
        onLogoUpdated(nextActiveUrl);
        setStatusMsg({ type: "success", text: "Логотип удален из библиотеки!" });
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: "error", text: "Не удалось удалить логотип." });
    }
  };

  const handleResetToDefault = async () => {
    await handleSelectLogo("/logo.png");
  };

  // Favicon specific handlers
  const handleSelectFavicon = async (faviconUrl: string) => {
    setFaviconStatusMsg(null);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customFaviconUrl: faviconUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveFaviconUrl(faviconUrl);
        setFaviconStatusMsg({ type: "success", text: "Фавикон успешно выбран в качестве активного!" });
        updateClientFavicons(faviconUrl);
      }
    } catch (e) {
      console.error(e);
      setFaviconStatusMsg({ type: "error", text: "Не удалось переключить активный фавикон." });
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "ico"].includes(extension || "")) {
      alert("Пожалуйста, выберите файл в формате .jpg, .jpeg, .png или .ico.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Размер фавикона должен быть меньше 2 МБ.");
      return;
    }

    setUploadingFavicon(true);
    setFaviconStatusMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const res = await fetch("/api/config/favicon/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faviconData: base64data }),
        });
        const data = await res.json();
        if (data.success) {
          setActiveFaviconUrl(base64data);
          setAllFavicons(data.config.allFavicons || [base64data]);
          setFaviconStatusMsg({ type: "success", text: "Фавикон успешно загружен и применен во всех форматах!" });
          updateClientFavicons(base64data);
        } else {
          setFaviconStatusMsg({ type: "error", text: "Ошибка при конвертации фавикона на сервере." });
        }
      } catch (err) {
        console.error(err);
        setFaviconStatusMsg({ type: "error", text: "Не удалось загрузить новый фавикон." });
      } finally {
        setUploadingFavicon(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFavicon = async (faviconUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (faviconUrl === "/favicon.ico") {
      alert("Нельзя удалить стандартный фавикон.");
      return;
    }
    if (!confirm("Вы уверены, что хотите удалить этот фавикон из библиотеки?")) return;

    setFaviconStatusMsg(null);
    try {
      const updatedFavicons = allFavicons.filter((f) => f !== faviconUrl);
      const isDeletingActive = activeFaviconUrl === faviconUrl;
      const nextActiveUrl = isDeletingActive ? "/favicon.ico" : activeFaviconUrl;

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customFaviconUrl: nextActiveUrl,
          allFavicons: updatedFavicons,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAllFavicons(updatedFavicons);
        setActiveFaviconUrl(nextActiveUrl);
        setFaviconStatusMsg({ type: "success", text: "Фавикон удален из библиотеки!" });
        updateClientFavicons(nextActiveUrl);
      }
    } catch (error) {
      console.error(error);
      setFaviconStatusMsg({ type: "error", text: "Не удалось удалить фавикон." });
    }
  };

  const handleResetFaviconToDefault = async () => {
    await handleSelectFavicon("/favicon.ico");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D3A76C]" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. LOGO SECTION */}
      <div className="space-y-6">
        <div className="border-b border-zinc-900 pb-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Менеджер логотипов клиентского виджета
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Здесь вы можете загружать свои логотипы, которые будут мгновенно отображаться на главной странице клиентского каталога. Все логотипы сохраняются на сервере.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`rounded border p-4 text-xs ${
              statusMsg.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                : "border-rose-500/20 bg-rose-500/5 text-rose-400"
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Current Active Logo */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Текущий активный логотип
              </h3>
              <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-900 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#D3A76C0c_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>
                <img
                  src={activeLogoUrl}
                  alt="Active Logo"
                  className="max-h-[60px] max-w-full object-contain relative z-10"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-3 font-mono leading-relaxed truncate">
                {activeLogoUrl.startsWith("data:") ? "Пользовательское изображение (Base64)" : `Путь: ${activeLogoUrl}`}
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleResetToDefault}
                disabled={activeLogoUrl === "/logo.png"}
                className="flex w-full items-center justify-center gap-2 rounded border border-zinc-850 bg-zinc-900/45 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-bold text-zinc-300 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-[#D3A76C]" />
                Сбросить на стандартный
              </button>
            </div>
          </div>

          {/* Middle Column: Upload New Logo */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Загрузить новый логотип
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Поддерживаются файлы PNG, JPEG, SVG размером до 5 МБ. Для наилучшего отображения используйте горизонтальные логотипы с прозрачным фоном.
              </p>
              
              <label className="relative flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-[#D3A76C] bg-zinc-950/20 hover:bg-zinc-900/10 rounded-lg p-6 transition-all cursor-pointer group">
                <Upload className="h-8 w-8 text-zinc-500 group-hover:text-[#D3A76C] transition-colors mb-2" />
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                  {uploading ? "Загрузка..." : "Выбрать файл логотипа"}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 font-mono">или перетащите его сюда</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <div className="mt-6 text-[10px] text-zinc-500 font-mono text-center">
              Размер логотипа автоматически оптимизируется под пропорции виджета.
            </div>
          </div>

          {/* Right Column: Library list of logos */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Библиотека логотипов ({allLogos.length})
              </h3>

              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {allLogos.map((logo, index) => {
                  const isActive = activeLogoUrl === logo;
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectLogo(logo)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? "border-[#D3A76C] bg-[#D3A76C]/5 text-[#D3A76C]"
                          : "border-zinc-900 bg-zinc-950 hover:border-zinc-850"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-12 bg-zinc-900 rounded border border-zinc-850 flex items-center justify-center shrink-0 p-1">
                          <img src={logo} alt="Thumb" className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">
                          {logo === "/logo.png" ? "Стандартный" : `Пользовательский #${index}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isActive && <Check className="h-3.5 w-3.5 text-[#D3A76C]" />}
                        {logo !== "/logo.png" && (
                          <button
                            onClick={(e) => handleDeleteLogo(logo, e)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                            title="Удалить из библиотеки"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 text-[10px] text-zinc-500 italic leading-relaxed">
              Кликните по любому логотипу в библиотеке, чтобы мгновенно сделать его основным логотипом компании в приложении.
            </div>
          </div>
        </div>
      </div>

      {/* 2. FAVICON SECTION */}
      <div className="space-y-6">
        <div className="border-b border-zinc-900 pb-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Менеджер фавиконов (Favicon)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Загружайте фавиконы в формате <strong className="text-zinc-300">JPG, PNG или ICO</strong>. Система автоматически создаст все необходимые форматы (.ico, .png, .svg) и мгновенно применит их на вашем сайте во всех браузерах.
          </p>
        </div>

        {faviconStatusMsg && (
          <div
            className={`rounded border p-4 text-xs ${
              faviconStatusMsg.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                : "border-rose-500/20 bg-rose-500/5 text-rose-400"
            }`}
          >
            {faviconStatusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Current Active Favicon Mockup Preview */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Предосмотр вкладки браузера
              </h3>
              
              <div className="rounded-lg bg-zinc-950 p-6 border border-zinc-900 flex flex-col justify-center min-h-[140px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#D3A76C0c_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>
                
                {/* Browser tab mockup */}
                <div className="relative z-10 w-full max-w-[200px] mx-auto rounded-t-lg bg-zinc-900 border-t border-l border-r border-zinc-800 p-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950/90 rounded-md border border-zinc-800 text-[10px] text-zinc-300 font-medium truncate">
                    <div className="w-4 h-4 bg-zinc-900 rounded flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={activeFaviconUrl || "/favicon.ico"}
                        alt="Favicon Tab"
                        className="h-3 w-3 object-contain"
                        onError={(e) => {
                          // Fallback in case of .ico decoding issues in standard tags
                          (e.target as HTMLImageElement).src = "/favicon.png";
                        }}
                      />
                    </div>
                    <span className="truncate">EVI Global Catalog</span>
                  </div>
                  <div className="h-1 bg-zinc-950 rounded-b-md"></div>
                </div>
                
                <div className="w-full max-w-[200px] mx-auto h-1.5 bg-zinc-900 rounded-b-lg border-l border-r border-b border-zinc-800"></div>
              </div>

              <p className="text-[10px] text-zinc-500 mt-3 font-mono leading-relaxed truncate">
                {activeFaviconUrl.startsWith("data:") ? "Пользовательский фавикон (Base64)" : `Стандартный: ${activeFaviconUrl}`}
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleResetFaviconToDefault}
                disabled={activeFaviconUrl === "/favicon.ico"}
                className="flex w-full items-center justify-center gap-2 rounded border border-zinc-850 bg-zinc-900/45 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-bold text-zinc-300 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-[#D3A76C]" />
                Вернуть стандартный
              </button>
            </div>
          </div>

          {/* Middle Column: Upload New Favicon */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Прикрепить фавикон (.jpg, .ico)
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Для наилучшего качества рекомендуется квадратное изображение разрешением не менее 128x128 пикселей.
              </p>
              
              <label className="relative flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-[#D3A76C] bg-zinc-950/20 hover:bg-zinc-900/10 rounded-lg p-6 transition-all cursor-pointer group">
                <Upload className="h-8 w-8 text-zinc-500 group-hover:text-[#D3A76C] transition-colors mb-2" />
                <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors text-center">
                  {uploadingFavicon ? "Загрузка..." : "Выбрать файл фавикона"}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1 font-mono text-center">JPG, JPEG, PNG, ICO до 2 МБ</span>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png, image/x-icon, image/vnd.microsoft.icon"
                  onChange={handleUploadFavicon}
                  disabled={uploadingFavicon}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <div className="mt-6 text-[10px] text-zinc-500 font-mono text-center">
              Сервер сгенерирует файлы разных размеров под любые устройства.
            </div>
          </div>

          {/* Right Column: Library list of favicons */}
          <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Библиотека фавиконов ({allFavicons.length})
              </h3>

              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {allFavicons.map((fav, index) => {
                  const isActive = activeFaviconUrl === fav;
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectFavicon(fav)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? "border-[#D3A76C] bg-[#D3A76C]/5 text-[#D3A76C]"
                          : "border-zinc-900 bg-zinc-950 hover:border-zinc-850"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 bg-zinc-900 rounded border border-zinc-850 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                          <img
                            src={fav}
                            alt="Favicon Thumb"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/favicon.png";
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">
                          {fav === "/favicon.ico" ? "Стандартный" : `Пользовательский #${index}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isActive && <Check className="h-3.5 w-3.5 text-[#D3A76C]" />}
                        {fav !== "/favicon.ico" && (
                          <button
                            onClick={(e) => handleDeleteFavicon(fav, e)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                            title="Удалить из библиотеки"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 text-[10px] text-zinc-550 italic leading-relaxed">
              Вы можете переключаться между ранее загруженными фавиконами кликом.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
