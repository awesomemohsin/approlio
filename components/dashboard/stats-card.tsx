import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  href?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  trend,
  href,
}) => {
  const cardContent = (
    <div className={cn(
      "bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors h-full",
      href && "cursor-pointer hover:bg-muted/10"
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-3">{trend}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-gradient-to-br', color)}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default StatsCard;
