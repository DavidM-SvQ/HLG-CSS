import { useEffect } from 'react';
import { trackEvent } from './trackEvent';

export function usePageView(pageName: string, additionalData: any = {}) {
  useEffect(() => {
    trackEvent('page_view', { page: pageName, ...additionalData });
  }, [pageName, JSON.stringify(additionalData)]);
}
