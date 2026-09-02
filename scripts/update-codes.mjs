import fs from 'node:fs/promises';

const sources = [
  'https://sw-teams.ovh/codes',
  'https://swcoupon.net/',
  'https://summonerswarcodes.us/',
  'https://swquery.net/',
  'https://swgt.io/gamecodes/',
  'https://mobi.gg/en/tips/free-summoners-war-codes/'
];

// These are codes that have been positively confirmed as expired by the site/source checks.
// Do NOT put a code here just because one source temporarily stopped listing it.
const confirmedExpired = new Set([
  'GLHF2026AMERICAS','SWC26X10LEGACYBND','PAI2026BANGKOK','APAC26LEGASEA',
  '912XUXIECHUANQI','SWC2026JUELEBA','H4MBURGISWAITING','HURRASWC2026',
  '4MINGYIDAOXIAN','YYDSSWC26ZAN','4READY4TDOT','AMPRELIMSLEGACYDRP',
  'YIQIZOUGUO10SWC','LEGENDSWC2026HSL'
]);

const banned = new Set(['ACTIVE','EXPIRED','AVAILABLE','CODES','CODE','REDEEM','SUMMONERS','WAR','SKY','ARENA','ENERGY','MANA','SCROLL','COPY','COUPON','REWARD','REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE','WINDOWS']);
const normalize = code => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
const valid = code => {const c=normalize(code);return c.length>=6&&c.length<=32&&/[A-Z]/.test(c)&&/\d/.test(c)&&!banned.has(c)};

// Keep the reward/image mapping. The renderer uses these reward types to show the
// correct sprite image, so an automatic refresh must never erase this object.
const knownRewards = {
  SEPSW2026I8B:[['blue','x3'],['mana','x300000']],
  SWGAJA2BKK:[['mana','x200000'],['yellow','x1']],
  SWCJOAAAKR26:[['yellow','x1']],
  '2SWCTORONTOTHE6IX':[['energy','x100'],['yellow','x1']],
  LAST4PUNCHIN:[['mana','x200000'],['yellow','x1']],
  APAC1K0UB4NGK0K:[['energy','x100'],['yellow','x1']],
  '2SOREIKENIPPON6':[['mana','x200000'],['yellow','x1']],
  SWXFRIEREN2026:[['energy','x100'],['mana','x300000'],['yellow','x3']],
  AUGSW2026V7N:[['energy','x100'],['red','x3']]
};

let previous = {};
try { previous = JSON.parse(await fs.readFile('codes.json','utf8')); } catch {}
const previousCodes = Array.isArray(previous.codes) ? previous.codes.map(normalize).filter(valid) : [];
const previousRewards = previous.rewards && typeof previous.rewards === 'object' ? previous.rewards : {};
const previousSources = previous.sources && typeof previous.sources === 'object' ? previous.sources : {};

const found = new Set();
const expiredBySource = new Map();
let successfulSources = 0;

for (const url of sources) {
  try {
    const response = await fetch(url,{headers:{'user-agent':'Mozilla/5.0 YunaMystCodesBot/4.0'}});
    if (!response.ok) continue;
    const html = await response.text();
    successfulSources++;
    const text = html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ');
    const matches = text.match(/\b[A-Z0-9]{6,32}\b/gi)||[];
    for (const raw of matches) {
      const code=normalize(raw);
      if(!valid(code)) continue;
      const pos=text.toLowerCase().indexOf(String(raw).toLowerCase());
      const context=text.slice(Math.max(0,pos-500),pos+500).toLowerCase();
      const explicitlyExpired = context.includes('expired')||context.includes('expirado')||context.includes('not working')||context.includes('inactive')||context.includes('no longer')||context.includes('valid until')&&context.includes('past');
      if(explicitlyExpired){
        if(!expiredBySource.has(code)) expiredBySource.set(code,new Set());
        expiredBySource.get(code).add(url);
      } else {
        found.add(code);
      }
    }
  } catch {}
}

// A code is removed only when it is in the explicit expiry list or multiple
// independent sources positively mark it expired. A temporary source failure,
// missing page, or a single inconsistent source can never delete an active code.
const active = new Set([...found]);
for (const code of previousCodes) {
  if (confirmedExpired.has(code)) continue;
  const expiredSources = expiredBySource.get(code)?.size || 0;
  if (expiredSources >= 2) continue;
  active.add(code);
}

const codes = [...active].filter(valid).sort();
if(codes.length < 2) throw new Error('Não foi possível confirmar pelo menos 2 códigos ativos; atualização abortada para não apagar a lista.');

const rewards = {};
const sourcesByCode = {};
for (const code of codes) {
  rewards[code] = previousRewards[code] || knownRewards[code] || [];
  const oldSources = Array.isArray(previousSources[code]) ? previousSources[code] : [];
  const freshSources = [];
  if (found.has(code)) freshSources.push('live-source');
  sourcesByCode[code] = [...new Set([...oldSources,...freshSources])];
}

const data = {
  updated:new Date().toISOString(),
  source_count:sources.length,
  successful_sources:successfulSources,
  rule:'lista ativa preservada entre atualizações; novos códigos adicionados; remoção somente com confirmação explícita; recompensas e imagens preservadas',
  codes,
  rewards,
  sources:sourcesByCode,
  source_errors:[]
};
await fs.writeFile('codes.json',JSON.stringify(data,null,2)+'\n');

let index=await fs.readFile('index.html','utf8');
if(!index.includes('auto-codes.js'))index=index.replace('</body>','<script src="./auto-codes.js"></script>\n</body>');
if(!index.includes('language-fix.js'))index=index.replace('</body>','<script src="./language-fix.js?v=20260901"></script>\n</body>');
await fs.writeFile('index.html',index);
