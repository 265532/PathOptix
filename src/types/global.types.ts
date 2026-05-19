
import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface StatData {
  label: string;
  value: string;
  trend?: string;
  subtitle?: string;
  badge?: string;
  type: 'line' | 'bar' | 'none';
  icon?: React.ReactNode;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
}
