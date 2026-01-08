/**
 * Financial data utility for BRICS Unit Tracker
 * Tracks Gold and BRICS currencies: BRL, RUB, INR, CNY, ZAR
 */

export interface HistoricalDataPoint {
  date: string;
  gold: number | null;
  // BRICS
  brl: number | null;
  rub: number | null;
  inr: number | null;
  cny: number | null;
  zar: number | null;
  // SDR extra
  usd: number | null; 
  eur: number | null;
  jpy: number | null;
  gbp: number | null;
}

export interface SyntheticIndexPoint {
  date: string;
  unitValue: number;
  goldValue: number;
  usdValue: number;
  change: number;
}

/**
 * Simple deterministic pseudo-random function
 */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

import cachedData from '../data/macro-data.json';

/**
 * Generates or retrieves historical data
 * Historical view back to 1990 (Weekly)
 */
export function getMockHistoricalData(): HistoricalDataPoint[] {
  // If we have cached data from FRED/Stooq, use it!
  if (cachedData && cachedData.length > 0) {
    return cachedData as HistoricalDataPoint[];
  }

  // Fallback to deterministic mock data (Weekly, since 1990)
  const data: HistoricalDataPoint[] = [];
  const startGold = 400; // Gold was around $400 in 1990
  const startCurrencies = {
    brl: 1.0, // Actually Cruzado/Real transitions, but let's mock stability
    rub: 0.6, // Pre-devaluation
    inr: 17.5,
    cny: 4.7,
    zar: 2.5,
    usd: 1.0,
    eur: 0.8, // Proxy pre-1999
    jpy: 145,
    gbp: 0.6,
  };

  const totalDays = 36 * 365; // ~1990 to 2026
  const baseDate = new Date('2026-01-08T00:00:00Z');
  
  for (let i = totalDays; i >= 0; i--) {
    if (i % 7 !== 0) continue; // Weekly

    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const day = totalDays - i;
    const noise = pseudoRandom(day) - 0.5;
    const vol = 0.01;
    
    // Major cycles
    const wave1 = Math.sin(day/1000) * 0.5; // Multi-year trend
    const wave2 = Math.sin(day/200) * 0.2;  // Yearly cycle
    const growth = day * 0.0005;

    data.push({
      date: dateStr,
      gold: startGold * (1 + wave1 + wave2 + growth + noise * vol),
      brl: startCurrencies.brl * (1 + wave2 * 0.5 + noise * vol * 5),
      rub: startCurrencies.rub * (1 + wave1 * 0.3 + noise * vol * 10),
      inr: startCurrencies.inr * (1 + wave2 * 0.2 + noise * vol * 2),
      cny: startCurrencies.cny * (1 + wave1 * 0.1 + noise * vol),
      zar: startCurrencies.zar * (1 + wave1 * 0.4 + noise * vol * 4),
      usd: 1.0,
      eur: dateStr < '1999-01-01' ? null : startCurrencies.eur * (1 + wave1 * 0.2 + noise * vol),
      jpy: startCurrencies.jpy * (1 + wave2 * 0.1 + noise * vol * 3),
      gbp: startCurrencies.gbp * (1 + wave1 * 0.15 + noise * vol),
    });
  }
  return data;
}

/**
 * Calculates a unified macro comparison (Gold vs SDR vs BRICS)
 * Uses dynamic weighting to handle missing historical components
 */
export function calculateMacroComparison(data: any[]): any[] {
  if (data.length === 0) return [];

  const bricsWeights: any = { brl: 0.2, rub: 0.2, inr: 0.2, cny: 0.2, zar: 0.2 };
  const sdrWeights: any = { usd: 0.4338, eur: 0.2931, cny: 0.1228, jpy: 0.0759, gbp: 0.0744 };

  const getWeightedValue = (p: any, weightMap: any) => {
    let totalWeight = 0;
    let value = 0;
    
    for (const [key, weight] of Object.entries(weightMap)) {
      const val = p[key];
      if (val !== null && val !== undefined && val > 0) {
        value += (weight as number) * (1 / val);
        totalWeight += (weight as number);
      }
    }
    
    return totalWeight > 0 ? (value / totalWeight) : 0;
  };

  const getSdrValue = (p: any) => getWeightedValue(p, sdrWeights);
  const getBricsValue = (p: any) => getWeightedValue(p, bricsWeights);

  const firstSdrPoint = data.find(p => getSdrValue(p) > 0);
  const firstBricsPoint = data.find(p => getBricsValue(p) > 0);
  const firstGoldPoint = data.find(p => p.gold && p.gold > 0);

  const baselineSdr = firstSdrPoint ? getSdrValue(firstSdrPoint) : 1;
  const baselineBrics = firstBricsPoint ? getBricsValue(firstBricsPoint) : 1;
  const baselineGold = firstGoldPoint ? firstGoldPoint.gold : 1;

  return data.map((point) => {
    const sdrVal = getSdrValue(point);
    const bricsVal = getBricsValue(point);
    
    const sdrScore = sdrVal > 0 ? (sdrVal / baselineSdr) * 100 : null;
    const bricsScore = bricsVal > 0 ? (bricsVal / baselineBrics) * 100 : null;
    const goldScore = point.gold ? (point.gold / baselineGold) * 100 : null;

    return {
      time: point.date,
      sdr: sdrScore !== null ? Number(sdrScore.toFixed(2)) : null,
      brics: bricsScore !== null ? Number(bricsScore.toFixed(2)) : null,
      gold: goldScore !== null ? Number(goldScore.toFixed(2)) : null
    };
  });
}
