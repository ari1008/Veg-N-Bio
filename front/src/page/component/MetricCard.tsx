import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
                                                   title,
                                                   value,
                                                   icon,
                                                   trend,
                                                   subtitle,
                                                   color = 'primary',
                                                   isLoading = false
                                               }) => {
    const getColorClasses = (color: string) => {
        const colorMap = {
            primary: 'border-primary bg-primary/5 text-primary',
            secondary: 'border-secondary bg-secondary/5 text-secondary',
            success: 'border-success bg-success/5 text-success',
            warning: 'border-warning bg-warning/5 text-warning',
            error: 'border-error bg-error/5 text-error',
            info: 'border-info bg-info/5 text-info'
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.primary;
    };

    const formatValue = (val: string | number): string => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + 'M';
            } else if (val >= 1000) {
                return (val / 1000).toFixed(1) + 'K';
            }
            return val.toString();
        }
        return val;
    };

    if (isLoading) {
        return (
            <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body">
                    <div className="animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-base-300 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                                <div className="h-6 bg-base-300 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-200">
            <div className="card-body p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg border-2 ${getColorClasses(color)}`}>
                            <span className="text-2xl">{icon}</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                                {title}
                            </h3>
                            <p className="text-3xl font-bold text-base-content mt-1">
                                {formatValue(value)}
                            </p>
                            {subtitle && (
                                <p className="text-xs text-base-content/60 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            trend.isPositive
                                ? 'bg-success/20 text-success'
                                : 'bg-error/20 text-error'
                        }`}>
                            <span className="text-sm">
                                {trend.isPositive ? '↗' : '↘'}
                            </span>
                            {Math.abs(trend.value)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
