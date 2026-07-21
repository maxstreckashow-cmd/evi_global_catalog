import React, { useState } from "react";
import { Shield, FileText, Landmark, Scale, HelpCircle } from "lucide-react";

export const LegalDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "requisites">("privacy");

  return (
    <div id="legal-docs-section" className="space-y-6 animate-fade-in max-w-4xl mx-auto py-4">
      {/* Upper header */}
      <div className="border-b border-zinc-900 pb-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#D3A76C] font-mono">АО ЭВИ ГЛОБАЛ ГРУПП</span>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1">Правовая информация и реквизиты</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Официальная юридическая документация, регламентирующая работу сайта-каталога оборудования и защиту персональных данных в соответствии с законами РФ.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border-b-2 ${
            activeTab === "privacy"
              ? "border-[#D3A76C] text-[#D3A76C]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Shield className="h-4 w-4" />
          Политика конфиденциальности (152-ФЗ)
        </button>

        <button
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border-b-2 ${
            activeTab === "terms"
              ? "border-[#D3A76C] text-[#D3A76C]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          Пользовательское соглашение
        </button>

        <button
          onClick={() => setActiveTab("requisites")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border-b-2 ${
            activeTab === "requisites"
              ? "border-[#D3A76C] text-[#D3A76C]"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Landmark className="h-4 w-4" />
          Юридические реквизиты компании
        </button>
      </div>

      {/* Document Panel Box */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 md:p-8 text-zinc-300 text-xs leading-relaxed space-y-6">
        
        {activeTab === "privacy" && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Shield className="h-4 w-4 text-[#D3A76C]" />
              Политика в отношении обработки персональных данных
            </h2>
            <p className="text-[11px] text-zinc-400 italic">
              Настоящая политика составлена в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые АО «ЭВИ ГЛОБАЛ ГРУПП» (далее — Оператор).
            </p>

            <div className="space-y-4 font-sans text-zinc-300">
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">1. Общие положения</h3>
                <p>
                  1.1. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.
                </p>
                <p className="mt-1">
                  1.2. Настоящая Политика применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта и приложения-каталога.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">2. Основные понятия, используемые в Политике</h3>
                <p>
                  2.1. Автоматизированная обработка персональных данных — обработка персональных данных с помощью средств вычислительной техники.
                </p>
                <p className="mt-1">
                  2.2. Блокирование персональных данных — временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных).
                </p>
                <p className="mt-1">
                  2.3. Информационная система персональных данных — совокупность содержащихся в базах данных персональных данных и обеспечивающих их обработку информационных технологий и технических средств.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">3. Основные права и обязанности Оператора и субъектов персональных данных</h3>
                <p>
                  3.1. Оператор имеет право самостоятельно определять состав и перечень мер, необходимых и достаточных для обеспечения выполнения обязанностей, предусмотренных Федеральным законом 152-ФЗ.
                </p>
                <p className="mt-1">
                  3.2. Субъекты персональных данных имеют право на получение информации, касающейся обработки их персональных данных, требовать их уточнения, блокирования или уничтожения в случае, если персональные данные являются неполными, устаревшими, неточными или незаконно полученными.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">4. Какие данные мы обрабатываем</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Фамилия, имя, отчество пользователя;</li>
                  <li>Номер контактного телефона;</li>
                  <li>Адрес электронной почты (e-mail);</li>
                  <li>Обезличенные данные о посетителях (в т.ч. файлы «cookie», IP-адреса, геопозиция) с помощью сервисов веб-аналитики.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">5. Цели обработки персональных данных</h3>
                <p>
                  5.1. Цель обработки персональных данных Пользователя — предоставление доступа Пользователю к сервисам, информации и каталогу оборудования, подбор оптимальных вариантов лизинга, расчет окупаемости ASIC-майнеров, связь для уточнения деталей оптового заказа (от 30 шт.).
                </p>
                <p className="mt-1">
                  5.2. Обезличенные данные Пользователей, собираемые с помощью сервисов интернет-статистики, служат для сбора информации о действиях Пользователей на сайте, улучшения качества сайта и его содержания.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">6. Порядок сбора, хранения, передачи и других видов обработки</h3>
                <p>
                  Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.
                </p>
                <p className="mt-1">
                  Срок обработки персональных данных является неограниченным. Пользователь может в любой момент отозвать свое согласие на обработку персональных данных, направив Оператору уведомление посредством электронной почты на электронный адрес Оператора info@evi-global.com с пометкой «Отзыв согласия на обработку персональных данных».
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
              <FileText className="h-4 w-4 text-[#D3A76C]" />
              Пользовательское соглашение (Оферта использования сервисов)
            </h2>
            <p className="text-[11px] text-zinc-400 italic">
              Настоящее Пользовательское соглашение является публичным документом АО «ЭВИ ГЛОБАЛ ГРУПП» и определяет условия использования информационных материалов, интерактивного калькулятора, каталога оптовых поставок оборудования и сравнения спецификаций.
            </p>

            <div className="space-y-4 font-sans text-zinc-300">
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">1. Предмет соглашения и общие правила</h3>
                <p>
                  1.1. Настоящее Соглашение регулирует отношения между Администрацией ресурса (АО «ЭВИ ГЛОБАЛ ГРУПП») и пользователем сети Интернет, осуществляющим доступ к каталогу.
                </p>
                <p className="mt-1">
                  1.2. Использование материалов и функций сайта-приложения означает безоговорочное согласие пользователя с настоящим Соглашением. При несогласии с данными условиями пользователь должен воздержаться от использования ресурса.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">2. Информационный статус каталога</h3>
                <p>
                  2.1. Цены, технические характеристики, энергоэффективность, алгоритмы и сроки окупаемости устройств, представленные в каталоге, носят исключительно ознакомительный/информационный характер и не являются публичной офертой, определяемой положениями Статьи 437 Гражданского кодекса РФ.
                </p>
                <p className="mt-1">
                  2.2. Все расчеты окупаемости производятся на основе усредненной текущей доходности криптовалют, тарифа на электроэнергию и сложности майнинга сети, которые подвержены высокой волатильности. Реальные показатели могут существенно отличаться.
                </p>
                <p className="mt-1">
                  2.3. Поставка оборудования (ASIC-майнеров) осуществляется <strong>исключительно оптовыми партиями от 30 штук</strong> напрямую от заводов-производителей на условиях индивидуально согласованного договора поставки.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">3. Ограничение ответственности</h3>
                <p>
                  3.1. Администрация не несет ответственности за любые прямые или косвенные убытки, возникшие из-за использования или невозможности использования информации, калькуляторов расчета окупаемости или спецификаций, представленных в данном приложении.
                </p>
                <p className="mt-1">
                  3.2. Оборудование для майнинга сопряжено с повышенными коммерческими, техническими и инфраструктурными рисками. Пользователь принимает любые финансовые и инвестиционные решения под свою личную ответственность.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">4. Интеллектуальная собственность</h3>
                <p>
                  Все права на текстовые материалы, дизайн, структуру каталога, логотипы, алгоритмы калькуляции и программный код защищены законодательством РФ об интеллектуальной собственности и принадлежат АО «ЭВИ ГЛОБАЛ ГРУПП» или законным правообладателям. Несогласованное копирование материалов запрещено.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "requisites" && (
          <div className="space-y-4">
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Landmark className="h-4 w-4 text-[#D3A76C]" />
              Юридические реквизиты АО «ЭВИ ГЛОБАЛ ГРУПП»
            </h2>
            <p className="text-[11px] text-zinc-400">
              Официальная карточка компании для оформления контрактов поставки, согласования лизинга, выставления счетов и ведения корреспонденции.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-zinc-950/60 rounded border border-zinc-900 p-4 space-y-2">
                <h3 className="font-bold text-[#D3A76C] uppercase tracking-wider text-[10px] border-b border-zinc-900 pb-1 font-mono">Общие сведения</h3>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">Полное наименование</p>
                  <p className="font-bold text-white text-xs">Акционерное общество «ЭВИ ГЛОБАЛ ГРУПП»</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">Сокращенное наименование</p>
                  <p className="font-bold text-white text-xs">АО «ЭВИ ГЛОБАЛ ГРУПП»</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">Организационно-правовая форма</p>
                  <p className="font-bold text-zinc-300 text-xs">Непубличное акционерное общество (АО)</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 rounded border border-zinc-900 p-4 space-y-2">
                <h3 className="font-bold text-[#D3A76C] uppercase tracking-wider text-[10px] border-b border-zinc-900 pb-1 font-mono">Регистрационные номера</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">ИНН</p>
                    <p className="font-black text-white text-xs font-mono">9703141150</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">КПП</p>
                    <p className="font-black text-white text-xs font-mono">770301001</p>
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">ОГРН</p>
                  <p className="font-black text-white text-xs font-mono">1237700284510</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">ОКПО</p>
                  <p className="font-bold text-zinc-300 text-xs font-mono">49539281</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 rounded border border-zinc-900 p-4 space-y-2 md:col-span-2">
                <h3 className="font-bold text-[#D3A76C] uppercase tracking-wider text-[10px] border-b border-zinc-900 pb-1 font-mono">Юридический и почтовый адрес</h3>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">Юридический адрес</p>
                  <p className="font-bold text-white text-xs">123112, г. Москва, Пресненская наб., д. 12, этаж 45, комната 8</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-mono">Бизнес-центр</p>
                  <p className="font-bold text-zinc-300 text-xs">Москва-Сити, Башня Федерация «Запад»</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 rounded border border-zinc-900 p-4 space-y-2 md:col-span-2">
                <h3 className="font-bold text-[#D3A76C] uppercase tracking-wider text-[10px] border-b border-zinc-900 pb-1 font-mono">Контакты и Служба Поддержки</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">Единый телефон компании</p>
                    <a href="tel:+74958593089" className="font-black text-[#D3A76C] text-sm hover:underline font-mono">+7 (495) 859-30-89</a>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">Официальная почта (Email)</p>
                    <a href="mailto:info@evi-global.com" className="font-bold text-white text-xs hover:underline font-mono">info@evi-global.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
