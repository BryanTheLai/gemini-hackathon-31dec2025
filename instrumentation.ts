export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Datadog disabled
    // await import('./lib/datadog');
  }
}
