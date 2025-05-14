
import type { PropsWithChildren } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WidgetCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  className?: string;
  headerActions?: React.ReactNode; // For buttons or other controls in header
}

export function WidgetCard({ title, description, className, children, headerActions }: WidgetCardProps) {
  return (
    <Card className={cn("shadow-lg flex flex-col h-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {headerActions && <div className="ml-auto flex items-center gap-2">{headerActions}</div>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden">
        {children}
      </CardContent>
    </Card>
  );
}
