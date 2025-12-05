import React from 'react';

export default function CommandesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="commandes-layout">
      {children}
    </div>
  );
}