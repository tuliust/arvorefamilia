import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type PersonFormSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function PersonFormSection({ title, children, className = 'space-y-4' }: PersonFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={className}>
        {children}
      </CardContent>
    </Card>
  );
}
