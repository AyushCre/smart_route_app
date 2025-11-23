import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function MetricsCard({ title, value, icon: Icon, trend, subtitle }: MetricsCardProps) {
  return (
    <Card data-testid={`metrics-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {value}
              </h3>
              {trend && (
                <div
                  className={`flex items-center text-sm font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
