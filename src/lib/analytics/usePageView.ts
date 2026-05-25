import { useEffect } from 'react';
import { trackEvent } from './trackEvent';

export function usePageView(pageName: string, additionalData: any = {}) {
  const dataString = JSON.stringify(additionalData);
  useEffect(() => {
    trackEvent('page_view', { page: pageName, ...JSON.parse(dataString) });
  }, [pageName, dataString]);
}
