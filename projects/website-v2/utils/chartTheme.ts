import type { ChartOptions } from 'chart.js'

export const chartPalette = {
  accent: '#F5B041',
  accentSoft: 'rgba(245, 176, 65, 0.18)',
  accentStroke: '#F5B041',
  grid: '#1C2740',
  tick: '#94a3b8',
  text: '#F1F5F9',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
  teal: '#14b8a6',
}

const tickFont = {
  family: "'JetBrains Mono', monospace",
  size: 10,
  weight: 500 as const,
}

export function lineOptions(overrides: Partial<ChartOptions<'line'>> = {}): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#0B1220',
        borderColor: chartPalette.grid,
        borderWidth: 1,
        titleColor: chartPalette.text,
        bodyColor: chartPalette.tick,
        padding: 10,
        displayColors: false,
        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: chartPalette.tick, font: tickFont, maxTicksLimit: 5 },
      },
      y: {
        grid: { color: chartPalette.grid, lineWidth: 0.5 },
        border: { display: false },
        ticks: { color: chartPalette.tick, font: tickFont, maxTicksLimit: 4 },
      },
    },
    ...overrides,
  }
}

export function doughnutOptions(overrides: Partial<ChartOptions<'doughnut'>> = {}): ChartOptions<'doughnut'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: chartPalette.tick,
          font: { family: "'Inter', sans-serif", size: 12 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: '#0B1220',
        borderColor: chartPalette.grid,
        borderWidth: 1,
        titleColor: chartPalette.text,
        bodyColor: chartPalette.tick,
        padding: 10,
        titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
      },
    },
    ...overrides,
  }
}

export function buildLineData(label: string, values: number[], xLabels: string[], color = chartPalette.accent) {
  return {
    labels: xLabels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: 'rgba(245, 176, 65, 0.18)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 3,
        borderWidth: 2,
      },
    ],
  }
}

export const donutPalette = [
  '#F5B041',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#14b8a6',
  '#ef4444',
  '#f97316',
  '#06b6d4',
  '#eab308',
  '#ec4899',
]
