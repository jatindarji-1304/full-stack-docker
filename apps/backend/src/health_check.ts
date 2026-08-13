const port = process.env.PORT ?? "3001";

try {
  const response = await fetch(`http://127.0.0.1:${port}/health`);

  if (!response.ok) {
    process.exit(1);
  }

  process.exit(0);
} catch {
  process.exit(1);
}