import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getMockHistoricalData, calculateMacroComparison } from '../../lib/financialData';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MacroTracker = () => {
  const data = useMemo(() => {
    const historical = getMockHistoricalData();
    return calculateMacroComparison(historical);
  }, []);

  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Gold',
        data: data.map(d => d.gold),
        borderColor: '#eab308',
        backgroundColor: '#eab308',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: 'SDR Index (IMF)',
        data: data.map(d => d.sdr),
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: 'BRICS Unit',
        data: data.map(d => d.brics),
        borderColor: '#b41660',
        backgroundColor: '#b41660',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 13, family: 'monospace' },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: { size: 10 },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return label.split('-')[0];
          }
        },
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (value) => value.toFixed(0),
        },
      },
    },
  };

  return (
    <div className="not-prose my-12 p-8 rounded-3xl bg-base-200 border border-base-300 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 gap-4 border-b border-base-300 pb-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-base-content uppercase">
            Long-Term Asset Comparison
          </h3>
          <p className="text-base-content/40 text-xs font-medium uppercase tracking-[0.2em] mt-1">
            Historical Performance Index (Base 100)
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2 h-2 rounded-full bg-[#eab308]" /> Gold
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]" /> SDR
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2 h-2 rounded-full bg-[#b41660]" /> BRICS
          </div>
        </div>
      </div>

      <div className="relative h-[450px] w-full bg-base-100/50 rounded-2xl p-4 border border-base-300/50 shadow-inner">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-base-300/30 border border-base-300/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-[10px] uppercase font-black tracking-widest opacity-40">
          Source: St. Louis FED & Stooq (1990 — 2026)
        </p>
      </div>
    </div>
  );
};

export default MacroTracker;
