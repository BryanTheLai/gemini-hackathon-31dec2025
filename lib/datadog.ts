import tracer from 'dd-trace';
import { client, v2 } from '@datadog/datadog-api-client';

if (typeof window === 'undefined') {
  tracer.init({
    logInjection: true,
    runtimeMetrics: true,
    service: 'gemini-kitchen-ai',
    env: process.env.NODE_ENV || 'development',
  });
}

const configuration = client.createConfiguration({
  authMethods: {
    apiKeyAuth: process.env.DD_API_KEY,
    appKeyAuth: process.env.DD_APP_KEY,
  }
});
configuration.setServerVariables({
  site: process.env.DD_SITE || "us5.datadoghq.com"
});
const metricsApi = new v2.MetricsApi(configuration);
const casesApi = new v2.CaseManagementApi(configuration);

/**
 * Log a message to Datadog (via console for Agent collection)
 */
export function logToDatadog(message: string, level: 'info' | 'warn' | 'error' = 'info', attributes: Record<string, any> = {}) {
  const logEntry = {
    message,
    level,
    service: 'gemini-burgers',
    ddsource: 'nodejs',
    ...attributes,
    timestamp: new Date().toISOString()
  };
  console.log(`[DATADOG:${level.toUpperCase()}] ${JSON.stringify(logEntry)}`);
}

export async function createDatadogCase(title: string, description: string, priority: any = 3) {
  if (!process.env.DD_API_KEY || !process.env.DD_APP_KEY) {
    console.warn('Datadog Case not created: Missing DD_API_KEY or DD_APP_KEY');
    return;
  }

  const params: v2.CaseManagementApiCreateCaseRequest = {
    body: {
      data: {
        type: 'case' as v2.CaseResourceType,
        attributes: {
          title,
          description,
          priority: priority as v2.CasePriority,
        } as any,
      },
    },
  };

  try {
    await casesApi.createCase(params);
    console.log('Successfully created Datadog case:', title);
  } catch (e) {
    console.error('Error creating Datadog case', e);
  }
}

export async function sendGeminiMetrics(tokens: { prompt: number, completion: number }, model: string) {
  if (!process.env.DD_API_KEY || !process.env.DD_APP_KEY) {
    return;
  }

  const params: v2.MetricsApiSubmitMetricsRequest = {
    body: {
      series: [
        {
          metric: 'gemini.tokens.prompt',
          type: 3, // GAUGE
          points: [{ timestamp: Math.floor(Date.now() / 1000), value: tokens.prompt }],
          tags: [`model:${model}`],
        },
        {
          metric: 'gemini.tokens.completion',
          type: 3, // GAUGE
          points: [{ timestamp: Math.floor(Date.now() / 1000), value: tokens.completion }],
          tags: [`model:${model}`],
        },
        {
          metric: 'gemini.cost',
          type: 3, // GAUGE
          points: [{ 
            timestamp: Math.floor(Date.now() / 1000), 
            value: (tokens.prompt * 0.000125 / 1000) + (tokens.completion * 0.000375 / 1000) // Rough estimate for Flash 2.0
          }],
          tags: [`model:${model}`],
        }
      ],
    },
  };

  try {
    await metricsApi.submitMetrics(params);
  } catch (e) {
    console.error('Error sending metrics to Datadog', e);
  }
}

export default tracer;
