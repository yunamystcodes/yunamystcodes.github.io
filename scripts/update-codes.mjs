import fs from 'node:fs/promises';

const sources = [
  'https://sw-teams.ovh/codes',
  'https://swcoupon.net/',
  'https://summonerswarcodes.us/',
  'https://swquery.net/',
  'https://swgt.io/gamecodes/'
];

const expired = new Set([
  'GLHF2026AMERICAS','SWC26X10LEGACYBND','PAI2026BANGKOK','APAC26LEGASEA','912XUXIECHUANQI','SWC2026JUELEBA','H4MBURGISWAITING','HURRASWC2026','4MINGYIDAOXIAN','YYDSSWC26ZAN','AUGSW2026V7N','SWXFRIEREN2026'
]);
const banned = new Set(['ACTIVE','EXPIRED','AVAILABLE','CODES','CODE','REDEEM','SUMMONERS','WAR','SKY','ARENA','ENERGY','MANA','SCROLL','COPY','COUPON','REWARD','REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE','WINDOWS']);
const normalize = code => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
const valid = code => {const c=normalize(code);return c.length>=6&&c.length<=32&&/[A-Z]/.test(c)&&/\d/.test(c)&&!banned.has(c)&&!expired.has(c)};
const found=new Set();let successfulSources=0;
for(const url of sources){try{const response=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 YunaMystCodesBot/3.0'}});if(!response.ok)continue;const html=await response.text();successfulSources++;const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ');const matches=text.match(/\b[A-Z0-9]{6,32}\b/gi)||[];for(const raw of matches){const code=normalize(raw);if(!valid(code))continue;const pos=text.toLowerCase().indexOf(String(raw).toLowerCase());const context=text.slice(Math.max(0,pos-220),pos+220).toLowerCase();if(context.includes('expired')||context.includes('expirado')||context.includes('not working')||context.includes('inactive')||context.includes('no longer'))continue;found.add(code)}}catch{}}
const codes=[...new Set([...found].filter(valid))].sort();
if(codes.length<2)throw new Error('Não foi possível confirmar pelo menos 2 códigos ativos; atualização abortada para não publicar expirados.');
const data={updated:new Date().toISOString(),source_count:sources.length,successful_sources:successfulSources,rule:'somente códigos ativos confirmados; sem duplicados; expirados bloqueados; nunca recuperar snapshot antigo',codes};
await fs.writeFile('codes.json',JSON.stringify(data,null,2)+'\n');
let index=await fs.readFile('index.html','utf8');
if(!index.includes('auto-codes.js'))index=index.replace('</body>','<script src="./auto-codes.js"></script>\n</body>');
if(!index.includes('language-fix.js'))index=index.replace('</body>','<script src="./language-fix.js?v=20260901"></script>\n</body>');
await fs.writeFile('index.html',index);
