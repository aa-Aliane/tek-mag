// frontend/src/components/shared/page-header.tsx
import React from 'react';
import { SharedHeader } from './shared-header';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode; // For any additional elements like buttons
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <SharedHeader
      title={title}
      subtitle={subtitle}
    >
      {children}
    </SharedHeader>
  );
}
