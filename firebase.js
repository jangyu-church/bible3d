/* ==========================================================
   3D로 보는 성경 · Firebase 연결 + 운영자 화면
   - 공간 목록: Firestore 'spaces' 컬렉션 (누구나 읽기, 운영자만 쓰기)
   - 운영자 확인: 구글 로그인 + Firestore 보안 규칙(운영자 메일 목록)
   - 사진: 브라우저에서 960×600으로 줄여 목록과 함께 저장 (Storage 불필요 · 무료)
   ========================================================== */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, writeBatch, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCnSSGEZ5HlCdCw8Q6piiJMK7NRIaDHJD8',
  authDomain: 'bible3d-5890c.firebaseapp.com',
  projectId: 'bible3d-5890c',
  storageBucket: 'bible3d-5890c.firebasestorage.app',
  messagingSenderId: '179716841095',
  appId: '1:179716841095:web:d565d38768ca0edc326222'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const B = () => window.B3D;
const toast = (m) => B() && B().toast(m);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TEASERS = [
  ['', '없음'], ['tabernacle', '성막'], ['ark', '방주'], ['paul', '선교 여행 지도'], ['terrain', '이스라엘 지형'], ['village', '갈릴리 마을']
];

/* ---------------- 목록 읽기 ---------------- */
let spaces = [];
async function loadSpaces() {
  const snap = await getDocs(collection(db, 'spaces'));
  spaces = snap.docs.map(d => Object.assign({}, d.data(), { id: d.id }))
    .sort((a, b) => (a.sort ?? 999) - (b.sort ?? 999));
  return spaces;
}
async function refreshHub() {
  try {
    const list = await loadSpaces();
    if (list.length) B() && B().setApps(list.map(clean));
  } catch (e) { console.warn('Firestore 읽기 실패 — 저장된 목록으로 표시합니다.', e); }
}
function clean(s) { const o = Object.assign({}, s); delete o.updatedAt; return o; }

/* ---------------- 운영자 확인 ---------------- */
// 보안 규칙에서 운영자만 읽을 수 있게 막아 둔 문서를 읽어 봅니다. 읽히면 운영자.
async function isAdmin() {
  try { await getDoc(doc(db, 'adminCheck', 'ping')); return true; }
  catch (e) { return false; }
}
async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, provider); }
  catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
      sessionStorage.setItem('b3d.openAdmin', '1');
      await signInWithRedirect(auth, provider);
    } else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
      toast('로그인하지 못했습니다: ' + (e.code || e.message));
    }
    throw e;
  }
}

/* ---------------- 사진 줄이기 (16:10, 960×600) ---------------- */
function fileToThumb(fileOrUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = 960, H = 600, c = document.createElement('canvas'); c.width = W; c.height = H;
      const r = Math.max(W / img.width, H / img.height);
      const w = img.width * r, h = img.height * r;
      const g = c.getContext('2d'); g.fillStyle = '#13221f'; g.fillRect(0, 0, W, H);
      g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      let q = 0.8, out = c.toDataURL('image/jpeg', q);
      while (out.length > 600000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => reject(new Error('사진을 읽지 못했습니다'));
    img.src = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  });
}

