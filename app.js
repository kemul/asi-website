// --------------------
// Konstanta & Data
// --------------------
const SHEET_URL = "https://script.google.com/macros/s/AKfycbw6OEIQLU5qnQKz8ZSDi6GRq0UI_EYmQBicameWptWrN23Yn1ZTROc865agHD2PiOPT/exec";

const ITEMS = [
  "Saya merasa bahwa bayi saya mendapatkan cukup ASI",
  "Saya tetap dapat menyusui bayi saya walaupun banyak hal yang saya lakukan",
  "Saya memberikan ASI kepada bayi saya tanpa tambahan susu formula",
  "Saya memastikan bahwa bayi saya tidak mendapatkan makanan apapun selain ASI",
  "Saya mampu mengelola keadaan saat menyusui untuk kenyamanan saya",
  "Saya akan tetap menyusui bayi saya bahkan saat bayi saya menangis",
  "Saya tetap nyaman dalam menyusui saat ada anggota keluarga atau orang lain di sekitar saya",
  "Saya puas dengan pengalaman menyusui saya",
  "Saya memberikan ASI kepada bayi saya dengan satu payudara sampai habis lalu beralih ke payudara sebelahnya",
  "Saya terus menyusui bayi saya untuk memberikan makanan",
  "Saya mampu memenuhi keinginan menyusui bayi saya",
  "Saya mengetahui tanda ketika bayi saya selesai menyusu"
];

const OPTIONS = [
  { key: 'STY', label: 'Sangat Tidak Yakin', value: 1 },
  { key: 'TY',  label: 'Tidak Yakin',        value: 2 },
  { key: 'KY',  label: 'Kurang Yakin',       value: 3 },
  { key: 'Y',   label: 'Yakin',              value: 4 },
  { key: 'SY',  label: 'Sangat Yakin',       value: 5 },
];

// --------------------
// Helper Functions
// --------------------
const $ = (s) => document.querySelector(s);
const save = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
const load = (k,d=null)=>JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const calcScore = (obj)=>Object.values(obj||{}).reduce((a,b)=>a+Number(b||0),0);

// --------------------
// Form Builder
// --------------------
function buildForm(root, storageKey){
  root.innerHTML = "";
  ITEMS.forEach((q,i)=>{
    const row = document.createElement('div');
    row.className = 'form-row';
    row.innerHTML = `
      <div class="flex"><span class="qnum">${i+1}</span><div><strong>${q}</strong></div></div>
      <div style="margin-top:6px">
        ${OPTIONS.map(o=>`
          <label class="opt">
            <input type="radio" name="q${i}" value="${o.value}">
            <span>${o.key}</span>
            <span class="hide-sm">– ${o.label}</span>
          </label>
        `).join('')}
      </div>
    `;
    root.appendChild(row);
  });

  const data = load(storageKey, {});
  Object.entries(data).forEach(([k,v])=>{
    const inp = root.querySelector(`input[name="${k}"][value="${v}"]`);
    if (inp) inp.checked = true;
  });
}

function readForm(root){
  const data = {};
  ITEMS.forEach((_,i)=>{
    const el = root.querySelector(`input[name="q${i}"]:checked`);
    data['q'+i] = el ? Number(el.value) : 0;
  });
  return data;
}

// --------------------
// Integrasi ke Google Sheet
// --------------------
async function kirimKeSheet(type, data) {
  try {
    await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, answers: data }),
    });
    console.log(`✅ ${type} terkirim ke Google Sheets`);
  } catch (err) {
    console.error("❌ Gagal kirim ke Google Sheet:", err);
  }
}

// --------------------
// Update Hasil
// --------------------
function updateSummary() {
  const pre = load('pre', {});
  const post = load('post', {});
  const sPre = calcScore(pre);
  const sPost = calcScore(post);
  const max = ITEMS.length * 5;

  if ($('#preTotal')) {
    $('#preTotal').textContent = sPre || '–';
    const pct = max ? Math.round(100*sPre/max) : 0;
    $('#preBar').firstElementChild.style.width = pct+'%';
  }
  if ($('#postTotal')) {
    $('#postTotal').textContent = sPost || '–';
    const pct2 = max ? Math.round(100*sPost/max) : 0;
    $('#postBar').firstElementChild.style.width = pct2+'%';
  }
  if ($('#delta')) {
    const d = sPost - sPre;
    $('#delta').textContent = (isNaN(d) ? '–' : (d>0?'+':'') + d);
    if (!isNaN(d)) {
      $('#deltaNote').textContent = d>0 ? 'Kepercayaan diri meningkat.' : (d<0 ? 'Kepercayaan diri menurun.' : 'Tidak ada perubahan.');
    }
  }
}

// --------------------
// Export ke CSV
// --------------------
function toCSV(){
  const pre = load('pre', {});
  const post = load('post', {});
  const sPre = calcScore(pre);
  const sPost = calcScore(post);
  const delta = sPost - sPre;
  const rows = [
    ['Jenis', ...ITEMS.map((_,i)=>'Q'+(i+1)), 'Total'],
    ['Pre', ...ITEMS.map((_,i)=> pre['q'+i] || ''), sPre],
    ['Post', ...ITEMS.map((_,i)=> post['q'+i] || ''), sPost],
    ['Delta', ...ITEMS.map((_,i)=> (post['q'+i]||0)-(pre['q'+i]||0)), delta],
  ];
  const csv = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='hasil-bses-sf.csv'; a.click();
  URL.revokeObjectURL(url);
}

// --------------------
// Global Object
// --------------------
window.ASI = { buildForm, readForm, updateSummary, toCSV, save, load, kirimKeSheet };
