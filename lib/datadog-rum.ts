import { datadogRum } from '@datadog/browser-rum';

export function initDatadogRum() {
  if (typeof window === 'undefined') return;

  // To get these keys:
  // 1. Go to Datadog -> Digital Experience -> RUM Applications
  // 2. Create a new application (choose "JavaScript" or "Web")
  // 3. The Client Token and Application ID will be in the setup code snippet
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;

  if (!clientToken || !applicationId) {
    console.warn('Datadog RUM not initialized: Missing clientToken or applicationId');
    return;
  }

  datadogRum.init({
    applicationId: applicationId,
    clientToken: clientToken,
    site: 'us5.datadoghq.com',
    service: 'gemini-kitchen-frontend',
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
}
