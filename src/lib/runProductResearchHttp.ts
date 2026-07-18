import fetch from 'node-fetch';

const url = process.argv[2];
if (!url) {
  console.error('Usage: bun run src/lib/runProductResearchHttp.ts <product-url>');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch('http://localhost:8082/api/product-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    console.log('Result:', data);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
