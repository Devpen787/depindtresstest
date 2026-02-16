import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface InsightCardProps {
    title: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    description: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
    title,
    value,
    trend,
    trendValue,
    description
}) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
            case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up': return 'text-green-500';
            case 'down': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    {trend && (
                        <div className={`flex items-center text-xs font-medium ${getTrendColor()} bg-secondary/50 px-2 py-1 rounded-full`}>
                            {getTrendIcon()}
                            <span className="ml-1">{trendValue}</span>
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
};
