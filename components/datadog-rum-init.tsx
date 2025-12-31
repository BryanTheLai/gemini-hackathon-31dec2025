'use client';

import { useEffect } from 'react';
import { initDatadogRum } from '@/lib/datadog-rum';

export function DatadogRumInit() {
  useEffect(() => {
    initDatadogRum();
  }, []);

  return null;
}
