import React, { useState } from "react";
import { Product } from "../types";
import { 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Terminal, 
  Database, 
  Sparkles, 
  Info,
  ExternalLink
} from "lucide-react";

interface ProductSpecsParserProps {
  products: Product[];
  onRefreshProducts: () => void;
}

interface LogLine {
  id: string;
  type: "info" | "success" | "error" | "system";
  text: string;
  timestamp: string;
}

export const ProductSpecsParser: React.FC<ProductSpecsParserProps> = ({ products, onRefreshProducts }) => {
  const [enrichingSlug, setEnrichingSlug] = useState<string | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const addLog = (text: string, type: LogLine["type"] = "info") => {
    const newLine: LogLine = {
      id: Math.random().toString(36).substring(7),
      type,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [newLine, ...prev].slice(0, 100)); // keep last 100 logs
  };

  const handleEnrichSingle = async (product: Product, force = false) => {
    if (enrichingSlug || batchRunning) return;
    setEnrichingSlug(product.slug);
    addLog(`Запуск парсинга характеристик для ${product.manufacturer} ${product.model}...`, "system");
    addLog(`Запрос на проверку в источниках: asicminervalue.com, minerstat.com, hashrate.no, каталоги производителей.`, "info");
    
    try {
      const res = await fetch("/api/products/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product.slug, force })
      });
      
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      
      if (data.success) {
        const details = data.details || data.data;
        const sources = details.sourcesChecked || details.sources_checked || ["интернет-источники"];
        
        addLog(`Успешно получены характеристики для ${product.model}!`, "success");
        addLog(`[Данные]: Потребление: ${details.power} кВт | Вес: ${details.weight} кг | Эффективность: ${details.efficiency || "—"} J/T`, "success");
        addLog(`Проверенные источники: ${sources.join(", ")}`, "info");
        
        onRefreshProducts();
      } else {
        addLog(`Не удалось распознать спецификации для ${product.model}. Использованы стандартные значения.`, "error");
      }
    } catch (e: any) {
      addLog(`Ошибка при парсинге товара: ${e.message}`, "error");
    } finally {
      setEnrichingSlug(null);
    }
  };

  const handleEnrichBatch = async () => {
    if (enrichingSlug || batchRunning) return;
    setBatchRunning(true);
    addLog(`Запуск пакетного автопарсинга недостающих характеристик...`, "system");
    
    let processed = 0;
    const missing = products.filter(p => !p.power);
    
    if (missing.length === 0) {
      addLog(`Все товары в каталоге уже имеют заполненные характеристики!`, "success");
      setBatchRunning(false);
      return;
    }
    
    addLog(`Найдено ${missing.length} товаров с недостающими данными. Начинаем пакетную обработку...`, "info");
    
    try {
      // We will make batch requests to our backend (which enriches up to 3 per request)
      while (processed < missing.length && batchRunning) {
        addLog(`Запрос на обработку следующей группы товаров (пакет по 3 шт)...`, "info");
        const res = await fetch("/api/products/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
        
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        
        if (data.success && data.enrichedCount > 0) {
          processed += data.enrichedCount;
          setSuccessCount(prev => prev + data.enrichedCount);
          addLog(`Обработано товаров в этой итерации: ${data.enrichedCount}. Осталось не заполнено: ${data.remainingMissingCount}`, "success");
          
          if (data.batchDetails) {
            data.batchDetails.forEach((item: any) => {
              addLog(`[Записано]: Slug: ${item.slug} -> Потребление: ${item.details.power} кВт, Эффективность: ${item.details.efficiency || "—"} J/T`, "success");
            });
          }
          onRefreshProducts();
          
          if (data.remainingMissingCount === 0) {
            addLog(`Пакетный импорт полностью завершен! Все характеристики заполнены.`, "success");
            break;
          }
          
          // Wait 2 seconds to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          addLog(`Пакетная обработка завершилась или не вернула новых данных.`, "info");
          break;
        }
      }
    } catch (e: any) {
      addLog(`Критическая ошибка пакетного импорта: ${e.message}`, "error");
    } finally {
      setBatchRunning(false);
    }
  };

  // Specs statistics
  const totalProducts = products.length;
  const enrichedProducts = products.filter(p => p.sourcesChecked && p.sourcesChecked.length > 0 && !p.sourcesChecked.includes("heuristic_default_fallback_database"));
  const heuristicProducts = products.filter(p => p.power && (!p.sourcesChecked || p.sourcesChecked.includes("heuristic_default_fallback_database")));
  const missingSpecs = products.filter(p => !p.power);

  return (
    <div id="product-specs-parser" className="space-y-6">
      
      {/* Informational Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-[#D3A76C]" />
              Скрипт-парсер технических характеристик (AI Spec Enricher)
            </h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-3xl">
              Парсер автоматически сканирует товары и восполняет недостающие поля, такие как <strong>Потребление (кВт)</strong>, <strong>Вес (кг)</strong> и <strong>Энергоэффективность (J/TH)</strong>. 
              Он опрашивает сразу несколько источников в реальном времени посредством <strong>Gemini AI Search Grounding</strong> (Google Поиск) для полной сверки параметров.
            </p>
          </div>
          
          <button
            id="btn-batch-enrich"
            onClick={handleEnrichBatch}
            disabled={batchRunning || totalProducts === 0}
            className="flex items-center gap-2 rounded bg-[#D3A76C] hover:bg-[#E7C08B] hover:text-[#0F0D09] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-xs font-bold text-[#0F0D09] transition-all cursor-pointer uppercase tracking-wider shrink-0"
          >
            {batchRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Парсинг выполняется...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Запустить пакетный парсинг AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Statistics & Logs Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistics Widgets */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 font-mono">
              <Database className="h-4 w-4 text-[#D3A76C]" /> Состояние базы спецификаций
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-xs text-zinc-400">Всего моделей в каталоге:</span>
                <span className="text-sm font-bold text-white font-mono">{totalProducts}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Проверено AI (из внешних источников):
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {enrichedProducts.length}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Эвристические совпадения:
                </span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {heuristicProducts.length}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                  Не заполнено:
                </span>
                <span className="text-sm font-bold text-zinc-400 font-mono">
                  {missingSpecs.length}
                </span>
              </div>
            </div>

            {/* Micro warning */}
            {missingSpecs.length > 0 && (
              <div className="mt-6 rounded border border-amber-500/10 bg-amber-500/5 p-3 flex gap-2 items-start text-[11px] text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-relaxed">
                  Имеется {missingSpecs.length} товаров без заполненных характеристик. Рекомендуется запустить автопарсинг для синхронизации Tilda и XML экспорта.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-6 text-xs text-zinc-400 space-y-3">
            <h4 className="font-bold text-zinc-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[#D3A76C]" /> Источники парсинга
            </h4>
            <p className="leading-relaxed">
              Скрипт проверяет совпадение по производителю и хэшрейту в следующих базах:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-300 font-mono text-[10px]">
              <li>ASICMinerValue (asicminervalue.com)</li>
              <li>MinerStat (minerstat.com)</li>
              <li>Hashrate.no (hashrate.no)</li>
              <li>Официальные сайты (Bitmain, MicroBT, Canaan)</li>
            </ul>
          </div>
        </div>

        {/* Live Terminal Logs */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-6 flex flex-col h-[340px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5 font-mono">
            <Terminal className="h-4 w-4 text-[#D3A76C]" /> Консоль выполнения парсера
          </h3>
          
          <div className="flex-1 overflow-y-auto rounded bg-zinc-950 p-4 border border-zinc-900 font-mono text-[11px] space-y-2 flex flex-col-reverse h-full">
            {logs.length === 0 ? (
              <p className="text-zinc-650 italic text-center my-auto">Консоль пуста. Запустите парсинг для отображения логов в реальном времени.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2 items-start leading-relaxed border-b border-zinc-950 pb-1.5 last:border-0">
                  <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`shrink-0 uppercase text-[9px] font-bold px-1 rounded ${
                    log.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    log.type === "error" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                    log.type === "system" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                    "bg-zinc-800 text-zinc-400"
                  }`}>
                    {log.type}
                  </span>
                  <span className={`flex-1 ${
                    log.type === "success" ? "text-emerald-400" :
                    log.type === "error" ? "text-rose-400" :
                    log.type === "system" ? "text-zinc-200 font-bold" :
                    "text-zinc-450"
                  }`}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Catalog Table with Specs status */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-950/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Список моделей и статус спецификаций
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            Показано моделей: {products.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-450 font-mono uppercase bg-zinc-950/20">
                <th className="px-6 py-3.5">Устройство</th>
                <th className="px-6 py-3.5">Хэшрейт / Алгоритм</th>
                <th className="px-6 py-3.5">Потребление</th>
                <th className="px-6 py-3.5">Энергоэффективность</th>
                <th className="px-6 py-3.5">Вес</th>
                <th className="px-6 py-3.5">Статус данных</th>
                <th className="px-6 py-3.5 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {products.map((p) => {
                const hasAIEnriched = p.sourcesChecked && p.sourcesChecked.length > 0 && !p.sourcesChecked.includes("heuristic_default_fallback_database");
                const hasHeuristic = p.power && (!p.sourcesChecked || p.sourcesChecked.includes("heuristic_default_fallback_database"));
                
                const hashrateNum = parseFloat(p.hashrate.replace(/,/g, "."));
                const powerNum = parseFloat(p.power.replace(/,/g, ".")) * 1000;
                const calcEfficiency = isNaN(hashrateNum) || isNaN(powerNum) || hashrateNum === 0 
                  ? "—" 
                  : `${Math.round(powerNum / hashrateNum)} J/T`;
                
                return (
                  <tr key={p.slug} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="block font-bold text-white">{p.manufacturer} {p.model}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{p.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-white font-semibold font-mono">{p.hashrate} TH/s</span>
                      <span className="block text-[10px] text-zinc-550 font-mono mt-0.5">{p.algorithm}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.power ? (
                        <span className="font-bold text-emerald-400 font-mono">{p.power} кВт</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-500 font-mono">
                        {p.efficiency ? `${p.efficiency} J/T` : calcEfficiency}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {p.weight ? `${p.weight} кг` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {hasAIEnriched ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                          <CheckCircle2 className="h-3 w-3" /> AI Проверено
                        </span>
                      ) : hasHeuristic ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 font-mono">
                          <AlertTriangle className="h-3 w-3" /> База по умолчанию
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                          Нет данных
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEnrichSingle(p, true)}
                        disabled={enrichingSlug === p.slug || batchRunning}
                        className="inline-flex items-center gap-1 rounded bg-zinc-900 hover:bg-[#D3A76C] hover:text-[#0F0D09] disabled:opacity-40 border border-zinc-800 text-zinc-300 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {enrichingSlug === p.slug ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        Парсить AI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
