"use client";

import { PriceHistoryItem } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  priceHistory: PriceHistoryItem[];
  currency: string;
}

const PriceHistoryChart = ({ priceHistory, currency }: Props) => {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No price history available yet
      </div>
    );
  }

  const chartData = priceHistory.map((item, index) => ({
    name: item.date ? new Date(item.date).toLocaleDateString() : `Day ${index + 1}`,
    price: item.price,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: currency, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${currency} ${value.toFixed(2)}`, 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;
