const fs = require('fs');
const XLSX = require('xlsx-js-style');

const files = [
  { name: 'PCBDF', path: 'C:/Users/USER/Downloads/PCBDF.xlsx' },
  { name: '5%', path: 'C:/Users/USER/Downloads/5%.xlsx' },
  { name: '20%', path: 'C:/Users/USER/Downloads/20%.xlsx' },
  { name: 'FE', path: 'C:/Users/USER/Downloads/FE.xlsx' },
  { name: 'POPS', path: 'C:/Users/USER/Downloads/POPS.xlsx' },
  { name: 'CO', path: 'C:/Users/USER/Downloads/CO.xlsx' },
  { name: 'MOOE', path: 'C:/Users/USER/Downloads/MOOE.xlsx' }
];

const mapping = {};

files.forEach(f => {
  if (!fs.existsSync(f.path)) {
     console.log('NOT FOUND:', f.path);
     return;
  }
  const wb = XLSX.readFile(f.path);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  const fppList = [];
  
  rows.forEach(r => {
     let fpp = String(r[0] || '').trim();
     let ppa = String(r[1] || '').trim();
     // If column 0 is empty but col 1 and 2 exist, perhaps FPP is elsewhere
     // Let's iterate all cells to strictly find FPP if possible, but standard is col 0
     let finalFpp = '';
     let finalPpa = '';
     
     for (let i=0; i<r.length; i++) {
        let val = String(r[i] || '').trim();
        // matches fpp code pattern like "1000-1" or "4000-5-2.1"
        if (/^\d{4}-\d/.test(val)) {
           finalFpp = val;
           finalPpa = String(r[i+1] || '').trim();
           break;
        }
     }
     if (!finalFpp && fpp && !fpp.toUpperCase().includes('FPP') && !fpp.toUpperCase().includes('SUMMARY')) {
         finalFpp = fpp;
         finalPpa = ppa;
     }
     
     if (finalFpp && !finalFpp.toUpperCase().includes('FPP') && !finalFpp.toUpperCase().includes('APPRO')) {
        fppList.push({ fppCode: finalFpp, ppa: finalPpa });
     }
  });
  
  mapping[f.name] = fppList;
});

const tsCode = `export const ppaFundMapping: Record<string, { fppCode: string; ppa: string; }[]> = ${JSON.stringify(mapping, null, 2)};\n`;
fs.writeFileSync('src/data/ppaFundMapping.ts', tsCode);
console.log('Mapping created successfully!');
