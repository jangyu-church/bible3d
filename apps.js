/* ==========================================================
   3D로 보는 성경 · 공간 목록 (여기만 고치면 앱이 늘어납니다)
   ----------------------------------------------------------
   새 공간을 추가하는 법
   1) 아래 APPS 배열에 항목 하나를 복사해 붙여 넣습니다.
   2) status 를 'live'(열림) 또는 'soon'(준비 중)으로 정합니다.
   3) live 라면 url 과 thumb(썸네일 이미지 경로)을 적습니다.
      soon 이라면 teaser 에 3D 스케치 종류를 적습니다.
      (tabernacle · ark · paul · terrain · village · 없으면 생략)
   4) era.order 숫자가 작을수록 시대순 보기에서 앞에 놓입니다.
   ========================================================== */

window.BIBLE3D_CATEGORIES = [
  { id: 'all',       label: '전체' },
  { id: 'sanctuary', label: '성소·건축' },
  { id: 'city',      label: '성읍·도시' },
  { id: 'journey',   label: '여정·지도' },
  { id: 'land',      label: '땅·지형' },
  { id: 'life',      label: '삶·사회' }
];

window.BIBLE3D_APPS = [
  {
    id: 'jerusalem',
    status: 'live',
    title: '예루살렘 성 산책',
    en: 'JERUSALEM EXPLORER',
    category: 'city',
    testament: '신약',
    era: { label: '제2성전 · 예수님 시대', year: '1세기', order: 60 },
    scripture: '사무엘하 5장 · 열왕기하 20장 · 느헤미야 2–3장 · 요한복음 5, 9, 19장',
    summary: '다윗 성에서 골고다까지, 성서고고학 연구를 바탕으로 복원한 예루살렘 성을 3D로 걸어 봅니다. 시대별(구약·신약) 성벽 비교와 단면 보기를 지원합니다.',
    points: [
      '다윗 성 · 기혼 샘', '히스기야 터널 · 실로암', '넓은 성벽', '느헤미야 성문',
      '오벨 · 순례길', '성전산 · 훌다 문', '서쪽 벽(통곡의 벽)', '베데스다 연못',
      '안토니아 · 비아 돌로로사', '헤롯 궁전 · 골고다'
    ],
    url: 'https://jangyu-church.github.io/jerusalem/',
    thumb: 'thumbs/jerusalem.jpg',
    accent: '#d9a95b',
    added: '2026'
  },
  {
    id: 'temple',
    status: 'live',
    title: '솔로몬 성전 산책',
    en: 'TEMPLE EXPLORER',
    category: 'sanctuary',
    testament: '구약',
    era: { label: '솔로몬 시대', year: '기원전 10세기', order: 30 },
    scripture: '열왕기상 6–8장 · 역대하 3–4장',
    summary: '열왕기상의 치수 기록을 따라 솔로몬 성전의 뜰에서 지성소까지 걸어 들어갑니다. 단면 보기, 직접 걷기, 역대하 비교 기능이 있습니다.',
    points: [
      '뜰', '번제단', '놋 바다', '물두멍 · 받침 수레', '낭실 · 두 기둥',
      '성소', '등잔대 · 상', '금 제단 · 내소 문', '지성소 · 언약궤', '곁방'
    ],
    url: 'https://jangyu-church.github.io/temple/',
    thumb: 'thumbs/temple.jpg',
    accent: '#e5b96f',
    added: '2026'
  },
  {
    id: 'tabernacle',
    status: 'soon',
    title: '광야의 성막',
    en: 'TABERNACLE',
    category: 'sanctuary',
    testament: '구약',
    era: { label: '출애굽 · 광야 시대', year: '모세 시대', order: 20 },
    scripture: '출애굽기 25–40장',
    summary: '하나님이 백성 가운데 거하시려고 세우게 하신 이동식 성소입니다. 뜰(100×50규빗)에서 번제단과 물두멍을 지나 성소와 지성소까지, 성막 기구들의 배치와 의미를 따라갑니다.',
    points: ['성막 뜰과 문', '번제단', '물두멍', '성소 · 등잔대 · 진설병 상 · 분향단', '휘장', '지성소 · 언약궤', '덮개 네 겹'],
    teaser: 'tabernacle',
    accent: '#c9a46a'
  },
  {
    id: 'ark',
    status: 'soon',
    title: '노아의 방주',
    en: "NOAH'S ARK",
    category: 'sanctuary',
    testament: '구약',
    era: { label: '홍수 이야기', year: '원역사', order: 10 },
    scripture: '창세기 6–9장',
    summary: '길이 300, 너비 50, 높이 30규빗(창 6:15). 성경이 밝힌 비율대로 방주의 크기를 실감하고, 3층 구조와 창·문의 기록을 살펴봅니다.',
    points: ['300 × 50 × 30 규빗', '고페르 나무와 역청', '세 층 구조', '옆에 낸 문', '위쪽의 창', '무지개 언약'],
    teaser: 'ark',
    accent: '#b8895a'
  },
  {
    id: 'paul',
    status: 'soon',
    title: '바울의 선교 여행',
    en: "PAUL'S JOURNEYS",
    category: 'journey',
    testament: '신약',
    era: { label: '사도 시대', year: '1세기 중엽', order: 70 },
    scripture: '사도행전 13–28장',
    summary: '안디옥에서 출발한 세 차례의 선교 여행과 로마 압송 길을 지중해 지형 위에 3D 경로로 그려, 도시마다 세워진 교회와 서신을 연결해 봅니다.',
    points: ['1차 여행 (행 13–14)', '2차 여행 (행 15:36–18:22)', '3차 여행 (행 18:23–21:16)', '로마 압송 (행 27–28)', '도시별 서신 연결'],
    teaser: 'paul',
    accent: '#7fb0c9'
  },
  {
    id: 'terrain',
    status: 'soon',
    title: '이스라엘 땅의 지형',
    en: 'LAND OF ISRAEL',
    category: 'land',
    testament: '구약 · 신약',
    era: { label: '전 시대', year: '지리', order: 5 },
    scripture: '신명기 8:7–9 · 여호수아 · 복음서',
    summary: '해안 평야에서 셰펠라, 중앙 산지, 요단 골짜기와 사해까지. 서쪽에서 동쪽으로 달라지는 땅의 높낮이를 3D 지형으로 보며 성경 사건의 무대를 이해합니다.',
    points: ['해안 평야', '셰펠라(낮은 구릉)', '중앙 산지', '요단 골짜기', '갈릴리 바다', '사해', '요단 동편 고원'],
    teaser: 'terrain',
    accent: '#9cbf8a'
  },
  {
    id: 'society',
    status: 'soon',
    title: '예수님 당시의 마을과 삶',
    en: 'LIFE IN JESUS’ TIME',
    category: 'life',
    testament: '신약',
    era: { label: '예수님 시대', year: '1세기', order: 55 },
    scripture: '마가복음 2:1–12 · 누가복음 4:16–30 · 마태복음 4:18–22',
    summary: '평평한 지붕의 집, 회당, 갈릴리 어부의 배, 세리의 세관. 복음서 장면이 펼쳐지던 마을의 생활 공간을 걸으며 말씀의 배경을 생생하게 그려 봅니다.',
    points: ['평평한 지붕의 집 (막 2:4)', '회당 (눅 4:16)', '갈릴리 어부와 배', '세관 (막 2:14)', '로마의 통치와 세금', '절기와 성전 순례'],
    teaser: 'village',
    accent: '#d8a07a'
  }
];