/* ---------------- 운영자 화면 ---------------- */
const css = `
.adm{position:fixed;inset:0;z-index:90;background:#0f1b19;display:none;flex-direction:column;color:#f3f0e6}
.adm.open{display:flex}
.adm header{position:static;height:auto;background:#13221f;border-bottom:1px solid #33474a;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.adm header h2{margin:0;font:600 20px/1.3 "Noto Serif KR",serif}
.adm header small{display:block;color:#a1b3ae;font-size:12px}
.adm .body{flex:1;overflow:auto;padding:20px;max-width:920px;width:100%;margin:0 auto}
.adm .row{display:grid;grid-template-columns:96px minmax(0,1fr) auto;gap:14px;align-items:center;padding:10px;border:1px solid #33474a;border-radius:10px;background:#182a28;margin-bottom:8px}
.adm .row img,.adm .row .noimg{width:96px;height:60px;object-fit:cover;border-radius:6px;background:#1d302d}
.adm .row b{display:block;font-size:15px}
.adm .row span{font-size:12px;color:#a1b3ae}
.adm .row .acts{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.adm .row .acts button{padding:5px 9px;font-size:13px}
.adm .st{display:inline-block;font-size:11px;padding:1px 8px;border-radius:999px;margin-right:6px;font-weight:700}
.adm .st.live{background:#e5b96f;color:#14221f}.adm .st.soon{border:1px solid #5b6a58;color:#d7cdb8}
.adm .gold{background:#e5b96f;color:#14221f;border:0;font-weight:700}
.adm .gold:hover{background:#f0cb8a}
.adm .danger{color:#f0a08a;border-color:#6a3b33}
.adm form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.adm label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:#cfdad5}
.adm .full{grid-column:1/-1}
.adm label em{font-style:normal;color:#8ea39d;font-size:12px}
.adm input,.adm select,.adm textarea{font:inherit;font-size:15px;color:#f3f0e6;background:#182a28;border:1px solid #33474a;border-radius:8px;padding:9px 11px}
.adm textarea{min-height:84px;resize:vertical}
.adm .pic{display:grid;grid-template-columns:240px 1fr;gap:14px;align-items:center}
.adm .pic img,.adm .pic .noimg{width:240px;aspect-ratio:16/10;object-fit:cover;border-radius:8px;background:#1d302d;border:1px solid #33474a}
.adm .bar{display:flex;gap:8px;justify-content:space-between;align-items:center;margin:4px 0 18px;flex-wrap:wrap}
.adm .note{color:#a1b3ae;font-size:13px;margin:0 0 16px}
.adm .gate{max-width:420px;margin:60px auto;text-align:center}
.adm .gate p{color:#c3d0cb}
@media (max-width:640px){
  .adm .row{grid-template-columns:72px minmax(0,1fr)}
  .adm .row img,.adm .row .noimg{width:72px;height:45px}
  .adm .row .acts{grid-column:1/-1;justify-content:flex-start}
  .adm form{grid-template-columns:1fr}
  .adm .pic{grid-template-columns:1fr}
  .adm .pic img,.adm .pic .noimg{width:100%}
  .adm .body{padding:16px}
}`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
const root = document.createElement('div');
root.className = 'adm'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', '운영자 화면');
document.body.appendChild(root);

function shell(inner, sub = '') {
  const u = auth.currentUser;
  root.innerHTML = `<header><div><h2>운영자 화면</h2><small>${esc(sub || (u ? u.email : ''))}</small></div>
    <div style="display:flex;gap:6px">${u ? '<button type="button" data-a="logout">로그아웃</button>' : ''}<button type="button" data-a="close">닫기 ✕</button></div></header>
    <div class="body">${inner}</div>`;
}

async function openAdmin() {
  root.classList.add('open'); document.body.classList.add('locked');
  if (!auth.currentUser) {
    shell(`<div class="gate"><h3 class="serif">운영자 로그인</h3><p>공간을 추가하거나 고치려면 운영자 구글 계정으로 로그인해 주세요.</p>
      <button type="button" class="gold" data-a="login" style="padding:12px 22px">구글 계정으로 로그인</button></div>`, '');
    return;
  }
  shell(`<div class="gate"><p>권한을 확인하는 중…</p></div>`);
  if (!(await isAdmin())) {
    shell(`<div class="gate"><h3 class="serif">운영자 계정이 아닙니다</h3><p>${esc(auth.currentUser.email)} 계정에는 관리 권한이 없습니다.<br>다른 계정으로 로그인해 주세요.</p>
      <button type="button" class="gold" data-a="switch">다른 계정으로 로그인</button></div>`);
    return;
  }
  await renderListView();
}
function closeAdmin() {
  root.classList.remove('open'); document.body.classList.remove('locked');
  if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
}

