import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

const APPS = [
  { name: 'React', url: 'http://localhost:5181/' },
  { name: 'Vue', url: 'http://localhost:5182/' },
  { name: 'Svelte', url: 'http://localhost:5183/' },
  { name: 'Angular', url: 'http://localhost:5184/' },
];

const RUNS_PER_APP = 3; // plusieurs passes pour réduire le bruit de mesure

async function runBenchmarkOnce(browser, app) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(app.url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Cliquer sur le bouton "Lancer le benchmark"
  const buttonSelector = 'button';
  await page.waitForSelector(buttonSelector, { timeout: 10000 });

  // Trouve le bouton contenant le texte "Lancer le benchmark" et clique dessus
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent.includes('Lancer le benchmark'));
    if (target) target.click();
  });

  // Attendre que le bouton redevienne actif (benchmark terminé) -> texte revient à "Lancer"
  await page.waitForFunction(
    () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(
        (b) => b.textContent.includes('Lancer le benchmark') || b.textContent.includes('Benchmark en cours')
      );
      return target && target.textContent.includes('Lancer le benchmark') && !target.disabled;
    },
    { timeout: 60000, polling: 100 }
  );

  // Lire les résultats affichés dans le <pre>
  const resultsText = await page.evaluate(() => {
    const pre = document.querySelector('.bench-panel pre');
    return pre ? pre.textContent : null;
  });

  await page.close();

  if (!resultsText) return null;

  // Parser "Label: 12.34 ms"
  const lines = resultsText.split('\n').filter(Boolean);
  const results = lines.map((line) => {
    const idx = line.lastIndexOf(':');
    const label = line.slice(0, idx).trim();
    const duration = parseFloat(line.slice(idx + 1).replace('ms', '').trim());
    return { label, duration };
  });
  return results;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const allResults = {};

  for (const app of APPS) {
    console.log(`\n=== Benchmark: ${app.name} ===`);
    const runs = [];
    for (let i = 0; i < RUNS_PER_APP; i++) {
      try {
        const r = await runBenchmarkOnce(browser, app);
        if (r) {
          runs.push(r);
          console.log(`  Run ${i + 1}/${RUNS_PER_APP} OK:`, r.map((x) => `${x.label}=${x.duration.toFixed(1)}ms`).join(', '));
        } else {
          console.log(`  Run ${i + 1}/${RUNS_PER_APP} FAILED (no results found)`);
        }
      } catch (err) {
        console.log(`  Run ${i + 1}/${RUNS_PER_APP} ERROR:`, err.message);
      }
    }
    allResults[app.name] = runs;
  }

  await browser.close();

  fs.writeFileSync(
    '/home/claude/dom-benchmark-project/benchmark-results/raw-results.json',
    JSON.stringify(allResults, null, 2)
  );
  console.log('\n✅ Résultats bruts sauvegardés dans raw-results.json');
}

main().catch((err) => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
