const { client, v2 } = require('@datadog/datadog-api-client');

async function sendHeartbeat() {
  console.log("Sending heartbeat to Datadog...");
  
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

  const params = {
    body: {
      series: [
        {
          metric: 'gemini.heartbeat',
          type: 3,
          points: [{ timestamp: Math.floor(Date.now() / 1000), value: 1 }],
          tags: ['env:hackathon', 'status:active'],
        },
      ],
    },
  };

  try {
    await metricsApi.submitMetrics(params);
    console.log("✅ Heartbeat sent! Check Datadog Metrics Explorer for 'gemini.heartbeat'");
  } catch (e) {
    console.error("❌ Failed to send heartbeat:", e);
  }
}

sendHeartbeat();
