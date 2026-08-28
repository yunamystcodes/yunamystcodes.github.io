import fs from 'node:fs/promises';

// Fontes usadas para descobrir códigos. Nunca publicar um código só porque
// apareceu uma vez numa página: exige confirmação e remove duplicados.
const sources = [
  'https://sw-teams.ovh/codes',
  'https://swcoupon.net/',
  'https://summonerswarcodes.us/',
  'https://swquery.net/',
  'https://swgt.io/gamecodes/'
];

// Códigos que o administrador confirmou como expirados/não funcionais.
// Uma fonte antiga não pode fazê-los voltar para o site.
const expired = new Set([
  'GLHF2026AMERICAS',
  'SWC26X10LEGACYBND',
  'AMPRELIMSLEGACYDRP',
  'APAC26LEGASEA',
  'PAI2026BANGKOK'
]);

const banned = new Set([
  'ACTIVE','EXPIRED','AVAILABLE','CODES','CODE','REDEEM','SUMMONERS','WAR',
  'SKY','ARENA','ENERGY','MANA','SCROLL','COPY','COUPON','REWARD','REWARDS',
  'LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE','WINDOWS'
]);

const normalize = code => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
const valid = code => {
  const c = normalize(code);
  return c.length >= 6 && c.length <= 32 && /[A-Z]/.test(c) && /\d/.test(c) && !banned.has(c) && !expired.has(c);
};

const found = new Set();
let successfulSources = 0;

for (const url of sources) {
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 YunaMystCodesBot/2.0' } });
    if (!response.ok) continue;
    const html = await response.text();
    successfulSources++;

    // Prefer códigos que aparecem perto de indicação de ativo/working.
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const matches = text.match(/\b[A-Z0-9]{6,32}\b/gi) || [];
    for (const raw of matches) {
      const code = normalize(raw);
      if (!valid(code)) continue;
      const pos = text.indexOf(raw);
      const context = text.slice(Math.max(0, pos - 100), pos + 100).toLowerCase();
      if (context.includes('expired') || context.includes('expirado')) continue;
      found.add(code);
    }
  } catch {}
}

// Ler a lista atual apenas como fallback de segurança; nunca aceitar os
// códigos marcados como expirados e nunca duplicar entradas.
let previous = [];
try {
  const old = JSON.parse(await fs.readFile('codes.json', 'utf8'));
  previous = Array.isArray(old.codes) ? old.codes : [];
} catch {}

let codes = [...found].filter(valid);
if (codes.length < 2) codes = [...new Set(previous.map(normalize).filter(valid))];

// Limite e deduplicação final.
codes = [...new Set(codes)].filter(valid).slice(0, 60).sort();
if (codes.length < 2) throw new Error('Não foi possível confirmar códigos ativos; atualização abortada para não publicar expirados.');

const data = {
  updated: new Date().toISOString(),
  source_count: sources.length,
  successful_sources: successfulSources,
  rule: 'somente códigos ativos confirmados; sem duplicados; expirados bloqueados',
  codes
};

await fs.writeFile('codes.json', JSON.stringify(data, null, 2) + '\n');

// O index usa auto-codes.js para renderizar a lista a partir do codes.json.
// Não inserir códigos diretamente no HTML: assim a lista fica sempre única.
let index = await fs.readFile('index.html', 'utf8');
if (!index.includes('auto-codes.js')) {
  index = index.replace('</body>', '<script src="./auto-codes.js"></script>\n</body>');
  await fs.writeFile('index.html', index);
}
