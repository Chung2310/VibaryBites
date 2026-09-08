fetch(`http://127.0.0.1:${process.env.PORT || '3009'}/api/health`, {
  signal: AbortSignal.timeout(6000),
}).then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1));
