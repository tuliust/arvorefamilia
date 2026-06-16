import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type PersonFormSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
};

export function PersonFormSection({
  title,
  children,
  className = 'space-y-4',
  description,
  icon,
  headerAction,
}: PersonFormSectionProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="space-y-1">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                {icon}
              </span>
            )}

            <div className="min-w-0">
              <CardTitle className="break-words">{title}</CardTitle>
              {description && (
                <p className="mt-1 break-words text-sm font-normal text-gray-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          {headerAction && (
            <div className="shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={className}>
        {children}
      </CardContent>
    </Card>
  );
}
