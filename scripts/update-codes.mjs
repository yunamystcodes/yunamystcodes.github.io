import fs from 'node:fs/promises';
const sources=['https://sw-teams.ovh/codes','https://swcoupon.net/'];
const fallback=['4READY4TDOT','AMPRELIMSLEGACYDRP','APAC26LEGASEA','AUGSW2026V7N','GLHF2026AMERICAS','LEGENDSWC2026HSL','PAI2026BANGKOK','SWC26X10LEGACYBND','SWXFRIEREN2026','YIQIZOUGUO10SWC'];
const banned=new Set(['ACTIVE','EXPIRED','AVAILABLE','CODES','REDEEM','SUMMONERS','WAR','SKY','ARENA','ENERGY','MANA','SCROLL','COPY','COUPON']);
let found=[];
for(const url of sources){
  try{
    const html=await (await fetch(url,{headers:{'user-agent':'Mozilla/5.0 YunaMystCodesBot/1.0'}})).text();
    const matches=html.match(/\b[A-Z0-9]{5,40}\b/g)||[];
    for(const code of matches){if(!banned.has(code)&&/[A-Z]/.test(code)&&/\d/.test(code))found.push(code)}
    if(found.length>=2)break;
  }catch{}
}
found=[...new Set(found)];
if(found.length<2)found=fallback;
const data={updated:new Date().toISOString(),source:'https://sw-teams.ovh/codes',codes:found.slice(0,60)};
await fs.writeFile('codes.json',JSON.stringify(data,null,2)+'\n');
let index=await fs.readFile('index.html','utf8');
if(!index.includes('auto-codes.js')){index=index.replace('</body>','<script src="./auto-codes.js"></script>\n</body>');await fs.writeFile('index.html',index)}
