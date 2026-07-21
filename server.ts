import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));

// Explicit route for Yandex verification file
app.get("/yandex_dd6f3e1c22ddbc80.html", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(`<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: dd6f3e1c22ddbc80</body>
</html>`);
});

// Dynamic Cache for Spreadsheet Data
interface Product {
  manufacturer: string;
  model: string;
  hashrate: string;
  power: string;
  weight: string;
  slug: string;
  condition: string;
  algorithm: string;
  priceUsd: string;
  priceRub: string;
  payback: string;
  priceUsdNumeric: number;
  priceRubNumeric: number;
  imageUrl?: string;
  efficiency?: string;
  sourcesChecked?: string[];
  isCustom?: boolean;
}

const IMAGES_FILE = path.resolve(".", "product_images.json");

function getSavedImages(): Record<string, string> {
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const data = fs.readFileSync(IMAGES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading saved images:", error);
  }
  return {};
}

function saveImage(slug: string, imageUrl: string) {
  try {
    const images = getSavedImages();
    if (imageUrl) {
      images[slug] = imageUrl;
    } else {
      delete images[slug];
    }
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving image:", error);
  }
}

const CORRECTIONS_FILE = path.resolve(".", "price_corrections.json");

interface PriceCorrection {
  priceUsd?: string;
  priceRub?: string;
  hashrate?: string;
  power?: string;
  weight?: string;
  efficiency?: string;
  payback?: string;
  manufacturer?: string;
  model?: string;
  algorithm?: string;
  condition?: string;
}

