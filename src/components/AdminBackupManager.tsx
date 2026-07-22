import React, { useState, useEffect } from "react";
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, Database, ShieldAlert, Sparkles } from "lucide-react";

interface BackupData {
  site_config?: any;
  product_images?: any;
  price_corrections?: any;
  seo_overrides?: any;
  custom_products?: any;
  product_details_enriched?: any;
  timestamp?: number;
}

interface AdminBackupManagerProps {
  onRestoreComplete: () => void;
}

export const AdminBackupManager: React.FC<AdminBackupManagerProps> = ({ onRestoreComplete }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localBackup, setLocalBackup] = useState<BackupData | null>(null);
  const [serverStateExists, setServerStateExists] = useState<boolean>(false);

  // Load browser auto-backup status
  useEffect(() => {
    try {
      const saved = localStorage.getItem("evi_catalog_backup");
      if (saved) {
        setLocalBackup(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    checkServerState();
  }, []);

  const checkServerState = async () => {
    try {
      const res = await fetch("/api/admin/backup/export");
      if (res.ok) {
        const data = await res.json();
        // Check if there are actual custom configs on server
        const hasCustomLogo = data.site_config?.customLogoUrl && data.site_config.customLogoUrl !== "/logo.png";
        const hasCustomImages = data.product_images && Object.keys(data.product_images).length > 0;
        const hasCorrections = data.price_corrections && Object.keys(data.price_corrections).length > 0;
        const hasSeo = data.seo_overrides && Object.keys(data.seo_overrides).length > 0;
        
        setServerStateExists(!!(hasCustomLogo || hasCustomImages || hasCorrections || hasSeo));

        // If server state exists, update local browser backup to match it (silent background sync)
        if (hasCustomLogo || hasCustomImages || hasCorrections || hasSeo) {
          localStorage.setItem("evi_catalog_backup", JSON.stringify(data));
          setLocalBackup(data);
        }
      }
    } catch (e) {
      console.error("Error checking server state:", e);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/backup/export");
      if (!res.ok) throw new Error("Failed to export backup");
      
      const data = await res.json();
      
      // Save locally in browser too
      localStorage.setItem("evi_catalog_backup", JSON.stringify(data));
      setLocalBackup(data);

      // Trigger download
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      const date = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("download", `evi_catalog_backup_${date}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMsg({
        type: "success",
        text: "Резервная копия успешно экспортирована и сохранена в браузере!",
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Не удалось экспортировать резервную копию: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const backupData = JSON.parse(reader.result as string) as BackupData;
        
        const res = await fetch("/api/admin/backup/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backupData),
        });

        const result = await res.json();
        if (result.success) {
          // Update local backup too
          localStorage.setItem("evi_catalog_backup", JSON.stringify(backupData));
          setLocalBackup(backupData);
          setServerStateExists(true);
          setStatusMsg({
            type: "success",
            text: "Все настройки (логотипы, изображения, цены, SEO) успешно импортированы из файла!",
          });
          onRestoreComplete();
        } else {
          throw new Error(result.error || "Unknown server error");
        }
      } catch (err: any) {
        console.error(err);
        setStatusMsg({ type: "error", text: "Ошибка при импорте файла: " + err.message });
      } finally {
        setImporting(false);
        // Reset file input value
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreFromBrowser = async () => {
    if (!localBackup) return;
    setImporting(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localBackup),
      });

      const result = await res.json();
      if (result.success) {
        setServerStateExists(true);
        setStatusMsg({
          type: "success",
          text: "Настройки успешно восстановлены из автокопии вашего браузера!",
        });
        onRestoreComplete();
      } else {
        throw new Error(result.error || "Unknown server error");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Не удалось восстановить из браузера: " + err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Резервное копирование и сохранность данных
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Поскольку сервер работает на облачной платформе Render.com, при перезапуске контейнера или обновлении кода временные файлы на сервере стираются. Этот модуль позволяет на 100% гарантировать сохранность ваших настроек.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-xs ${
            statusMsg.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-rose-500/20 bg-rose-500/5 text-rose-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Ephemeral Warning Card */}
      <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-5">
        <div className="flex gap-4">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              Особенности облачного хостинга Render.com
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
              Платформа <span className="text-white font-semibold">Render.com</span> использует эфемерную файловую систему. Это значит, что ваши загруженные логотипы, отредактированные изображения товаров, SEO-теги и скорректированные цены сбрасываются до значений по умолчанию при каждом обновлении приложения или автоматическом перезапуске сервера (после периода неактивности).
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-amber-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Браузерная автокопия защищает ваши данные
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" /> Ручной экспорт гарантирует 100% сохранность
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Auto-Backup Status Card */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Автокопия в браузере</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium font-mono ${
                localBackup ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400"
              }`}>
                {localBackup ? "Активна" : "Пусто"}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Локальное сохранение</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              Ваш браузер автоматически сохраняет резервную копию при каждом изменении (например, загрузке нового логотипа или редактировании изображения). Если сервер сбросился, вы можете мгновенно восстановить всё в один клик.
            </p>

            {localBackup && (
              <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Последний бэкап:</span>
                  <span className="text-white">
                    {new Date(localBackup.timestamp || Date.now()).toLocaleString("ru-RU")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Своих логотипов:</span>
                  <span className="text-white">
                    {localBackup.site_config?.allLogos?.filter((l: string) => l !== "/logo.png").length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Изображений товаров:</span>
                  <span className="text-white">
                    {localBackup.product_images ? Object.keys(localBackup.product_images).length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Перезаписанных цен:</span>
                  <span className="text-white">
                    {localBackup.price_corrections ? Object.keys(localBackup.price_corrections).length : 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleRestoreFromBrowser}
              disabled={!localBackup || importing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#D3A76C] hover:bg-[#E7C08B] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-transparent text-[#0F0D09] py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              {importing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Восстановление...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Восстановить из браузера
                </>
              )}
            </button>
            {!serverStateExists && localBackup && (
              <p className="text-[10px] text-amber-500 text-center font-mono mt-2 animate-pulse">
                ⚠️ Обнаружен сброс сервера! Нажмите кнопку выше для восстановления настроек.
              </p>
            )}
          </div>
        </div>

        {/* Manual Export/Import File Card */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Резервный файл</span>
              <span className="text-[10px] text-zinc-500 font-mono">100% защита вне платформы</span>
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Экспорт и Импорт JSON</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              Для максимальной надежности скачайте файл резервной копии к себе на компьютер. Вы сможете импортировать его на любом устройстве в любое время.
            </p>

            <div className="mt-4 p-4 rounded-lg border border-dashed border-zinc-800 text-center bg-zinc-900/20">
              <span className="text-[11px] text-zinc-500 font-mono block mb-2">
                Для восстановления выберите ранее скачанный файл:
              </span>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-bold text-white uppercase tracking-wider cursor-pointer transition-all">
                <Upload className="h-3.5 w-3.5 text-[#D3A76C]" />
                Загрузить JSON файл
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Экспорт...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-[#D3A76C]" />
                  Скачать резервную копию
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
