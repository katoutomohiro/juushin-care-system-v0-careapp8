'use client';
import { monthlyStats } from '../../../hooks/useDiary';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
export default function Monthly() {
  const ym = new Date().toISOString().slice(0,7);
  const data = monthlyStats(ym);
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Monthly Vitals</h1>
      <div style={{width:'100%', height:300}}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hr" stroke="#8884d8" />
            <Line type="monotone" dataKey="temp" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
