import React from "react";

interface EviLogoProps {
  className?: string;
  height?: number;
  logoUrl?: string;
}

export const EviLogo: React.FC<EviLogoProps> = ({ className = "", height = 40, logoUrl }) => {
  // Aspect ratio of the original logo is 540 : 120 (4.5 : 1 width to height)
  const width = Math.round(height * 4.5);

  const finalSrc = logoUrl || "/logo.png";

  return (
    <div 
      id="evi-global-logo" 
      className={`relative select-none flex items-center justify-start ${className}`} 
      style={{ height, width }}
    >
      <img 
        src={finalSrc} 
        alt="EVI Global Group Logo" 
        className="h-full w-full object-contain pointer-events-none"
        referrerPolicy="no-referrer"
        style={{ height }}
      />
    </div>
  );
};

