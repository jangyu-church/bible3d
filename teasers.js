/* ==========================================================
   준비 중인 공간의 3D 스케치(미리보기용 간이 모형)
   - 실제 앱이 완성되기 전, 카드와 미리보기 창에 보여 줄
     가벼운 구상 스케치입니다. 정밀 복원이 아닙니다.
   - 새 스케치는 TEASERS 에 함수 하나를 추가하면 됩니다.
   ========================================================== */
(function () {
  if (!window.THREE) return;
  const T = THREE;

  const mat = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85, metalness: 0.05 }, o));
  const box = (w, h, d, m) => new T.Mesh(new T.BoxGeometry(w, h, d), m);
  const cyl = (rt, rb, h, m, s = 12) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, s), m);

  // 결정적 난수 (매번 같은 모양)
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  function ground(color, size = 60) {
    const g = new T.Mesh(new T.CircleGeometry(size, 48), mat(color, { roughness: 1 }));
    g.rotation.x = -Math.PI / 2;
    return g;
  }

  function tree(group, x, z, s = 1) {
    const t = cyl(0.12 * s, 0.16 * s, 0.9 * s, mat('#6b5236'), 6); t.position.set(x, 0.45 * s, z);
    const c = new T.Mesh(new T.IcosahedronGeometry(0.6 * s, 0), mat('#6f8a5a', { flatShading: true }));
    c.position.set(x, 1.15 * s, z);
    group.add(t, c);
  }

  const TEASERS = {
    /* 광야의 성막 — 뜰 100×50 규빗 비율 (1 단위 = 5규빗) */
    tabernacle() {
      const g = new T.Group();
      g.add(ground('#d8c39a'));
      const W = 20, D = 10; // 100 x 50 규빗
      const linen = mat('#f3eee2'), post = mat('#8b6a45'), bronze = mat('#a8713d', { metalness: 0.4, roughness: 0.5 });
      const court = new T.Mesh(new T.PlaneGeometry(W, D), mat('#e6d6b2', { roughness: 1 }));
      court.rotation.x = -Math.PI / 2; court.position.y = 0.01; g.add(court);
      // 세마포 휘장 (높이 5규빗 = 1)
      const fenceH = 1;
      const addFence = (len, x, z, rotY) => {
        const f = box(len, fenceH, 0.06, linen); f.position.set(x, fenceH / 2, z); f.rotation.y = rotY; g.add(f);
      };
      addFence(W, 0, -D / 2, 0);
      addFence(D, -W / 2, 0, Math.PI / 2);
      // 동쪽(문 쪽): 가운데 20규빗(=4) 문
      addFence(3, W / 2, -D / 2 + 1.5, Math.PI / 2);
      addFence(3, W / 2, D / 2 - 1.5, Math.PI / 2);
      addFence(W, 0, D / 2, 0);
      const gate = box(0.05, fenceH * 0.95, 4, mat('#6d4a7a')); gate.position.set(W / 2 + 0.15, fenceH / 2, 0); g.add(gate);
      for (let i = 0; i <= 20; i++) for (const z of [-D / 2, D / 2]) { const p = cyl(0.06, 0.06, 1.1, post, 6); p.position.set(-W / 2 + i, 0.55, z); g.add(p); }
      for (let i = 0; i <= 10; i++) for (const x of [-W / 2, W / 2]) { const p = cyl(0.06, 0.06, 1.1, post, 6); p.position.set(x, 0.55, -D / 2 + i); g.add(p); }
      // 성막(장막) — 서쪽 절반
      const tent = box(6, 2, 2, mat('#4a3a2c')); tent.position.set(-4.5, 1, 0); g.add(tent);
      const roof = box(6.4, 0.12, 2.4, mat('#3a2e24')); roof.position.set(-4.5, 2.06, 0); g.add(roof);
      const veil = box(0.05, 1.8, 1.9, mat('#5b3e75')); veil.position.set(-1.48, 0.95, 0); g.add(veil);
      // 번제단 · 물두멍
      const altar = box(1, 0.6, 1, bronze); altar.position.set(5.5, 0.3, 0); g.add(altar);
      const laver = cyl(0.35, 0.25, 0.5, bronze, 16); laver.position.set(2.5, 0.25, 0); g.add(laver);
      // 구름 기둥
      const cloud = new T.Mesh(new T.CylinderGeometry(0.9, 0.6, 5, 16, 1, true), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18, depthWrite: false }));
      cloud.position.set(-6, 4.6, 0); g.add(cloud);
      return { group: g, radius: 15, height: 9 };
    },

    /* 노아의 방주 — 300:50:30 */
    ark() {
      const g = new T.Group();
      const water = new T.Mesh(new T.CircleGeometry(60, 48), mat('#2f5563', { roughness: 0.35, metalness: 0.2 }));
      water.rotation.x = -Math.PI / 2; g.add(water);
      const L = 15, W = 2.5, H = 1.5; // 300 x 50 x 30 규빗 (1 = 20규빗)
      const wood = mat('#7a5534', { flatShading: true });
      const hull = box(L, H, W, wood); hull.position.y = H / 2 - 0.25; g.add(hull);
      // 층 구분선
      for (const y of [H / 3, (2 * H) / 3]) { const s = box(L + 0.02, 0.04, W + 0.02, mat('#4d3520')); s.position.y = y - 0.25; g.add(s); }
      // 지붕과 위쪽 창 (한 규빗 창, 창 6:16)
      const tri = new T.Shape(); tri.moveTo(-W / 2 - 0.05, 0); tri.lineTo(W / 2 + 0.05, 0); tri.lineTo(0, 0.5); tri.closePath();
      const roofGeo = new T.ExtrudeGeometry(tri, { depth: L, bevelEnabled: false }); roofGeo.translate(0, 0, -L / 2); roofGeo.rotateY(Math.PI / 2);
      const roof = new T.Mesh(roofGeo, mat('#5e4128', { flatShading: true })); roof.position.y = H - 0.25; g.add(roof);
      const win = box(L * 0.92, 0.18, W + 0.12, mat('#2a1d12')); win.position.y = H - 0.33; g.add(win);
      // 옆문
      const door = box(1.0, 0.5, 0.05, mat('#3a2817')); door.position.set(2, 0.45, W / 2 + 0.03); g.add(door);
      // 사람 크기 비교 막대
      const man = cyl(0.03, 0.03, 0.09, mat('#f3efe6'), 6); man.position.set(-L / 2 - 0.5, 0.05, 1.8); g.add(man);
      return { group: g, radius: 17, height: 7.5 };
    },

    /* 바울의 선교 여행 — 경도/위도 근사 좌표 위의 경로 */
    paul() {
      const g = new T.Group();
      const sea = new T.Mesh(new T.PlaneGeometry(36, 20), mat('#24485a', { roughness: 0.5 }));
      sea.rotation.x = -Math.PI / 2; g.add(sea);
      const C = { // [경도, 위도]
        '예루살렘': [35.2, 31.8], '안디옥': [36.2, 36.2], '다소': [34.9, 36.9], '구브로': [33.2, 35.0],
        '에베소': [27.3, 37.9], '빌립보': [24.3, 41.0], '데살로니가': [22.9, 40.6], '아덴': [23.7, 38.0],
        '고린도': [22.9, 37.9], '로마': [12.5, 41.9], '멜리데': [14.4, 35.9], '갈라디아': [32.5, 38.5]
      };
      const P = (n) => new T.Vector3((C[n][0] - 24) * 1.25, 0, -(C[n][1] - 37) * 1.6);
      const land = mat('#cdb88e', { flatShading: true });
      const r = rng(7);
      // 육지 덩어리(대략적 표시)
      [['갈라디아', 5.5, 3], ['다소', 2.5, 1.5], ['데살로니가', 3.5, 2.5], ['로마', 2.5, 4], ['예루살렘', 2.2, 3], ['고린도', 1.6, 1.4], ['에베소', 2.2, 2]].forEach(([n, sx, sz]) => {
        const m = new T.Mesh(new T.CylinderGeometry(1, 1.1, 0.3, 9), land);
        const p = P(n); m.position.set(p.x + (r() - 0.5), 0.15, p.z + (r() - 0.5)); m.scale.set(sx, 1, sz); g.add(m);
      });
      const pin = mat('#f2e6c9');
      Object.keys(C).forEach((n) => { const p = P(n); const c = cyl(0.12, 0.12, 0.9, pin, 8); c.position.set(p.x, 0.75, p.z); g.add(c); });
      const routes = [
        { c: '#e5b96f', path: ['안디옥', '구브로', '갈라디아', '안디옥'] },
        { c: '#8fd0c0', path: ['안디옥', '갈라디아', '빌립보', '데살로니가', '아덴', '고린도', '에베소', '예루살렘'] },
        { c: '#e69a7f', path: ['안디옥', '갈라디아', '에베소', '빌립보', '고린도', '에베소', '예루살렘'] },
        { c: '#b9a6ec', path: ['예루살렘', '구브로', '멜리데', '로마'] }
      ];
      routes.forEach((rt, k) => {
        for (let i = 0; i < rt.path.length - 1; i++) {
          const a = P(rt.path[i]), b = P(rt.path[i + 1]);
          const mid = a.clone().add(b).multiplyScalar(0.5); mid.y = 1 + a.distanceTo(b) * 0.18 + k * 0.25;
          const curve = new T.QuadraticBezierCurve3(a.clone().setY(0.9), mid, b.clone().setY(0.9));
          g.add(new T.Mesh(new T.TubeGeometry(curve, 24, 0.06, 6), new T.MeshBasicMaterial({ color: rt.c })));
        }
      });
      g.position.x = -3;
      return { group: g, radius: 22, height: 14 };
    },

    /* 이스라엘 지형 — 서→동 단면 띠 (과장된 높이) */
    terrain() {
      const g = new T.Group();
      const W = 24, D = 30, SX = 96, SZ = 120;
      const geo = new T.PlaneGeometry(W, D, SX, SZ); geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position; const cols = []; const col = new T.Color();
      const r = rng(11); const bumps = Array.from({ length: 40 }, () => [r() * W - W / 2, r() * D - D / 2, r() * 1.2 + 0.4, r() * 0.5]);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i); const t = (x + W / 2) / W; // 0=서(지중해) 1=동
        let h;
        if (t < 0.12) h = -0.3;                                  // 바다
        else if (t < 0.28) h = 0.15;                             // 해안 평야
        else if (t < 0.42) h = 0.15 + (t - 0.28) * 7;            // 셰펠라
        else if (t < 0.62) h = 1.6 + Math.sin((t - 0.42) * 15) * 0.25; // 중앙 산지
        else if (t < 0.72) h = 1.6 - (t - 0.62) * 34;            // 동쪽 비탈
        else if (t < 0.8) h = -1.8;                              // 요단 골짜기
        else if (t < 0.88) h = -1.8 + (t - 0.8) * 42;            // 동편 절벽
        else h = 1.6;                                            // 요단 동편 고원
        if (t > 0.12) for (const [bx, bz, br, bh] of bumps) { const d = Math.hypot(x - bx, z - bz); if (d < br) h += bh * (1 - d / br) * 0.6; }
        pos.setY(i, h);
        if (h < -0.25 && t < 0.2) col.set('#2c5566'); else if (h < -1.2) col.set('#b9a37a'); else if (h < 0.5) col.set('#b9b07a'); else if (h < 1.4) col.set('#9aa36d'); else col.set('#c7b48b');
        cols.push(col.r, col.g, col.b);
      }
      geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
      g.add(new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })));
      // 갈릴리 바다(북) · 사해(남)
      const lake = (z, len, c) => { const m = new T.Mesh(new T.CylinderGeometry(1, 1, 0.05, 24), mat(c, { roughness: 0.3 })); m.scale.set(0.9, 1, len); m.position.set(-W / 2 + W * 0.76, -1.75, z); g.add(m); };
      lake(-10, 1.6, '#3b7d8c'); lake(7, 3.5, '#4f8f8a');
      const river = box(0.18, 0.04, 14, mat('#3b7d8c')); river.position.set(-W / 2 + W * 0.76, -1.76, -1.5); g.add(river);
      return { group: g, radius: 24, height: 16 };
    },

    /* 예수님 당시 갈릴리 마을 */
    village() {
      const g = new T.Group();
      g.add(ground('#cdb88e'));
      const lake = new T.Mesh(new T.CircleGeometry(30, 40, -Math.PI / 2, Math.PI), mat('#3a6f7f', { roughness: 0.3 }));
      lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.02, -7); g.add(lake);
      const stone = mat('#8f8676', { flatShading: true }), lime = mat('#d9cdb4'), wood = mat('#6b4a2c');
      const r = rng(3);
      const house = (x, z, w, d, rot) => {
        const h = box(w, 1.3, d, stone); h.position.set(x, 0.65, z); h.rotation.y = rot; g.add(h);
        const roof = box(w + 0.1, 0.12, d + 0.1, lime); roof.position.set(x, 1.36, z); roof.rotation.y = rot; g.add(roof);
        const st = box(0.35, 0.65, 1.0, stone); st.position.set(x + Math.cos(rot) * (w / 2 + 0.2), 0.33, z - Math.sin(rot) * (w / 2 + 0.2)); st.rotation.y = rot; g.add(st);
      };
      for (let i = 0; i < 11; i++) {
        const x = (r() - 0.5) * 16, z = r() * 8 - 1;
        if (Math.abs(x) < 2.6 && z < 4 && z > 0) continue;
        house(x, z, 1.6 + r() * 1.2, 1.4 + r() * 0.9, Math.floor(r() * 4) * Math.PI / 2);
      }
      // 회당
      const syn = box(4, 2, 3, mat('#b8ad98')); syn.position.set(0, 1, 2); g.add(syn);
      const synRoof = box(4.3, 0.15, 3.3, lime); synRoof.position.set(0, 2.07, 2); g.add(synRoof);
      for (let i = 0; i < 4; i++) { const c = cyl(0.12, 0.12, 1.6, lime, 10); c.position.set(-1.5 + i, 0.8, 0.3); g.add(c); }
      // 배
      const boat = box(2.4, 0.35, 0.8, wood); boat.position.set(-3, 0.15, -4.5); boat.rotation.y = 0.3; g.add(boat);
      const mast = cyl(0.04, 0.04, 1.6, wood, 6); mast.position.set(-3, 1, -4.5); g.add(mast);
      for (let i = 0; i < 7; i++) tree(g, (r() - 0.5) * 20, 6 + r() * 4, 0.8 + r() * 0.4);
      return { group: g, radius: 14, height: 8 };
    }
  };

  /* ---------- 렌더러 하나로 모든 스케치를 그립니다 ---------- */
  let renderer = null;
  function getRenderer() {
    if (renderer) return renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    return renderer;
  }

  function makeScene(kind) {
    const make = TEASERS[kind]; if (!make) return null;
    const scene = new T.Scene();
    scene.background = new T.Color('#1d302d');
    scene.fog = new T.Fog('#1d302d', 30, 90);
    scene.add(new T.HemisphereLight('#f6ecd6', '#2e3a33', 0.42));
    const sun = new T.DirectionalLight('#fff1d6', 0.62); sun.position.set(12, 20, 10); scene.add(sun);
    const info = make();
    scene.add(info.group);
    const camera = new T.PerspectiveCamera(38, 16 / 10, 0.1, 300);
    return { scene, camera, info };
  }

  function placeCamera(s, angle) {
    const { radius, height } = s.info;
    s.camera.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    s.camera.lookAt(0, 0.5, 0);
  }

  const snapCache = {};
  /** 카드용 정지 이미지(dataURL) */
  function snapshot(kind, w = 640, h = 400) {
    if (snapCache[kind]) return snapCache[kind];
    const r = getRenderer(); const s = makeScene(kind); if (!r || !s) return null;
    r.setSize(w, h, false); s.camera.aspect = w / h; s.camera.updateProjectionMatrix();
    placeCamera(s, 0.75);
    r.render(s.scene, s.camera);
    return (snapCache[kind] = r.domElement.toDataURL('image/jpeg', 0.85));
  }

  /** 미리보기 창용 회전 장면. stop() 함수를 돌려줍니다. */
  function mount(kind, host) {
    const r = getRenderer(); const s = makeScene(kind); if (!r || !s) return () => {};
    host.appendChild(r.domElement);
    r.domElement.style.width = '100%'; r.domElement.style.height = '100%'; r.domElement.style.display = 'block';
    let angle = 0.75, raf = 0, drag = null, auto = true;
    const resize = () => {
      const w = host.clientWidth || 640, h = host.clientHeight || 400;
      r.setSize(w, h, false); s.camera.aspect = w / h; s.camera.updateProjectionMatrix();
    };
    const onDown = (e) => { drag = e.clientX; auto = false; r.domElement.setPointerCapture?.(e.pointerId); };
    const onMove = (e) => { if (drag == null) return; angle += (e.clientX - drag) * 0.008; drag = e.clientX; };
    const onUp = () => { drag = null; setTimeout(() => (auto = true), 2500); };
    r.domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    const ro = new ResizeObserver(resize); ro.observe(host); resize();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = () => { if (auto && !reduce) angle += 0.0035; placeCamera(s, angle); r.render(s.scene, s.camera); raf = requestAnimationFrame(loop); };
    loop();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      r.domElement.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (r.domElement.parentNode === host) host.removeChild(r.domElement);
      s.scene.traverse((o) => { o.geometry?.dispose?.(); });
    };
  }

  window.Bible3DTeasers = { snapshot, mount, has: (k) => !!TEASERS[k] };
})();