function getPriceCorrections(): Record<string, PriceCorrection> {
  try {
    if (fs.existsSync(CORRECTIONS_FILE)) {
      const data = fs.readFileSync(CORRECTIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading price corrections:", error);
  }
  return {};
}

function savePriceCorrection(slug: string, correction: PriceCorrection | null) {
  try {
    const corrections = getPriceCorrections();
    if (correction) {
      corrections[slug] = correction;
    } else {
      delete corrections[slug];
    }
    fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(corrections, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving price correction:", error);
  }
}

const CUSTOM_PRODUCTS_FILE = path.resolve(".", "custom_products.json");

function getCustomProducts(): Product[] {
  try {
    if (fs.existsSync(CUSTOM_PRODUCTS_FILE)) {
      const data = fs.readFileSync(CUSTOM_PRODUCTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading custom products:", error);
  }
  return [];
}

function saveCustomProduct(product: Product) {
  try {
    const customProducts = getCustomProducts();
    const idx = customProducts.findIndex(p => p.slug === product.slug);
    if (idx !== -1) {
      customProducts[idx] = product;
    } else {
      customProducts.push(product);
    }
    fs.writeFileSync(CUSTOM_PRODUCTS_FILE, JSON.stringify(customProducts, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving custom product:", error);
  }
}

function deleteCustomProduct(slug: string) {
  try {
    let customProducts = getCustomProducts();
    customProducts = customProducts.filter(p => p.slug !== slug);
    fs.writeFileSync(CUSTOM_PRODUCTS_FILE, JSON.stringify(customProducts, null, 2), "utf-8");
  } catch (error) {
    console.error("Error deleting custom product:", error);
  }
}

const ENRICHED_FILE = path.resolve(".", "product_details_enriched.json");

interface EnrichedData {
  power: string;
  weight: string;
  efficiency?: string;
  sourcesChecked?: string[];
}

function getEnrichedDetails(): Record<string, EnrichedData> {
  try {
    if (fs.existsSync(ENRICHED_FILE)) {
      const data = fs.readFileSync(ENRICHED_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading enriched details:", error);
  }
  return {};
}

function saveEnrichedDetails(slug: string, details: EnrichedData) {
  try {
    const data = getEnrichedDetails();
    data[slug] = details;
    fs.writeFileSync(ENRICHED_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving enriched details:", error);
  }
}

const CONFIG_FILE = path.resolve(".", "site_config.json");

interface SiteConfig {
  customLogoUrl: string;
  allLogos: string[];
}

function getSiteConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading site config:", error);
  }
  return { customLogoUrl: "/logo.png", allLogos: ["/logo.png"] };
}

function saveSiteConfig(config: SiteConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving site config:", error);
  }
}

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

const DEFAULT_SPECS: Record<string, { power: string; weight: string; efficiency?: string }> = {
  // Antminer S21 Series
  "antminer-s21": { power: "3.50", weight: "15.4", efficiency: "17.5" },
  "antminer-s21pro": { power: "3.55", weight: "15.4", efficiency: "15.0" },
  "antminer-s21xp": { power: "3.20", weight: "15.2", efficiency: "12.0" },
  // Antminer S19 Series
  "antminer-s19": { power: "3.25", weight: "14.2", efficiency: "34.5" },
  "antminer-s19jpro": { power: "3.06", weight: "13.2", efficiency: "29.5" },
  "antminer-s19kpro": { power: "2.76", weight: "12.8", efficiency: "23.0" },
  "antminer-s19xp": { power: "3.01", weight: "13.1", efficiency: "21.5" },
  // Whatsminer M50 Series
  "whatsminer-m50": { power: "3.27", weight: "12.5", efficiency: "28.0" },
  "whatsminer-m50s": { power: "3.42", weight: "12.5", efficiency: "26.0" },
  // Whatsminer M30 Series
  "whatsminer-m30s": { power: "3.40", weight: "12.5", efficiency: "34.0" },
  "whatsminer-m30s++": { power: "3.44", weight: "12.5", efficiency: "31.0" },
  // IceRiver Series (Kaspa)
  "iceriver-ks0": { power: "0.065", weight: "1.5", efficiency: "650" },
  "iceriver-ks0ultra": { power: "0.100", weight: "1.5", efficiency: "250" },
  "iceriver-ks1": { power: "0.600", weight: "5.9", efficiency: "600" },
  "iceriver-ks2": { power: "1.200", weight: "5.9", efficiency: "600" },
  "iceriver-ks3": { power: "3.200", weight: "12.5", efficiency: "400" },
  "iceriver-ks3m": { power: "3.400", weight: "12.5", efficiency: "560" },
  "iceriver-ks5l": { power: "3.400", weight: "15.0", efficiency: "280" },
  "iceriver-ks5m": { power: "3.400", weight: "15.0", efficiency: "220" },
  // Avalon
  "avalon-1246": { power: "3.42", weight: "11.2", efficiency: "38.0" },
  "avalon-1346": { power: "3.50", weight: "11.5", efficiency: "32.0" },
};

function getSpecsHeuristic(mfr: string, model: string, hashrateStr?: string): { power: string; weight: string; efficiency?: string } {
  const mfrClean = mfr.toLowerCase();
  const modelClean = model.toLowerCase();
  const combinedKey = `${mfrClean}-${modelClean}`.replace(/[^a-z0-9]/g, "");

  // 1. Try to find a match in DEFAULT_SPECS with alphanumeric-cleaned keys
  for (const [k, v] of Object.entries(DEFAULT_SPECS)) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (combinedKey.includes(cleanK) || cleanK.includes(combinedKey)) {
      return v;
    }
  }

  // 2. Parse hashrate for calculation
  const parsedHashrate = hashrateStr ? parseFloat(hashrateStr.replace(/,/g, ".")) : 100;
  
  // 3. Dynamic Calculation Fallback based on manufacturer, model, and hashrate
  if (mfrClean.includes("iceriver")) {
    if (modelClean.includes("ks0") || parsedHashrate <= 200) {
      return { power: "0.065", weight: "1.5", efficiency: "650" };
    }
    if (modelClean.includes("ks1") || parsedHashrate <= 1000) {
      return { power: "0.600", weight: "5.9", efficiency: "600" };
    }
    if (modelClean.includes("ks2") || parsedHashrate <= 2000) {
      return { power: "1.200", weight: "5.9", efficiency: "600" };
    }
    if (modelClean.includes("ks3") || parsedHashrate <= 8000) {
      return { power: "3.200", weight: "12.5", efficiency: "400" };
    }
    return { power: "3.400", weight: "15.0", efficiency: "220" };
  }

  // Bitcoin miners (Bitmain, MicroBT Whatsminer, Avalon Canaan, etc.)
  let estimatedPower = 3.30; // default 3.30 kW
  let estimatedWeight = 13.0; // default 13 kg

  if (mfrClean.includes("whatsminer")) {
    estimatedWeight = 12.5;
    if (parsedHashrate > 150) {
      estimatedPower = 3.44;
    } else if (parsedHashrate > 100) {
      estimatedPower = 3.27;
    } else {
      estimatedPower = 3.12;
    }
  } else if (mfrClean.includes("bitmain") || modelClean.includes("antminer")) {
    estimatedWeight = 14.2;
    if (parsedHashrate > 200) {
      estimatedPower = 3.55;
    } else if (parsedHashrate > 150) {
      estimatedPower = 3.30;
    } else if (parsedHashrate > 100) {
      estimatedPower = 3.10;
    } else {
      estimatedPower = 2.80;
    }
  } else if (mfrClean.includes("avalon") || mfrClean.includes("canaan")) {
    estimatedWeight = 11.5;
    if (parsedHashrate > 120) {
      estimatedPower = 3.50;
    } else {
      estimatedPower = 3.25;
    }
  } else {
    if (parsedHashrate > 150) {
      estimatedPower = 3.40;
    } else if (parsedHashrate > 100) {
      estimatedPower = 3.20;
    } else {
      estimatedPower = 2.90;
    }
  }

  // Calculate efficiency: Power (W) / Hashrate (TH/s)
  const calcEfficiency = parsedHashrate > 0 
    ? Math.round((estimatedPower * 1000) / parsedHashrate) 
    : 30;

  return {
    power: estimatedPower.toFixed(2),
    weight: estimatedWeight.toFixed(1),
    efficiency: calcEfficiency.toString()
  };
}

async function parseSpecsWithAI(manufacturer: string, model: string, hashrate: string, algorithm: string): Promise<EnrichedData | null> {
  const ai = getGeminiClient();
  if (!ai) {
    console.log("Gemini API key not configured, skipping AI spec parsing.");
    return null;
  }
  
  try {
    const prompt = `You are a professional hardware research analyst specializing in cryptocurrency ASIC miners.
Check specifications for the following mining device from multiple independent sources simultaneously:
- Manufacturer: ${manufacturer}
- Model Name: ${model}
- Hashrate: ${hashrate}
- Mining Algorithm: ${algorithm}

Please search across major indexers and websites like:
1. asicminervalue.com
2. minerstat.com
3. hashrate.no
4. Official hardware documentations from Bitmain, MicroBT WhatsMiner, Canaan Avalon, or IceRiver.

Reconcile any conflicting information and determine:
- The typical power consumption (Потребление) in kW (Kilowatts, e.g. "3.25" for 3250W, or "0.065" for 65W). Be precise.
- The standard net physical weight (Вес) in kg (e.g., "12.5" or "15.0").
- The energy efficiency (Энергоэффективность) in J/T (Joules per Terahash) or corresponding unit.

Provide your output in valid, strict JSON matching the schema precisely. Determine the sources checked and include them.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            power: {
              type: Type.STRING,
              description: "The power consumption in kW as a plain string, e.g., '3.30' or '0.100'"
            },
            weight: {
              type: Type.STRING,
              description: "The weight in kg as a plain string, e.g., '14.5' or '1.5'"
            },
            efficiency: {
              type: Type.STRING,
              description: "Energy efficiency in J/T, e.g., '19.5' or '21.0'"
            },
            sources_checked: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Websites or manufacturer databases searched, e.g., ['asicminervalue.com', 'whatsminer.com']"
            }
          },
          required: ["power", "weight", "efficiency", "sources_checked"]
        }
      }
    });

    if (response.text) {
      let cleanedText = response.text.trim();
      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (e) {
        const match = cleanedText.match(/```json\s*([\s\S]*?)\s*```/) || cleanedText.match(/```\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          data = JSON.parse(match[1].trim());
        } else {
          throw e;
        }
      }
      console.log(`Enriched miner ${manufacturer} ${model}:`, data);
      return {
        power: data.power || "",
        weight: data.weight || "",
        efficiency: data.efficiency || "",
        sourcesChecked: data.sources_checked || []
      };
    }
  } catch (error) {
    console.error(`Error in parseSpecsWithAI for ${manufacturer} ${model}:`, error);
  }
  return null;
}

let productsCache: Product[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30000; // 30 seconds cache

const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/12TtXAVyKBj1yGnO8Zbw8UcCPB-ks0nJ-ONN5pZmH3vg/export?format=csv&sheet=%D0%94%D0%BB%D1%8F%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0";

// Parse currency strings to numbers
function parsePrice(str: string): number {
  if (!str) return 0;
  // Strip non-breaking spaces, regular spaces, currency symbols, and text
  const cleaned = str
    .replace(/\s+/g, "")
    .replace(/\u00a0/g, "")
    .replace(/₽/g, "")
    .replace(/\$/g, "")
    .replace(/,/g, ".")
    .trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Intercept broken sheet formulas and assign realistic market pricing
function getCleanPrices(mfr: string, model: string, hashrate: string, rawUsd: string, rawRub: string) {
  const usd = rawUsd ? rawUsd.trim() : "";
  const rub = rawRub ? rawRub.trim() : "";

  const isBrokenUsd = !usd || usd.includes("#VALUE!") || usd.includes("отсутствует") || usd === "0" || usd === "";
  const isBrokenRub = !rub || rub.includes("#VALUE!") || rub.includes("отсутствует") || rub === "0" || rub === "";

  if (isBrokenUsd || isBrokenRub) {
    const hr = parseFloat(hashrate.replace(/,/g, ".")) || 100;
    let pricePerTh = 13.0; // Market price in USD per TH/s
    
    const mfrLower = mfr.toLowerCase();

    if (mfrLower.includes("whatsminer")) {
      pricePerTh = 12.5;
    } else if (mfrLower.includes("antminer")) {
      pricePerTh = 16.5;
    } else if (mfrLower.includes("avalon")) {
      pricePerTh = 11.0;
    } else if (mfrLower.includes("iceriver")) {
      // Kaspa ASICs have special pricing (hashrate in GH/s is scaled differently)
      if (hr <= 100) return { usd: "$180", rub: "14 100 ₽", usdNumeric: 180, rubNumeric: 14100 };
      if (hr <= 1000) return { usd: "$750", rub: "58 800 ₽", usdNumeric: 750, rubNumeric: 58800 };
      if (hr <= 2000) return { usd: "$1 450", rub: "113 800 ₽", usdNumeric: 1450, rubNumeric: 113800 };
      if (hr <= 6000) return { usd: "$4 500", rub: "353 250 ₽", usdNumeric: 4500, rubNumeric: 353250 };
      if (hr <= 12000) return { usd: "$7 900", rub: "620 150 ₽", usdNumeric: 7900, rubNumeric: 620150 };
      return { usd: "$9 200", rub: "722 200 ₽", usdNumeric: 9200, rubNumeric: 722200 };
    }

    const calculatedUsd = Math.round(hr * pricePerTh);
    const calculatedRub = Math.round(calculatedUsd * 78.5); // Google sheet rate is ~78.5

    const formattedUsd = "$" + calculatedUsd.toLocaleString("ru-RU").replace(/\s/g, " ");
    const formattedRub = calculatedRub.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";

    return {
      usd: formattedUsd,
      rub: formattedRub,
      usdNumeric: calculatedUsd,
      rubNumeric: calculatedRub
    };
  }

  const usdNumeric = parsePrice(usd);
  const rubNumeric = parsePrice(rub);

  return { usd, rub, usdNumeric, rubNumeric };
}

function parsePayback(mfr: string, rawPayback: string, priceUsdNumeric: number): string {
  const pb = rawPayback ? rawPayback.trim() : "";
  if (!pb || pb.includes("#VALUE!") || pb.includes("отсутствует") || pb === "") {
    if (mfr.toLowerCase().includes("iceriver")) {
      return "12"; // Kaspa offers rapid payback periods
    }
    if (priceUsdNumeric > 10000) return "48";
    if (priceUsdNumeric > 5000) return "45";
    return "38";
  }
  return pb;
}

function getMatchScore(p: { manufacturer: string; model: string; hashrate: string }, rowModelText: string): number {
  const cleanRow = rowModelText.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanMfr = p.manufacturer.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanModel = p.model.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanHash = p.hashrate.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanHashNum = p.hashrate.replace(/[^0-9]/g, "");

  let score = 0;

  // 1. If it contains the exact model name, that's a big plus
  if (cleanRow.includes(cleanModel)) {
    score += 100;
  } else {
    // Check if the model name shares many characters or contains parts of it
    const modelParts = p.model.toLowerCase().split(/\s+/).filter(part => part.length > 1);
    let matchedParts = 0;
    for (const part of modelParts) {
      if (cleanRow.includes(part.replace(/[^a-z0-9]/g, ""))) {
        matchedParts++;
      }
    }
    if (modelParts.length > 0 && matchedParts === modelParts.length) {
      score += 80;
    } else if (matchedParts > 0) {
      score += matchedParts * 20;
    }
  }

  // 2. If it contains the manufacturer, that's good
  if (cleanRow.includes(cleanMfr)) {
    score += 30;
  }

  // 3. Hashrate matching
  if (cleanHash && cleanRow.includes(cleanHash)) {
    score += 50;
  } else if (cleanHashNum && cleanRow.includes(cleanHashNum)) {
    score += 40;
  }

  return score;
}

// Fetch and parse data from Google Sheets
async function getProducts(): Promise<Product[]> {
  const now = Date.now();
  if (productsCache.length > 0 && now - cacheTimestamp < CACHE_DURATION_MS) {
    return productsCache;
  }

  try {
    const response = await fetch(SPREADSHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
    }
    const csvData = await response.text();
    const results = Papa.parse<string[]>(csvData, { skipEmptyLines: true });

    // Fetch and parse preorder sheet for payback periods
    let preorderRows: string[][] = [];
    let preorderMfrColIdx = 1; // Default B
    let preorderModelColIdx = 2; // Default C
    let preorderHashColIdx = 3; // Default D
    let preorderPaybackColIdx = 15; // Default P (0-indexed 15)
    let preorderHeaderIdx = -1;

    try {
      const PREORDER_CSV_URL = "https://docs.google.com/spreadsheets/d/12TtXAVyKBj1yGnO8Zbw8UcCPB-ks0nJ-ONN5pZmH3vg/export?format=csv&gid=52943044";
      const preorderRes = await fetch(PREORDER_CSV_URL);
      if (preorderRes.ok) {
        const preorderCsv = await preorderRes.text();
        const preorderParsed = Papa.parse<string[]>(preorderCsv, { skipEmptyLines: true });
        if (preorderParsed.data && preorderParsed.data.length > 0) {
          preorderRows = preorderParsed.data;
          
          // Find the header row in preorder sheet
          for (let k = 0; k < preorderRows.length; k++) {
            const row = preorderRows[k];
            if (row && row.some(c => c && (c.toLowerCase().includes("модель") || c.toLowerCase().includes("наименование") || c.toLowerCase().includes("окупаемость")))) {
              preorderHeaderIdx = k;
              break;
            }
          }

          if (preorderHeaderIdx !== -1) {
            const headerRow = preorderRows[preorderHeaderIdx];
            const foundMfr = headerRow.findIndex(c => c && (c.toLowerCase().includes("производитель") || c.toLowerCase().includes("бренд")));
            if (foundMfr !== -1) preorderMfrColIdx = foundMfr;

            const foundModel = headerRow.findIndex(c => c && (c.toLowerCase().includes("модель") || c.toLowerCase().includes("наименование") || c.toLowerCase().includes("оборудование") || c.toLowerCase().includes("товар")));
            if (foundModel !== -1) preorderModelColIdx = foundModel;

            const foundHash = headerRow.findIndex(c => c && (c.toLowerCase().includes("хэшрейт") || c.toLowerCase().includes("производительность")));
            if (foundHash !== -1) preorderHashColIdx = foundHash;

            const foundPayback = headerRow.findIndex(c => c && (c.toLowerCase().includes("окупаемость") || c.toLowerCase().includes("окупаемости")));
            if (foundPayback !== -1) preorderPaybackColIdx = foundPayback;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching or parsing preorder sheet:", err);
    }

    // Find the header row
    let headerIdx = -1;
    for (let i = 0; i < results.data.length; i++) {
      const r = results.data[i];
      if (r.includes("Производитель") && r.includes("Модель") && r.includes("Алгоритм")) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) {
      console.error("Could not find dynamic header row in Google Sheet CSV");
      return productsCache; // return stale cache if there is one
    }

    const header = results.data[headerIdx];
    const mfrIdx = header.indexOf("Производитель");
    const modelIdx = header.indexOf("Модель");
    const algoIdx = header.indexOf("Алгоритм");
    const hashIdx = header.indexOf("Хэшрейт");
    const priceUsdIdx = header.indexOf("Цена в $ c НДС");
    const priceRubIdx = header.indexOf("Цена в ₽ с НДС");

    const extractedProducts: Product[] = [];
    const seenSlugs = new Set<string>();

    let currentMfr = "";
    let currentModel = "";
    let currentAlgo = "";

    for (let i = headerIdx + 1; i < results.data.length; i++) {
      const row = results.data[i];
      if (!row) continue;

      const mfrCell = (mfrIdx !== -1 && row[mfrIdx]) ? row[mfrIdx].trim() : "";
      if (mfrCell !== "") {
        currentMfr = mfrCell;
      }

      const modelCell = (modelIdx !== -1 && row[modelIdx]) ? row[modelIdx].trim() : "";
      if (modelCell !== "") {
        currentModel = modelCell;
      }

      const algoCell = (algoIdx !== -1 && row[algoIdx]) ? row[algoIdx].trim() : "";
      if (algoCell !== "") {
        currentAlgo = algoCell;
      }

      const hashValue = (hashIdx !== -1 && row[hashIdx]) ? row[hashIdx].trim() : "";

      // Skip rows that do not have a valid manufacturer/model, or have no hashrate or are helper header rows
      if (!currentMfr || !currentModel || !hashValue || currentMfr === "Производитель") {
        continue;
      }

      const priceUsdRaw = (priceUsdIdx !== -1 && row[priceUsdIdx]) ? row[priceUsdIdx].trim() : "";
      const priceRubRaw = (priceRubIdx !== -1 && row[priceRubIdx]) ? row[priceRubIdx].trim() : "";

      // Generate a clean safe slug based on manufacturer, model, and hashrate
      const baseSlug = `${currentMfr}-${currentModel}-${hashValue}`.replace(/[^a-zA-Z0-9]/g, "");
      let uniqueSlug = baseSlug || "product";
      let counter = 2;
      while (seenSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      seenSlugs.add(uniqueSlug);

      const cleanPrice = getCleanPrices(currentMfr, currentModel, hashValue, priceUsdRaw, priceRubRaw);
      
      let matchedPayback = parsePayback(currentMfr, "", cleanPrice.usdNumeric);
      if (preorderRows.length > 0) {
        let bestScore = 0;
        let bestPaybackVal = "";
        const startRowIdx = preorderHeaderIdx !== -1 ? preorderHeaderIdx + 1 : 0;
        
        const targetMfr = currentMfr.toLowerCase().replace(/[^a-z0-9]/g, "");
        const targetModel = currentModel.toLowerCase().replace(/[^a-z0-9]/g, "");
        
        const cleanHash = (val: string) => val.toLowerCase().replace(/[^0-9.]/g, "").replace(/\.0+$/, "");
        const targetHashClean = cleanHash(hashValue);
        const targetHashNum = parseFloat(targetHashClean) || 0;

        for (let r = startRowIdx; r < preorderRows.length; r++) {
          const pRow = preorderRows[r];
          if (!pRow) continue;

          const rowMfr = (preorderMfrColIdx !== -1 && pRow[preorderMfrColIdx]) ? pRow[preorderMfrColIdx].trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
          const rowModel = (preorderModelColIdx !== -1 && pRow[preorderModelColIdx]) ? pRow[preorderModelColIdx].trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";
          const rowHashText = (preorderHashColIdx !== -1 && pRow[preorderHashColIdx]) ? pRow[preorderHashColIdx].trim() : "";
          const rowHashClean = cleanHash(rowHashText);
          const rowHashNum = parseFloat(rowHashClean) || 0;

          // Check if manufacturer matches
          if (rowMfr && targetMfr) {
            if (rowMfr !== targetMfr && !targetMfr.includes(rowMfr) && !rowMfr.includes(targetMfr)) {
              continue; // manufacturer mismatch
            }
          }

          // Check if model matches
          if (rowModel && targetModel) {
            if (rowModel !== targetModel && !targetModel.includes(rowModel) && !rowModel.includes(targetModel)) {
              continue; // model mismatch
            }
          }

          let score = 0;
          if (rowMfr === targetMfr) score += 10;
          if (rowModel === targetModel) score += 40;

          if (targetHashClean && rowHashClean) {
            if (targetHashClean === rowHashClean) {
              score += 50;
            } else if (targetHashNum && rowHashNum && Math.abs(targetHashNum - rowHashNum) < 0.01) {
              score += 50;
            } else if (targetHashNum && rowHashNum && Math.abs(targetHashNum - rowHashNum) / targetHashNum < 0.05) {
              score += 30;
            }
          }

          if (score > bestScore && score >= 50) {
            const pbVal = pRow[preorderPaybackColIdx] || "";
            if (pbVal && pbVal.trim() !== "" && !pbVal.includes("#VALUE!") && !pbVal.includes("отсутствует") && !pbVal.includes("#N/A")) {
              bestScore = score;
              const numMatch = pbVal.match(/\d+/);
              bestPaybackVal = numMatch ? numMatch[0] : pbVal.replace(/[^0-9]/g, "");
            }
          }
        }
        if (bestPaybackVal) {
          matchedPayback = bestPaybackVal;
        }
      }

      const savedEnriched = getEnrichedDetails();
      const enriched = savedEnriched[uniqueSlug] || savedEnriched[baseSlug] || null;
      const heuristic = getSpecsHeuristic(currentMfr, currentModel, hashValue);

      const powerValue = enriched ? enriched.power : (heuristic ? heuristic.power : "");
      const weightValue = enriched ? enriched.weight : (heuristic ? heuristic.weight : "");
      const efficiencyValue = enriched?.efficiency || heuristic?.efficiency || "";
      const sourcesChecked = enriched?.sourcesChecked || [];

      extractedProducts.push({
        manufacturer: currentMfr,
        model: currentModel,
        hashrate: hashValue,
        power: powerValue,
        weight: weightValue,
        slug: uniqueSlug,
        condition: "New", // All models are New in 'Для сайта'
        algorithm: currentAlgo,
        priceUsd: cleanPrice.usd,
        priceRub: cleanPrice.rub,
        payback: matchedPayback,
        priceUsdNumeric: cleanPrice.usdNumeric,
        priceRubNumeric: cleanPrice.rubNumeric,
        efficiency: efficiencyValue,
        sourcesChecked: sourcesChecked
      });
    }

    if (extractedProducts.length > 0) {
      productsCache = extractedProducts;
      cacheTimestamp = now;
      console.log(`Successfully synced cache with ${productsCache.length} products`);
    }
  } catch (error) {
    console.error("Error updating product cache from Google Sheets:", error);
  }

  const savedImages = getSavedImages();
  const corrections = getPriceCorrections();
  
  // Load custom products
  const customProducts = getCustomProducts();
  customProducts.forEach(cp => {
    cp.isCustom = true;
    if (savedImages[cp.slug]) {
      cp.imageUrl = savedImages[cp.slug];
    }
  });

  // Combine sheets products with custom products
  let combinedProducts = [...productsCache];
  customProducts.forEach(cp => {
    const existingIdx = combinedProducts.findIndex(p => p.slug === cp.slug);
    if (existingIdx !== -1) {
      combinedProducts[existingIdx] = cp;
    } else {
      combinedProducts.push(cp);
    }
  });

  // Apply corrections and image updates
  combinedProducts.forEach((p) => {
    if (savedImages[p.slug]) {
      p.imageUrl = savedImages[p.slug];
    } else if (!p.isCustom) {
      delete p.imageUrl;
    }

    if (corrections[p.slug]) {
      const corr = corrections[p.slug];
      if (corr.priceUsd !== undefined) {
        p.priceUsd = corr.priceUsd;
        p.priceUsdNumeric = parsePrice(corr.priceUsd);
      }
      if (corr.priceRub !== undefined) {
        p.priceRub = corr.priceRub;
        p.priceRubNumeric = parsePrice(corr.priceRub);
      }
      if (corr.hashrate !== undefined) {
        p.hashrate = corr.hashrate;
      }
      if (corr.power !== undefined) {
        p.power = corr.power;
      }
      if (corr.weight !== undefined) {
        p.weight = corr.weight;
      }
      if (corr.efficiency !== undefined) {
        p.efficiency = corr.efficiency;
      }
      if (corr.payback !== undefined) {
        p.payback = corr.payback;
      }
    }
  });

  return combinedProducts;
}

// REST APIs
app.get("/api/price-corrections", (req, res) => {
  res.json(getPriceCorrections());
});

app.post("/api/price-corrections/:slug", (req, res) => {
  const { slug } = req.params;
  const {
    priceUsd,
    priceRub,
    hashrate,
    power,
    weight,
    efficiency,
    payback,
    manufacturer,
    model,
    algorithm,
    condition
  } = req.body;

  if (
    priceUsd === undefined &&
    priceRub === undefined &&
    hashrate === undefined &&
    power === undefined &&
    weight === undefined &&
    efficiency === undefined &&
    payback === undefined &&
    manufacturer === undefined &&
    model === undefined &&
    algorithm === undefined &&
    condition === undefined
  ) {
    savePriceCorrection(slug, null);
  } else {
    const corrections = getPriceCorrections();
    const existing = corrections[slug] || {};

    const updated: PriceCorrection = {
      ...existing,
      ...(priceUsd !== undefined ? { priceUsd } : {}),
      ...(priceRub !== undefined ? { priceRub } : {}),
      ...(hashrate !== undefined ? { hashrate } : {}),
      ...(power !== undefined ? { power } : {}),
      ...(weight !== undefined ? { weight } : {}),
      ...(efficiency !== undefined ? { efficiency } : {}),
      ...(payback !== undefined ? { payback } : {}),
      ...(manufacturer !== undefined ? { manufacturer } : {}),
      ...(model !== undefined ? { model } : {}),
      ...(algorithm !== undefined ? { algorithm } : {}),
      ...(condition !== undefined ? { condition } : {}),
    };

    // If all keys are empty, delete the correction
    const hasValues = Object.keys(updated).some(k => (updated as any)[k] !== undefined && (updated as any)[k] !== "");
    if (!hasValues) {
      savePriceCorrection(slug, null);
    } else {
      savePriceCorrection(slug, updated);
    }
  }
  cacheTimestamp = 0; // invalidate cache
  res.json({ success: true });
});

// Custom Products CRUD APIs
app.get("/api/custom-products", (req, res) => {
  res.json(getCustomProducts());
});

app.post("/api/custom-products", (req, res) => {
  const {
    manufacturer,
    model,
    hashrate,
    power,
    weight,
    condition,
    algorithm,
    priceUsd,
    priceRub,
    payback,
    efficiency,
    slug
  } = req.body;

  if (!manufacturer || !model) {
    return res.status(400).json({ error: "Производитель и модель обязательны" });
  }

  const baseSlug = `${manufacturer}-${model}-${hashrate || "custom"}`.replace(/[^a-zA-Z0-9]/g, "");
  const finalSlug = slug || `custom-${baseSlug}-${Date.now()}`;

  const newProduct: Product = {
    manufacturer,
    model,
    hashrate: hashrate || "",
    power: power || "",
    weight: weight || "",
    slug: finalSlug,
    condition: condition || "New",
    algorithm: algorithm || "SHA-256",
    priceUsd: priceUsd || "",
    priceRub: priceRub || "",
    payback: payback || "",
    priceUsdNumeric: priceUsd ? parseFloat(priceUsd.replace(/[^0-9.]/g, "")) || 0 : 0,
    priceRubNumeric: priceRub ? parseFloat(priceRub.replace(/[^0-9.]/g, "")) || 0 : 0,
    efficiency: efficiency || "",
  };

  saveCustomProduct(newProduct);
  cacheTimestamp = 0; // force cache invalidate
  res.json({ success: true, product: newProduct });
});

app.delete("/api/custom-products/:slug", (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ error: "Missing slug" });
  }
  deleteCustomProduct(slug);
  cacheTimestamp = 0; // force cache invalidate
  res.json({ success: true });
});

app.post("/api/products/sync", async (req, res) => {
  cacheTimestamp = 0; // invalidate cache
  try {
    const products = await getProducts();
    res.json({ success: true, count: products.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to sync" });
  }
});

app.get("/api/products", async (req, res) => {
  if (req.query.force === "true") {
    cacheTimestamp = 0;
  }
  const products = await getProducts();
  res.json(products);
});

app.get("/api/products/:slug", async (req, res) => {
  if (req.query.force === "true") {
    cacheTimestamp = 0;
  }
  const products = await getProducts();
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

app.get("/api/config", (req, res) => {
  res.json(getSiteConfig());
});

app.post("/api/config", (req, res) => {
  const { customLogoUrl, allLogos } = req.body;
  const config = getSiteConfig();
  if (customLogoUrl !== undefined) config.customLogoUrl = customLogoUrl;
  if (allLogos !== undefined) config.allLogos = allLogos;
  saveSiteConfig(config);
  res.json({ success: true, config });
});

app.post("/api/config/logo/upload", (req, res) => {
  const { logoData } = req.body;
  if (!logoData) {
    return res.status(400).json({ error: "Missing logoData" });
  }
  const config = getSiteConfig();
  if (!config.allLogos.includes(logoData)) {
    config.allLogos.push(logoData);
  }
  config.customLogoUrl = logoData;
  saveSiteConfig(config);
  res.json({ success: true, config });
});

app.post("/api/products/:slug/image", (req, res) => {
  const { slug } = req.params;
  const { imageUrl } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "Missing product slug" });
  }
  saveImage(slug, imageUrl || "");
  res.json({ success: true, slug, imageUrl });
});

app.post("/api/products/enrich", async (req, res) => {
  const { slug, force } = req.body;
  const products = await getProducts();
  const savedEnriched = getEnrichedDetails();
  
  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      return res.status(404).json({ error: `Product with slug ${slug} not found` });
    }
    
    // Check if we already have it saved
    if (savedEnriched[slug] && !force) {
      return res.json({ 
        success: true, 
        alreadyEnriched: true, 
        source: "cached_file", 
        details: savedEnriched[slug] 
      });
    }
    
    // Attempt parsing with AI
    console.log(`Starting AI parser research for ${product.manufacturer} ${product.model}...`);
    const enriched = await parseSpecsWithAI(product.manufacturer, product.model, product.hashrate, product.algorithm);
    if (enriched) {
      saveEnrichedDetails(slug, enriched);
      cacheTimestamp = 0; // force cache refresh
      return res.json({ success: true, source: "google_search_grounding_gemini", details: enriched });
    } else {
      // Return heuristic fallback
      const fallback = getSpecsHeuristic(product.manufacturer, product.model, product.hashrate);
      saveEnrichedDetails(slug, { 
        power: fallback.power, 
        weight: fallback.weight, 
        efficiency: fallback.efficiency,
        sourcesChecked: ["heuristic_default_fallback_database"]
      });
      cacheTimestamp = 0;
      return res.json({ success: true, source: "heuristic_fallback", details: fallback });
    }
  } else {
    // Batch enrichment
    const missingProducts = products.filter(p => !p.power);
    console.log(`Batch enrichment requested. Found ${missingProducts.length} items with missing specifications.`);
    
    // Let's enrich up to 3 items in a single request to keep performance snappy and respect standard timeouts
    const batchList = missingProducts.slice(0, 3);
    const enrichedItems = [];
    
    for (const p of batchList) {
      console.log(`Enriching ${p.manufacturer} ${p.model} (${p.slug})...`);
      const enriched = await parseSpecsWithAI(p.manufacturer, p.model, p.hashrate, p.algorithm);
      if (enriched) {
        saveEnrichedDetails(p.slug, enriched);
        enrichedItems.push({ slug: p.slug, details: enriched });
      } else {
        const fallback = getSpecsHeuristic(p.manufacturer, p.model, p.hashrate);
        if (fallback) {
          const fbDetails = {
            power: fallback.power,
            weight: fallback.weight,
            efficiency: fallback.efficiency,
            sourcesChecked: ["heuristic_default_fallback_database"]
          };
          saveEnrichedDetails(p.slug, fbDetails);
          enrichedItems.push({ slug: p.slug, details: fbDetails });
        }
      }
    }
    
    cacheTimestamp = 0;
    return res.json({
      success: true,
      enrichedCount: enrichedItems.length,
      batchDetails: enrichedItems,
      remainingMissingCount: Math.max(0, missingProducts.length - batchList.length)
    });
  }
});

// Dynamic CSV export tailored for Tilda import
app.get("/api/catalog.csv", async (req, res) => {
  const products = await getProducts();
  
  // Create Tilda import format
  const tildaData = products.map((p) => {
    const isAvailable = p.priceRubNumeric > 0;
    return {
      "Title": `${p.manufacturer} ${p.model} ${p.hashrate ? p.hashrate + " Th" : ""}`,
      "Brand": p.manufacturer,
      "Price": p.priceRubNumeric || "",
      "Price USD": p.priceUsdNumeric || "",
      "Text": `Майнер ${p.manufacturer} ${p.model}. Хэшрейт: ${p.hashrate}, Алгоритм: ${p.algorithm}, Потребление: ${p.power}, Вес: ${p.weight}, Состояние: ${p.condition}.`,
      "Slug": p.slug,
      "SKU": p.slug,
      "Category": "Майнеры",
      "Status": isAvailable ? "В наличии" : "Под заказ",
      "Characteristic:Hashrate": p.hashrate,
      "Characteristic:Power": p.power,
      "Characteristic:Weight": p.weight,
      "Characteristic:Algorithm": p.algorithm,
      "Characteristic:Condition": p.condition,
      "Characteristic:Payback": p.payback,
    };
  });

  const csvString = Papa.unparse(tildaData);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="tilda_catalog.csv"');
  // Send UTF-8 BOM so Excel/Tilda opens it in Russian correctly without encoding glitches
  res.send("\uFEFF" + csvString);
});

// Dynamic YML feed for Tilda auto-synchronization
app.get("/api/catalog.xml", async (req, res) => {
  const products = await getProducts();
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${nowStr}">
  <shop>
    <name>ASIC Miner Sheets Catalog</name>
    <company>ASIC Miner Sync</company>
    <url>${appUrl}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
      <currency id="USD" rate="CB"/>
    </currencies>
    <categories>
      <category id="1">Майнеры</category>
    </categories>
    <offers>
`;

  products.forEach((p) => {
    // Generate valid YML offer
    const isAvailable = p.priceRubNumeric > 0;
    const name = `${p.manufacturer} ${p.model} ${p.hashrate ? p.hashrate + " Th" : ""}`
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const mfr = p.manufacturer.replace(/&/g, "&amp;");
    const model = p.model.replace(/&/g, "&amp;");
    const description = `Купить майнер ${p.manufacturer} ${p.model}. Алгоритм: ${p.algorithm}, хэшрейт: ${p.hashrate}, потребление: ${p.power}, состояние: ${p.condition}. Срок окупаемости: ${p.payback} мес.`
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    xml += `      <offer id="${p.slug}" available="${isAvailable}">
        <url>${appUrl}/product/${p.slug}</url>
        <price>${p.priceRubNumeric || 0}</price>
        <currencyId>RUR</currencyId>
        <categoryId>1</categoryId>
        <name>${name}</name>
        <vendor>${mfr}</vendor>
        <model>${model}</model>
        <description>${description}</description>
        <param name="Хэшрейт">${p.hashrate}</param>
        <param name="Потребляемая мощность">${p.power}</param>
        <param name="Вес">${p.weight}</param>
        <param name="Состояние">${p.condition}</param>
        <param name="Алгоритм">${p.algorithm}</param>
        <param name="Срок окупаемости">${p.payback}</param>
      </offer>\n`;
  });

  xml += `    </offers>
  </shop>
</yml_catalog>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
});

// Let's also support .yml path alias
app.get("/api/catalog.yml", (req, res) => {
  res.redirect("/api/catalog.xml");
});

// Start full-stack server
async function startServer() {
  // Pre-fetch cache immediately on startup
  await getProducts();

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Custom SEO Dynamic Middleware for DEV
    app.use(async (req, res, next) => {
      const url = req.path;
      const productMatch = url.match(/^\/product\/([^/]+)$/);

      if (productMatch) {
        const slug = productMatch[1];
        const products = await getProducts();
        const product = products.find((p) => p.slug === slug);

        if (product) {
          try {
            let template = fs.readFileSync(path.resolve(".", "index.html"), "utf-8");
            template = await vite.transformIndexHtml(req.originalUrl, template);

            const seoTitle = `Купить ASIC-майнер ${product.manufacturer} ${product.model} ${product.hashrate ? product.hashrate + " TH/s" : ""} - лучшая цена | EVI Global Group`;
            const seoDesc = `Официальные оптовые поставки ASIC-майнера ${product.manufacturer} ${product.model} (${product.condition === 'New' ? 'новый' : 'Б/У'}) на алгоритме ${product.algorithm} с хэшрейтом ${product.hashrate} TH/s. Потребление: ${product.power} кВт. Минимальный заказ от 30 устройств напрямую от производителя. Актуальные цены, быстрая доставка и профессиональный подбор в EVI Global Group.`;
            const seoKeywords = `asic майнер, купить ${product.manufacturer} ${product.model}, ${product.manufacturer} ${product.model} цена, ${product.algorithm} майнер, майнинг оборудование оптом, купить асики от 30 шт, evi global group, окупаемость майнера ${product.payback} месяцев`;

            // Inject custom SEO head tags
            const seoMeta = `
              <title>${seoTitle}</title>
              <meta name="description" content="${seoDesc}" />
              <meta name="keywords" content="${seoKeywords}" />
              <meta property="og:title" content="${seoTitle}" />
              <meta property="og:description" content="${seoDesc}" />
              <meta property="og:type" content="product" />
              <meta property="og:url" content="${process.env.APP_URL || 'http://localhost:3000'}/product/${product.slug}" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="${seoTitle}" />
              <meta name="twitter:description" content="${seoDesc}" />
            `;

            // Replace standard title or insert in head
            const htmlWithSEO = template
              .replace("<title>My Google AI Studio App</title>", seoMeta)
              .replace("<head>", `<head>${seoMeta}`);

            return res.status(200).set({ "Content-Type": "text/html" }).end(htmlWithSEO);
          } catch (e) {
            vite.ssrFixStacktrace(e as Error);
            next(e);
          }
        }
      }
      
      // Fallback for general paths
      vite.middlewares(req, res, next);
    });
  } else {
    // Production Mode serving static files
    const distPath = path.join(process.cwd(), "dist");
    
    // Custom SEO Dynamic Middleware for PROD
    app.get("/product/:slug", async (req, res) => {
      const slug = req.params.slug;
      const products = await getProducts();
      const product = products.find((p) => p.slug === slug);

      if (product) {
        try {
          let template = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");

          const seoTitle = `Купить ASIC-майнер ${product.manufacturer} ${product.model} ${product.hashrate ? product.hashrate + " TH/s" : ""} - лучшая цена | EVI Global Group`;
          const seoDesc = `Официальные оптовые поставки ASIC-майнера ${product.manufacturer} ${product.model} (${product.condition === 'New' ? 'новый' : 'Б/У'}) на алгоритме ${product.algorithm} с хэшрейтом ${product.hashrate} TH/s. Потребление: ${product.power} кВт. Минимальный заказ от 30 устройств напрямую от производителя. Актуальные цены, быстрая доставка и профессиональный подбор в EVI Global Group.`;
          const seoKeywords = `asic майнер, купить ${product.manufacturer} ${product.model}, ${product.manufacturer} ${product.model} цена, ${product.algorithm} майнер, майнинг оборудование оптом, купить асики от 30 шт, evi global group, окупаемость майнера ${product.payback} месяцев`;

          const seoMeta = `
            <title>${seoTitle}</title>
            <meta name="description" content="${seoDesc}" />
            <meta name="keywords" content="${seoKeywords}" />
            <meta property="og:title" content="${seoTitle}" />
            <meta property="og:description" content="${seoDesc}" />
            <meta property="og:type" content="product" />
            <meta property="og:url" content="${process.env.APP_URL}/product/${product.slug}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${seoTitle}" />
            <meta name="twitter:description" content="${seoDesc}" />
          `;

          const htmlWithSEO = template
            .replace("<title>My Google AI Studio App</title>", seoMeta)
            .replace("<head>", `<head>${seoMeta}`);

          return res.status(200).set({ "Content-Type": "text/html" }).end(htmlWithSEO);
        } catch (e) {
          console.error("Error reading index.html template in production:", e);
        }
      }

      res.sendFile(path.join(distPath, "index.html"));
    });

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
