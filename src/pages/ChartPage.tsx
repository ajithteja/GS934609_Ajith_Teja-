import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const data = {
  store: 'store',
  weeksData: [
    { week: 'W01', gmDollars: 210, gmPercent: 105 },
    { week: 'W02', gmDollars: 180, gmPercent: 90 },
    { week: 'W03', gmDollars: 220, gmPercent: 110 },
    { week: 'W04', gmDollars: 175, gmPercent: 87.5 },
    { week: 'W05', gmDollars: 195, gmPercent: 97.5 },
    { week: 'W06', gmDollars: 240, gmPercent: 120 },
    { week: 'W07', gmDollars: 160, gmPercent: 80 },
    { week: 'W08', gmDollars: 200, gmPercent: 100 },
    { week: 'W09', gmDollars: 190, gmPercent: 95 },
    { week: 'W10', gmDollars: 250, gmPercent: 125 },
    { week: 'W11', gmDollars: 170, gmPercent: 85 },
    { week: 'W12', gmDollars: 230, gmPercent: 115 },
    { week: 'W13', gmDollars: 155, gmPercent: 77.5 },
    { week: 'W14', gmDollars: 215, gmPercent: 107.5 },
    { week: 'W15', gmDollars: 185, gmPercent: 92.5 },
    { week: 'W16', gmDollars: 225, gmPercent: 112.5 },
    { week: 'W17', gmDollars: 165, gmPercent: 82.5 },
    { week: 'W18', gmDollars: 205, gmPercent: 102.5 },
    { week: 'W19', gmDollars: 245, gmPercent: 122.5 },
    { week: 'W20', gmDollars: 175, gmPercent: 87.5 },
    { week: 'W21', gmDollars: 190, gmPercent: 95 },
    { week: 'W22', gmDollars: 210, gmPercent: 105 },
    { week: 'W23', gmDollars: 160, gmPercent: 80 },
    { week: 'W24', gmDollars: 230, gmPercent: 115 },
    { week: 'W25', gmDollars: 195, gmPercent: 97.5 },
    { week: 'W26', gmDollars: 225, gmPercent: 112.5 },
    { week: 'W27', gmDollars: 200, gmPercent: 100 },
    { week: 'W28', gmDollars: 175, gmPercent: 87.5 },
    { week: 'W29', gmDollars: 250, gmPercent: 125 },
    { week: 'W30', gmDollars: 185, gmPercent: 92.5 },
    { week: 'W31', gmDollars: 240, gmPercent: 120 },
    { week: 'W32', gmDollars: 170, gmPercent: 85 },
    { week: 'W33', gmDollars: 220, gmPercent: 110 },
    { week: 'W34', gmDollars: 155, gmPercent: 77.5 },
    { week: 'W35', gmDollars: 210, gmPercent: 105 },
    { week: 'W36', gmDollars: 195, gmPercent: 97.5 },
    { week: 'W37', gmDollars: 180, gmPercent: 90 },
    { week: 'W38', gmDollars: 235, gmPercent: 117.5 },
    { week: 'W39', gmDollars: 175, gmPercent: 87.5 },
    { week: 'W40', gmDollars: 200, gmPercent: 100 },
    { week: 'W41', gmDollars: 245, gmPercent: 122.5 },
    { week: 'W42', gmDollars: 160, gmPercent: 80 },
    { week: 'W43', gmDollars: 220, gmPercent: 110 },
    { week: 'W44', gmDollars: 185, gmPercent: 92.5 },
    { week: 'W45', gmDollars: 230, gmPercent: 115 },
    { week: 'W46', gmDollars: 165, gmPercent: 82.5 },
    { week: 'W47', gmDollars: 215, gmPercent: 107.5 },
    { week: 'W48', gmDollars: 175, gmPercent: 87.5 },
    { week: 'W49', gmDollars: 190, gmPercent: 95 },
    { week: 'W50', gmDollars: 240, gmPercent: 120 },
    { week: 'W51', gmDollars: 155, gmPercent: 77.5 },
    { week: 'W52', gmDollars: 200, gmPercent: 100 },
  ],
};

export default function GrossMarginChart() {
  return (
    <div className="chart-container rounded-none">
      <h2 className="chart-title">Gross Margin</h2>
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={data.weeksData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="week" stroke="#fff" />

          {/* Left Y-Axis for GM Dollars */}
          <YAxis
            yAxisId="left"
            stroke="#fff"
            tickFormatter={(value) => `$${value}`}
          />

          {/* Right Y-Axis for GM % */}
          <YAxis
            yAxisId="right"
            stroke="#ff7f0e"
            orientation="right"
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip />
          <Legend />

          {/* GM Dollars - Bar Chart */}
          <Bar
            yAxisId="left"
            dataKey="gmDollars"
            fill="#3498db"
            name="GM Dollars"
            radius={0}
          />

          {/* GM % - Line Chart */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="gmPercent"
            stroke="#ff7f0e"
            strokeWidth={2}
            name="GM %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
