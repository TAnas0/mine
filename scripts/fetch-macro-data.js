import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../src/data/macro-data.json');
const API_KEY = process.env.FRED_API_KEY;

// Historical goal: 1990
const START_DATE = '1990-01-01';

const SERIES = [
  { id: 'xauusd', name: 'gold', source: 'stooq' }, 
  { id: 'DEXUSEU', name: 'eur', source: 'fred', invert: false },
  { id: 'DEXUSUK', name: 'gbp', source: 'fred', invert: false },
  { id: 'DEXCHUS', name: 'cny', source: 'fred', invert: true },
  { id: 'DEXJPUS', name: 'jpy', source: 'fred', invert: true },
  { id: 'DEXBZUS', name: 'brl', source: 'fred', invert: true },
  { id: 'DEXSFUS', name: 'zar', source: 'fred', invert: true },
  { id: 'DEXINUS', name: 'inr', source: 'fred', invert: true },
  { id: 'CCUSSP02RUM650N', name: 'rub', source: 'fred', invert: true }, 
];

async function fetchStooqGold() {
  console.log('  → Fetching Gold from Stooq...');
  // i=w for weekly data directly from Stooq
  const url = `https://stooq.com/q/d/l/?s=xauusd&i=w`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const lines = text.split('\n').slice(1); // skip header: Date,Open,High,Low,Close
    const processed = {};
    lines.forEach(line => {
      const [date, , , , close] = line.split(',');
      if (date && close && date >= START_DATE) {
        processed[date] = parseFloat(close);
      }
    });
    return processed;
  } catch (err) {
    console.error('  ✖ Error fetching Gold from Stooq:', err.message);
    return {};
  }
}

async function fetchFredSeries(seriesId) {
  if (!API_KEY) return null;
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&sort_order=asc&observation_start=${START_DATE}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.observations;
  } catch (err) {
    return null;
  }
}

function aggregateWeekly(observations, invert = false) {
  if (!observations) return {};
  const weekly = {};
  observations.forEach(obs => {
    const val = parseFloat(obs.value);
    if (isNaN(val)) return;
    
    const date = new Date(obs.date);
    // Align to Sunday of that week
    const sunday = new Date(date);
    sunday.setDate(date.getDate() + (7 - date.getDay()) % 7);
    const dateStr = sunday.toISOString().split('T')[0];
    
    // Keep the latest value for that week
    weekly[dateStr] = invert ? (1 / val) : val;
  });
  return weekly;
}

async function run() {
  if (!API_KEY) {
    console.log('No FRED_API_KEY. Skipping build-time fetch.');
    process.exit(0);
  }

  console.log(`\n🚀 Starting Long-Term Macro Fetch (since ${START_DATE})`);
  
  const allData = {};
  const dates = new Set();
  const summary = [];

  for (const s of SERIES) {
    let data = {};
    if (s.source === 'stooq') {
      data = await fetchStooqGold();
    } else {
      const obs = await fetchFredSeries(s.id);
      data = aggregateWeekly(obs, s.invert);
    }

    const obsCount = Object.keys(data).length;
    if (obsCount > 0) {
      const seriesDates = Object.keys(data).sort();
      console.log(`  ✓ ${s.name.toUpperCase().padEnd(5)} | ${obsCount.toString().padStart(4)} points | ${seriesDates[0]} to ${seriesDates[seriesDates.length-1]}`);
      summary.push({ Series: s.name.toUpperCase(), Count: obsCount, Start: seriesDates[0], End: seriesDates[seriesDates.length-1], Status: 'OK' });
    } else {
      console.log(`  ✖ ${s.name.toUpperCase().padEnd(5)} | No data.`);
      summary.push({ Series: s.name.toUpperCase(), Count: 0, Start: '-', End: '-', Status: 'MISSING' });
    }

    allData[s.name] = data;
    Object.keys(data).forEach(d => dates.add(d));
  }

  const sortedDates = Array.from(dates).sort();
  console.log('\nProcessing merging and forward-fill...');

  const result = sortedDates.map(date => {
    const point = { date };
    SERIES.forEach(s => {
      point[s.name] = allData[s.name][date] ?? null;
    });
    return point;
  });

  // Forward fill gaps
  SERIES.forEach(s => {
    let lastVal = null;
    result.forEach(point => {
      if (point[s.name] !== null) {
        lastVal = point[s.name];
      } else {
        point[s.name] = lastVal;
      }
    });
  });

  // Filter for points where WE HAVE DATA (at least GBP or gold must be valid in the early 90s)
  const finalResult = result.filter(p => p.gold !== null || p.gbp !== null);

  console.log('\n--- DATA SUMMARY ---');
  console.table(summary);
  console.log(`\nFinal Dataset: ${finalResult.length} weekly points merged.`);
  
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(finalResult, null, 2));
  console.log(`✅ Saved ${finalResult.length} points to ${DATA_PATH}\n`);
}

run();