async function renderListView() {
  shell(`<div class="gate"><p>목록을 불러오는 중…</p></div>`);
  try { await loadSpaces(); } catch (e) { shell(`<div class="gate"><p>목록을 불러오지 못했습니다. (${esc(e.code || e.message)})</p></div>`); return; }
  const CATS = (B() && B().CATS) || [];
  const cat = (id) => (CATS.find(c => c.id === id) || {}).label || '';
  const seed = !spaces.length ? `<div class="row" style="grid-template-columns:1fr auto"><div><b>데이터베이스가 비어 있습니다</b><span>지금 앱에 있는 공간 ${(window.BIBLE3D_APPS || []).length}곳(사진 포함)을 데이터베이스로 옮길까요? 처음 한 번만 하시면 됩니다.</span></div>
      <div class="acts"><button type="button" class="gold" data-a="seed">기존 공간 불러오기</button></div></div>` : '';
  shell(`<div class="bar"><p class="note" style="margin:0">총 ${spaces.length}곳 · 위아래 화살표로 순서를 바꿉니다. 저장하면 성도들 화면에 바로 반영됩니다.</p>
      <button type="button" class="gold" data-a="new">+ 새 공간 추가</button></div>
    ${seed}
    ${spaces.map((s, i) => `<div class="row">
      ${s.thumb ? `<img src="${esc(s.thumb)}" alt="">` : '<div class="noimg"></div>'}
      <div><b>${esc(s.title)}</b><span><i class="st ${s.status === 'live' ? 'live' : 'soon'}">${s.status === 'live' ? '열림' : '준비 중'}</i>${esc(cat(s.category))} · ${esc(s.era?.label || '')}</span></div>
      <div class="acts">
        <button type="button" data-a="up" data-i="${i}" aria-label="위로" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button type="button" data-a="down" data-i="${i}" aria-label="아래로" ${i === spaces.length - 1 ? 'disabled' : ''}>↓</button>
        <button type="button" data-a="toggle" data-i="${i}">${s.status === 'live' ? '준비 중으로' : '열림으로'}</button>
        <button type="button" data-a="edit" data-i="${i}">고치기</button>
        <button type="button" class="danger" data-a="del" data-i="${i}">삭제</button>
      </div></div>`).join('')}`);
}

