'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/utils';

type CashFlowPoint = { month: number; income: number; expenses: number };
type FloorPoint = { floor: string; occupied: number; vacant: number; reserved: number; maintenance: number };

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ChartContainer({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="h-72 w-full min-w-0">
      {mounted ? children : <div className="h-full w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />}
    </div>
  );
}

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  const chartData = data.map((d) => ({
    name: MONTH_NAMES[d.month - 1],
    Income: d.income,
    Expenses: d.expenses,
    'Net Cash Flow': d.income - d.expenses,
  }));

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
          <Legend />
          <Line type="monotone" dataKey="Income" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Expenses" stroke="#f97316" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Net Cash Flow" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function FloorOccupancyChart({ data }: { data: FloorPoint[] }) {
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="floor" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="occupied" stackId="a" fill="#0ea5e9" name="Occupied" />
          <Bar dataKey="vacant" stackId="a" fill="#94a3b8" name="Vacant" />
          <Bar dataKey="reserved" stackId="a" fill="#fbbf24" name="Reserved" />
          <Bar dataKey="maintenance" stackId="a" fill="#f97316" name="Maintenance" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
