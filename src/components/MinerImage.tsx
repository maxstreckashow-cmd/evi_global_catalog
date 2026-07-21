import React from "react";

interface MinerImageProps {
  manufacturer: string;
  model: string;
  imageUrl?: string;
  className?: string;
}

export const MinerImage: React.FC<MinerImageProps> = ({ manufacturer, model, imageUrl, className = "h-36 w-full" }) => {
  const [imgError, setImgError] = React.useState(false);
  const mfr = manufacturer.toLowerCase();

  // Reset imgError if imageUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  if (imageUrl && !imgError) {
    return (
      <div className={`relative flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900 group ${className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1c1c1c_25%,transparent_25%),linear-gradient(-45deg,#1c1c1c_25%,transparent_25%)] bg-[size:20px_20px] opacity-10"></div>
        <img 
          src={imageUrl} 
          alt={`${manufacturer} ${model}`} 
          className="h-full w-full object-contain p-2 relative z-10 transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Custom SVGs corresponding to official industrial designs of verified manufacturers
  if (mfr.includes("antminer") || mfr.includes("bitmain")) {
    // Official Antminer look: Dual-fan silver/aluminum block chassis, top-mounted control box
    return (
      <div className={`relative flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900 group ${className}`}>
        {/* Golden laser lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1c1c1c_25%,transparent_25%),linear-gradient(-45deg,#1c1c1c_25%,transparent_25%)] bg-[size:20px_20px] opacity-10"></div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#D3A76C]/10 blur-xl group-hover:bg-[#D3A76C]/20 transition-all duration-500"></div>
        
        <svg className="w-10/12 h-5/6 text-zinc-300 drop-shadow-[0_8px_16px_rgba(211,167,108,0.15)]" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Chassis */}
          <rect x="35" y="40" width="90" height="55" rx="4" fill="#2E2E33" stroke="#D3A76C" strokeWidth="1.5" />
          <rect x="39" y="44" width="82" height="47" rx="2" fill="#1C1C1F" />
          
          {/* Top Control Board Unit */}
          <path d="M45 40 L45 22 C45 20.5 46.5 19 48 19 L112 19 C113.5 19 115 20.5 115 22 L115 40 Z" fill="#2E2E33" stroke="#D3A76C" strokeWidth="1" />
          <rect x="52" y="24" width="56" height="10" rx="1" fill="#0F0D09" />
          
          {/* Ethernet Port & Status LEDs */}
          <rect x="94" y="26" width="8" height="6" fill="#D3A76C" opacity="0.8" />
          <circle cx="58" cy="29" r="1.5" fill="#10B981" /> {/* Normal status green LED */}
          <circle cx="64" cy="29" r="1.5" fill="#EF4444" /> {/* Fault status red LED */}
          <circle cx="70" cy="29" r="1.5" fill="#D3A76C" /> {/* Active Gold LED */}

          {/* Dual cooling fans on front/back */}
          {/* Left Fan Guard */}
          <circle cx="58" cy="67" r="18" fill="#2E2E33" stroke="#D3A76C" strokeWidth="1" />
          <circle cx="58" cy="67" r="14" fill="#0F0D09" />
          <path d="M58 53 L58 81 M44 67 L72 67 M48 57 L68 77 M48 77 L68 57" stroke="#D3A76C" strokeWidth="0.75" strokeDasharray="2 1" />
          <circle cx="58" cy="67" r="4" fill="#D3A76C" />
          
          {/* Right Fan Guard */}
          <circle cx="102" cy="67" r="18" fill="#2E2E33" stroke="#D3A76C" strokeWidth="1" />
          <circle cx="102" cy="67" r="14" fill="#0F0D09" />
          <path d="M102 53 L102 81 M88 67 L116 67 M92 57 L112 77 M92 77 L112 57" stroke="#D3A76C" strokeWidth="0.75" strokeDasharray="2 1" />
          <circle cx="102" cy="67" r="4" fill="#D3A76C" />

          {/* Model badge info */}
          <rect x="35" y="85" width="22" height="7" rx="1" fill="#D3A76C" />
          <text x="38" y="91" fill="#0F0D09" fontSize="5" fontWeight="900" fontFamily="sans-serif">S21</text>
        </svg>
      </div>
    );
  } else if (mfr.includes("whatsminer")) {
    // Official Whatsminer look: Compact horizontal block with dense cooling fans, side-mounted power supply (PSU)
    return (
      <div className={`relative flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900 group ${className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1c1c1c_25%,transparent_25%),linear-gradient(-45deg,#1c1c1c_25%,transparent_25%)] bg-[size:20px_20px] opacity-10"></div>
        <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-[#E7C08B]/10 blur-xl group-hover:bg-[#E7C08B]/20 transition-all duration-500"></div>

        <svg className="w-10/12 h-5/6 text-zinc-300 drop-shadow-[0_8px_16px_rgba(231,192,139,0.15)]" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Side-Mounted Large Power Supply */}
          <rect x="25" y="32" width="22" height="66" rx="2" fill="#202024" stroke="#E7C08B" strokeWidth="1" />
          <line x1="30" y1="38" x2="42" y2="38" stroke="#E7C08B" strokeWidth="1.5" />
          <line x1="30" y1="44" x2="42" y2="44" stroke="#E7C08B" strokeWidth="1.5" />
          <rect x="30" y="80" width="12" height="12" rx="1" fill="#0F0D09" stroke="#E7C08B" strokeWidth="0.5" />
          
          {/* Main Chassis Box */}
          <rect x="47" y="38" width="88" height="54" rx="3" fill="#2E2E33" stroke="#E7C08B" strokeWidth="1.5" />
          <rect x="51" y="42" width="80" height="46" rx="1" fill="#1C1C1F" />

          {/* Large Center Exhaust Fan */}
          <circle cx="91" cy="65" r="21" fill="#2E2E33" stroke="#E7C08B" strokeWidth="1.25" />
          <circle cx="91" cy="65" r="17" fill="#0F0D09" />
          {/* Spinning fan blades representation */}
          <path d="M91 44 C96 49 96 55 91 65 C86 55 86 49 91 44 Z" fill="#E7C08B" opacity="0.8" />
          <path d="M91 86 C86 81 86 75 91 65 C96 75 96 81 91 86 Z" fill="#E7C08B" opacity="0.8" />
          <path d="M70 65 C75 60 81 60 91 65 C81 70 75 70 70 65 Z" fill="#E7C08B" opacity="0.8" />
          <path d="M112 65 C107 70 101 70 91 65 C101 60 107 60 112 65 Z" fill="#E7C08B" opacity="0.8" />
          <circle cx="91" cy="65" r="5" fill="#E7C08B" />

          {/* Aluminium cooling fins lines */}
          <line x1="56" y1="46" x2="56" y2="84" stroke="#E7C08B" strokeWidth="0.5" opacity="0.3" />
          <line x1="126" y1="46" x2="126" y2="84" stroke="#E7C08B" strokeWidth="0.5" opacity="0.3" />

          {/* Brand/Model details text */}
          <text x="56" y="52" fill="#E7C08B" fontSize="6" fontWeight="900" letterSpacing="0.5" fontFamily="sans-serif">M60S</text>
        </svg>
      </div>
    );
  } else if (mfr.includes("iceriver")) {
    // Official IceRiver look: Deep gray/black modern compact casing, golden honeycomb front grille
    return (
      <div className={`relative flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900 group ${className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1c1c1c_25%,transparent_25%),linear-gradient(-45deg,#1c1c1c_25%,transparent_25%)] bg-[size:20px_20px] opacity-10"></div>
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#D3A76C]/10 blur-xl group-hover:bg-[#D3A76C]/20 transition-all duration-500"></div>

        <svg className="w-10/12 h-5/6 text-zinc-300 drop-shadow-[0_8px_16px_rgba(211,167,108,0.12)]" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Honeycomb Pattern Background */}
          <path d="M30 40 L45 35 L60 40 L75 35 L90 40 L105 35 L120 40 M30 50 L45 45 L60 50 L75 45 L90 50 L105 45 L120 50" stroke="#D3A76C" strokeWidth="0.5" opacity="0.25" />
          
          {/* Main Sleek Dark Case */}
          <rect x="30" y="30" width="100" height="60" rx="6" fill="#1C1C1F" stroke="#D3A76C" strokeWidth="1.5" />
          
          {/* Inner Grille Mesh */}
          <rect x="36" y="36" width="88" height="48" rx="4" fill="#0F0D09" stroke="#1C1C1F" strokeWidth="1" />
          
          {/* Honeycomb Grille Highlights */}
          <line x1="36" y1="44" x2="124" y2="44" stroke="#D3A76C" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="36" y1="52" x2="124" y2="52" stroke="#D3A76C" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="36" y1="60" x2="124" y2="60" stroke="#D3A76C" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="36" y1="68" x2="124" y2="68" stroke="#D3A76C" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          <line x1="36" y1="76" x2="124" y2="76" stroke="#D3A76C" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />

          {/* Compact Dual Fans inside the mesh */}
          <circle cx="56" cy="60" r="14" fill="#1C1C1F" stroke="#D3A76C" strokeWidth="1" />
          <circle cx="56" cy="60" r="11" fill="#0F0D09" />
          <circle cx="56" cy="60" r="3" fill="#D3A76C" />
          <path d="M56 49 L56 71 M45 60 L67 60" stroke="#D3A76C" strokeWidth="0.75" />

          <circle cx="104" cy="60" r="14" fill="#1C1C1F" stroke="#D3A76C" strokeWidth="1" />
          <circle cx="104" cy="60" r="11" fill="#0F0D09" />
          <circle cx="104" cy="60" r="3" fill="#D3A76C" />
          <path d="M104 49 L104 71 M93 60 L115 60" stroke="#D3A76C" strokeWidth="0.75" />

          {/* KASPA Gold emblem */}
          <rect x="74" y="52" width="12" height="16" rx="1" fill="#D3A76C" />
          <text x="76" y="62" fill="#0F0D09" fontSize="6" fontWeight="900" fontFamily="sans-serif">KAS</text>
        </svg>
      </div>
    );
  } else {
    // Canaan Avalon / Other verified models: Futuristic clean dual block with unique round extractor
    return (
      <div className={`relative flex items-center justify-center bg-zinc-950/80 rounded-lg overflow-hidden border border-zinc-900 group ${className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1c1c1c_25%,transparent_25%),linear-gradient(-45deg,#1c1c1c_25%,transparent_25%)] bg-[size:20px_20px] opacity-10"></div>
        <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-[#D3A76C]/10 blur-xl group-hover:bg-[#D3A76C]/20 transition-all duration-500"></div>

        <svg className="w-10/12 h-5/6 text-zinc-300 drop-shadow-[0_8px_16px_rgba(211,167,108,0.15)]" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Distinct Curved Avalon Box Chassis */}
          <path d="M30 44 C30 40 34 36 38 36 L122 36 C126 36 130 40 130 44 L130 84 C130 88 126 92 122 92 L38 92 C34 92 30 88 30 84 Z" fill="#2E2E33" stroke="#D3A76C" strokeWidth="1.5" />
          <path d="M34 46 C34 43 37 40 40 40 L120 40 C123 40 126 43 126 46 L126 82 C126 85 123 88 120 88 L40 88 C37 88 34 85 34 82 Z" fill="#1C1C1F" />

          {/* Huge ventilation heat extractor outlet */}
          <circle cx="80" cy="64" r="22" fill="#2E2E33" stroke="#D3A76C" strokeWidth="1.25" />
          <circle cx="80" cy="64" r="18" fill="#0F0D09" />
          {/* High speed circular blades */}
          <path d="M80 64 C84 54 94 48 80 42 C66 48 76 54 80 64 Z" fill="#D3A76C" opacity="0.8" />
          <path d="M80 64 C76 74 66 80 80 86 C94 80 84 74 80 64 Z" fill="#D3A76C" opacity="0.8" />
          <path d="M80 64 C90 68 96 78 102 64 C96 50 90 60 80 64 Z" fill="#D3A76C" opacity="0.8" />
          <path d="M80 64 C70 60 64 50 58 64 C64 78 70 68 80 64 Z" fill="#D3A76C" opacity="0.8" />
          <circle cx="80" cy="64" r="6" fill="#D3A76C" />

          {/* Heat warning triangular labels */}
          <polygon points="44,48 50,48 47,43" fill="#D3A76C" />
          <polygon points="116,48 122,48 119,43" fill="#D3A76C" />
        </svg>
      </div>
    );
  }
};