let editing = null, pendingThumb;
function renderForm(s) {
  editing = s; pendingThumb = undefined;
  const CATS = ((B() && B().CATS) || []).filter(c => c.id !== 'all');
  const v = (x) => esc(x ?? '');
  shell(`<div class="bar"><button type="button" data-a="back">← 목록으로</button><b>${s.id ? '공간 고치기' : '새 공간 추가'}</b><span></span></div>
  <form id="spaceForm" novalidate>
    <label class="full">제목 *<input name="title" required value="${v(s.title)}" placeholder="예: 광야의 성막"></label>
    <label>영문 제목 <em>카드에 작게 표시</em><input name="en" value="${v(s.en)}" placeholder="예: TABERNACLE"></label>
    <label>상태<select name="status"><option value="soon" ${s.status !== 'live' ? 'selected' : ''}>준비 중</option><option value="live" ${s.status === 'live' ? 'selected' : ''}>열림</option></select></label>
    <label class="full">앱 주소 (열림일 때 필요)<input name="url" type="url" value="${v(s.url)}" placeholder="https://jangyu-church.github.io/tabernacle/"></label>
    <div class="full pic">
      ${s.thumb ? `<img id="picPrev" src="${esc(s.thumb)}" alt="">` : '<div class="noimg" id="picPrev"></div>'}
      <label>대표 사진 <em>앱 화면을 캡처한 사진을 고르세요. 가로로 긴 사진이 좋고, 자동으로 알맞게 줄여 저장합니다.</em>
        <input name="pic" type="file" accept="image/*">
        ${s.thumb ? '<button type="button" data-a="clearpic" style="justify-self:start">사진 지우기</button>' : ''}</label>
    </div>
    <label>분류<select name="category">${CATS.map(c => `<option value="${c.id}" ${s.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>
    <label>구약 / 신약<select name="testament">${['구약', '신약', '구약 · 신약'].map(t => `<option ${s.testament === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
    <label>시대 이름<input name="eraLabel" value="${v(s.era?.label)}" placeholder="예: 출애굽 · 광야 시대"></label>
    <label>연대<input name="eraYear" value="${v(s.era?.year)}" placeholder="예: 기원전 15–13세기"></label>
    <label class="full">시대순 위치 <em>작을수록 앞. 지형 5 · 방주 10 · 성막 20 · 성전 30 · 예수님 시대 55–60 · 바울 70</em><input name="eraOrder" type="number" value="${v(s.era?.order ?? 50)}"></label>
    <label class="full">주요 성경 본문<input name="scripture" value="${v(s.scripture)}" placeholder="예: 출애굽기 25–40장"></label>
    <label class="full">소개 글<textarea name="summary" placeholder="미리보기 창에 나오는 2~3문장 소개">${v(s.summary)}</textarea></label>
    <label class="full">둘러볼 장소 <em>한 줄에 하나씩</em><textarea name="points" placeholder="번제단&#10;물두멍&#10;지성소">${v((s.points || []).join('\n'))}</textarea></label>
    <label>3D 구상 스케치 <em>사진이 없을 때 보여 줄 간이 모형</em><select name="teaser">${TEASERS.map(([k, l]) => `<option value="${k}" ${(s.teaser || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label>주소용 이름 <em>영문·숫자. 링크 끝에 붙습니다 (#tabernacle)</em><input name="slugId" value="${v(s.id)}" ${s.id ? 'disabled' : ''} placeholder="비워 두면 자동"></label>
    <div class="full bar"><span></span><button type="submit" class="gold" style="padding:12px 26px">저장하기</button></div>
  </form>`);
  const f = root.querySelector('#spaceForm');
  f.elements.pic.addEventListener('change', async () => {
    const file = f.elements.pic.files[0]; if (!file) return;
    try {
      pendingThumb = await fileToThumb(file);
      const prev = root.querySelector('#picPrev');
      const img = document.createElement('img'); img.id = 'picPrev'; img.src = pendingThumb; prev.replaceWith(img);
    } catch (e) { toast(e.message); }
  });
  f.addEventListener('submit', (e) => { e.preventDefault(); saveForm(f); });
}

const slug = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

async function saveForm(f) {
  const E = f.elements;
  const title = E['title'].value.trim();
  if (!title) { toast('제목을 적어 주세요'); E['title'].focus(); return; }
  const status = E.status.value;
  if (status === 'live' && !/^https?:\/\//.test(E.url.value.trim())) { toast('열림 상태에는 앱 주소가 필요합니다'); E.url.focus(); return; }
  let id = editing.id || slug(E.slugId.value) || slug(E.en.value) || ('space-' + Date.now().toString(36));
  if (!editing.id && spaces.some(s => s.id === id)) id += '-' + Date.now().toString(36).slice(-4);
  const data = {
    title, en: E.en.value.trim(), status, url: E.url.value.trim(),
    category: E.category.value, testament: E.testament.value,
    era: { label: E.eraLabel.value.trim(), year: E.eraYear.value.trim(), order: Number(E.eraOrder.value) || 50 },
    scripture: E.scripture.value.trim(), summary: E.summary.value.trim(),
    points: E.points.value.split('\n').map(x => x.trim()).filter(Boolean),
    teaser: E.teaser.value || '',
    thumb: pendingThumb !== undefined ? pendingThumb : (editing.thumb || ''),
    sort: editing.sort ?? ((spaces.reduce((m, s) => Math.max(m, s.sort ?? 0), 0)) + 10),
    updatedAt: serverTimestamp()
  };
  const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = '저장 중…';
  try {
    await setDoc(doc(db, 'spaces', id), data);
    toast('저장했습니다'); await refreshHub(); await renderListView();
  } catch (e) {
    toast('저장하지 못했습니다: ' + (e.code || e.message)); btn.disabled = false; btn.textContent = '저장하기';
  }
}

async function seed() {
  const list = window.BIBLE3D_APPS || [];
  shell(`<div class="gate"><p>기존 공간 ${list.length}곳을 옮기는 중…</p></div>`);
  try {
    const batch = writeBatch(db);
    for (let i = 0; i < list.length; i++) {
      const a = Object.assign({}, list[i]); const id = a.id; delete a.id;
      if (a.thumb && !a.thumb.startsWith('data:')) { try { a.thumb = await fileToThumb(a.thumb); } catch (e) { a.thumb = ''; } }
      a.sort = (i + 1) * 10; a.updatedAt = serverTimestamp();
      batch.set(doc(db, 'spaces', id), a);
    }
    await batch.commit();
    toast('기존 공간을 옮겼습니다'); await refreshHub();
  } catch (e) { toast('옮기지 못했습니다: ' + (e.code || e.message)); }
  await renderListView();
}

async function swap(i, j) {
  const a = spaces[i], b = spaces[j]; if (!a || !b) return;
  let sa = a.sort ?? i * 10, sb = b.sort ?? j * 10; if (sa === sb) sb = sa + 1;
  const batch = writeBatch(db);
  batch.update(doc(db, 'spaces', a.id), { sort: sb });
  batch.update(doc(db, 'spaces', b.id), { sort: sa });
  try { await batch.commit(); await refreshHub(); await renderListView(); }
  catch (e) { toast('순서를 바꾸지 못했습니다: ' + (e.code || e.message)); }
}

root.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a, i = Number(t.dataset.i), s = spaces[i];
  if (a === 'close') closeAdmin();
  else if (a === 'login') { try { await login(); } catch (er) {} }
  else if (a === 'logout') { await signOut(auth); closeAdmin(); toast('로그아웃했습니다'); }
  else if (a === 'switch') { await signOut(auth); try { await login(); } catch (er) {} }
  else if (a === 'seed') seed();
  else if (a === 'new') renderForm({ status: 'soon', category: 'sanctuary', testament: '구약', era: { order: 50 } });
  else if (a === 'edit') renderForm(s);
  else if (a === 'back') renderListView();
  else if (a === 'clearpic') { pendingThumb = ''; const p = root.querySelector('#picPrev'); const d = document.createElement('div'); d.className = 'noimg'; d.id = 'picPrev'; p.replaceWith(d); t.remove(); }
  else if (a === 'up') swap(i, i - 1);
  else if (a === 'down') swap(i, i + 1);
  else if (a === 'toggle') {
    const next = s.status === 'live' ? 'soon' : 'live';
    if (next === 'live' && !s.url) { toast('앱 주소를 먼저 넣어 주세요'); renderForm(s); return; }
    try { await setDoc(doc(db, 'spaces', s.id), { status: next, updatedAt: serverTimestamp() }, { merge: true }); await refreshHub(); await renderListView(); }
    catch (er) { toast('바꾸지 못했습니다: ' + (er.code || er.message)); }
  } else if (a === 'del') {
    if (!confirm(`‘${s.title}’을(를) 목록에서 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try { await deleteDoc(doc(db, 'spaces', s.id)); toast('삭제했습니다'); await refreshHub(); await renderListView(); }
    catch (er) { toast('삭제하지 못했습니다: ' + (er.code || er.message)); }
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('open')) closeAdmin(); });

/* ---------------- 시작 ---------------- */
const openIfHash = () => { if (location.hash === '#admin') openAdmin(); };
window.addEventListener('hashchange', openIfHash);
let first = true;
onAuthStateChanged(auth, () => {
  if (first) { first = false; if (sessionStorage.getItem('b3d.openAdmin')) { sessionStorage.removeItem('b3d.openAdmin'); location.hash = '#admin'; } openIfHash(); return; }
  if (root.classList.contains('open')) openAdmin();
});
refreshHub();
