/**
 * ActivityChart
 * Dashboard analytics: protected value grouped by the month each deal was
 * created — "how much you moved through safe deals each month". Rendered as a
 * smooth area (single brand hue), with a crosshair + branded tooltip and a
 * HelpHint explaining the metric.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { HelpHint } from '../general/HelpHint';
import {
  formatMinorAmount,
  formatMinorAmountCompact,
  monthlyProtectedValue,
} from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../../libs/store/types';

const BRAND_BLUE = '#1e90ff';

interface ActivityChartProps {
  deals: SafeDealSummary[] | undefined;
  isLoading: boolean;
  currency?: string;
}

interface ChartDatum {
  label: string;
  value: number; // major units
  valueMinor: number;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
  currency: string;
}

function ChartTooltip({ active, payload, currency }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{d.label}</p>
      <p className="text-sm font-semibold text-foreground tabular-nums">
        {formatMinorAmount(d.valueMinor, currency)}
      </p>
      <p className="text-[0.7rem] text-muted-foreground">
        {d.count} {d.count === 1 ? 'transaction' : 'transactions'}
      </p>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="gap-0 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BarChart3 size={18} className="text-primary" />
            Protected value by month
            <HelpHint title="Protected value by month">
              <p>
                Each point is the total value of property transactions you created or joined that month —
                money held safely with a regulated partner until the agreed conditions are met.
              </p>
              <p>
                It's a quick read on your monthly activity. Hover a point to see the exact amount and
                number of property transactions.
              </p>
            </HelpHint>
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            The value recorded through your property transactions each month.
          </p>
        </div>
      </div>
      <div className="mt-4 h-[260px] w-full">{children}</div>
    </Card>
  );
}

export function ActivityChart({ deals, isLoading, currency = 'NGN' }: ActivityChartProps) {
  if (isLoading || !deals) {
    return (
      <Frame>
        <Skeleton className="h-full w-full rounded-lg" />
      </Frame>
    );
  }

  const points = monthlyProtectedValue(deals);
  if (points.length === 0) {
    return (
      <Frame>
        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">No activity yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Your monthly recorded value will appear here as you create and fund property transactions.
          </p>
        </div>
      </Frame>
    );
  }

  const data: ChartDatum[] = points.map((p) => ({
    label: p.label,
    value: p.valueMinor / 100,
    valueMinor: p.valueMinor,
    count: p.count,
  }));

  return (
    <Frame>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlyValueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            dy={6}
          />
          <YAxis
            width={56}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(v: number) => formatMinorAmountCompact(v * 100, currency)}
          />
          <Tooltip
            cursor={{ stroke: BRAND_BLUE, strokeWidth: 1, strokeDasharray: '4 4' }}
            content={<ChartTooltip currency={currency} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={BRAND_BLUE}
            strokeWidth={2}
            fill="url(#monthlyValueFill)"
            dot={{ r: 3, fill: BRAND_BLUE, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: BRAND_BLUE, stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Frame>
  );
}
