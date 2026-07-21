import React from "react";
import { Phone, Mail, MapPin, Clock, Calendar, Globe } from "lucide-react";

export const ContactsView: React.FC = () => {
  return (
    <div id="contacts-view-section" className="space-y-8 animate-fade-in max-w-5xl mx-auto py-4">
      {/* Intro section */}
      <div className="border-b border-zinc-900 pb-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#D3A76C] font-mono">Свяжитесь с нами</span>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Офисы и контактные данные</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Мы всегда открыты для продуктивного сотрудничества и готовы обсудить оптовые поставки вычислительного оборудования.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Direct info channels */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase text-white tracking-wider font-mono border-b border-zinc-900 pb-2">Головной офис в Москве</h2>
            
            <div className="flex gap-4 items-start text-xs text-zinc-300">
              <MapPin className="h-5 w-5 text-[#D3A76C] shrink-0" />
              <div>
                <p className="font-bold text-white">АО «ЭВИ ГЛОБАЛ ГРУПП»</p>
                <p className="mt-0.5 text-zinc-400">г. Москва, Хорошевское шоссе, 25Б, 3 этаж</p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs text-zinc-300">
              <Phone className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-zinc-500 font-mono uppercase text-[9px]">Единый телефон отдела продаж</p>
                <a href="tel:+74958593089" className="font-black text-lg text-[#D3A76C] hover:underline font-mono tracking-tight">
                  +7 (495) 859-30-89
                </a>
                <p className="text-[10px] text-zinc-500 mt-0.5">Звонки по РФ бесплатны</p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs text-zinc-300">
              <Mail className="h-5 w-5 text-[#D3A76C] shrink-0" />
              <div>
                <p className="text-zinc-500 font-mono uppercase text-[9px]">Почта для общих вопросов</p>
                <a href="mailto:info@evi-global.com" className="font-bold text-white hover:underline font-mono">
                  info@evi-global.com
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs text-zinc-300">
              <Clock className="h-5 w-5 text-zinc-500 shrink-0" />
              <div>
                <p className="text-zinc-500 font-mono uppercase text-[9px]">Режим работы</p>
                <p className="font-bold text-zinc-300">Пн – Пт: с 10:00 до 19:00 (по Москве)</p>
                <p className="text-[11px] text-zinc-500">Сб, Вс — выходные дни</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Info & Support */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider font-mono border-b border-zinc-900 pb-2 mb-4">Дополнительно</h2>
              
              <div className="flex gap-4 items-start text-xs text-zinc-300 mb-6">
                <Globe className="h-5 w-5 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-zinc-500 font-mono uppercase text-[9px]">Глобальный сайт компании</p>
                  <a href="https://evi-global.com" target="_blank" rel="noreferrer" className="font-bold text-white hover:underline font-mono">
                    evi-global.com
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-900/60 pt-4">
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1">Важная информация для посетителей</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Доступ в офис осуществляется по предварительной записи. Пожалуйста, согласуйте время вашего визита с персональным менеджером не менее чем за 1 рабочий день для оформления пропуска.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
