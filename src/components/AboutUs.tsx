import React from "react";
import { Landmark, Users, Flame, Globe2, ShieldCheck, Gem } from "lucide-react";

export const AboutUs: React.FC = () => {
  return (
    <div id="about-us-section" className="space-y-8 animate-fade-in max-w-5xl mx-auto py-4">
      {/* Intro Hero Section */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950/90 to-zinc-900/60 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D3A76C06_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#D3A76C] font-mono bg-[#D3A76C]/10 border border-[#D3A76C]/20 px-3 py-1 rounded-full">
            Экосистема цифровой генерации
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mt-4 leading-tight">
            АО «ЭВИ ГЛОБАЛ ГРУПП»
          </h1>
          <p className="text-base md:text-lg font-bold text-[#D3A76C] mt-2 font-mono">
            Экосистема генерации и управления цифровыми активами
          </p>
          <p className="text-sm md:text-base text-zinc-300 mt-4 leading-relaxed font-sans">
            Группа компаний ЭВИ специализируется на промышленном майнинге, IT-технологиях и строительстве современных дата-центров для добычи криптовалюты.
          </p>
        </div>
      </div>

      {/* Corporate Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 text-center">
          <p className="text-3xl md:text-4xl font-black text-[#D3A76C] font-mono">150+ МВт</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Общая мощность ДЦ</p>
        </div>
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 text-center">
          <p className="text-3xl md:text-4xl font-black text-white font-mono">5+</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Регионов присутствия</p>
        </div>
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 text-center">
          <p className="text-3xl md:text-4xl font-black text-[#D3A76C] font-mono">24/7</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Мониторинг инфраструктуры</p>
        </div>
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 text-center">
          <p className="text-3xl md:text-4xl font-black text-white font-mono">100%</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Юридическая чистота</p>
        </div>
      </div>

      {/* Features bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-[#D3A76C]/10 border border-[#D3A76C]/20 flex items-center justify-center">
            <Flame className="h-5 w-5 text-[#D3A76C]" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">Промышленный майнинг</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Развертывание и масштабирование энергоэффективных вычислительных мощностей. Собственные современные площадки для стабильной генерации цифровых активов.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">IT-технологии и ПО</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Разработка специализированного программного обеспечения для мониторинга, автоматизации, распределения хэшрейта и комплексной оптимизации работы вычислительного оборудования.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-[#D3A76C]/10 border border-[#D3A76C]/20 flex items-center justify-center">
            <Gem className="h-5 w-5 text-[#D3A76C]" />
          </div>
          <h3 className="text-sm font-bold uppercase text-white font-mono tracking-wider">Строительство дата-центров</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Проектирование и возведение высокотехнологичных дата-центров с нуля: подготовка энергетической инфраструктуры, монтаж систем воздушного и жидкостного охлаждения.
          </p>
        </div>
      </div>

      {/* Strategy and Logistics Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 md:p-8 space-y-4">
        <h3 className="text-base font-black text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
          Технологическое превосходство и надежность
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Наш головной офис расположен в Москве. Отсюда осуществляется стратегическое планирование, управление инвестиционными проектами, финансовый комплаенс и координация работы всех технологических площадок группы компаний на территории Российской Федерации.
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Инфраструктурные объекты группы компаний оснащены передовыми системами климат-контроля и автоматического пожаротушения, а круглосуточная команда инженеров гарантирует коэффициент непрерывной работы (Uptime) оборудования на уровне не ниже 99.8%.
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Все процессы генерации цифровых активов соответствуют актуальным требованиям законодательства РФ. Мы активно содействуем развитию отечественного рынка высоких технологий и цифровой экономики.
        </p>
      </div>
    </div>
  );
};
