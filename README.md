# 3D로 보는 성경 (BIBLE IN 3D)

장유중앙교회의 3D 성경 공간들을 한곳에 모은 허브 앱입니다.
카드를 누르면 미리보기 창이 열리고, 열린 공간은 그 안에서 **실시간 미리보기**로 바로 만져 볼 수 있습니다.

- 열린 공간: 예루살렘 성 산책 · 솔로몬 성전 산책
- 준비 중: 광야의 성막 · 노아의 방주 · 바울의 선교 여행 · 이스라엘 땅의 지형 · 예수님 당시의 마을과 삶

## 파일 구성

| 파일 | 하는 일 |
|---|---|
| `index.html` | 허브 화면 (갤러리 · 시대순 보기 · 검색 · 미리보기 창) |
| `apps.js` | **공간 목록** — 새 공간은 여기에만 추가하면 됩니다 |
| `teasers.js` | 준비 중인 공간의 3D 구상 스케치 |
| `thumbs/` | 열린 공간의 썸네일 이미지 (16:10, 960×600 권장) |
| `icons/`, `manifest.webmanifest`, `sw.js` | 앱으로 설치(PWA)용 |

## 새 공간을 추가하는 법

1. 새 공간 앱을 지금처럼 별도 저장소로 만들어 배포합니다. (예: `jangyu-church/tabernacle`)
2. 앱 화면을 캡처해 `thumbs/tabernacle.jpg` 로 넣습니다.
3. `apps.js` 에서 해당 항목을 이렇게 바꿉니다.

```js
status: 'live',                                         // 'soon' → 'live'
url: 'https://jangyu-church.github.io/tabernacle/',
thumb: 'thumbs/tabernacle.jpg',
points: ['성막 뜰과 문', '번제단', ...],                // 둘러볼 장소
```

완전히 새로운 공간이라면 항목 하나를 통째로 복사해 붙여 넣고 `id`, `title`, `era.order`(시대순 위치) 등을 고치면 됩니다.
분류를 새로 만들 때는 `BIBLE3D_CATEGORIES` 에 한 줄을 더합니다.

## 배포 (GitHub Pages)

1. `jangyu-church` 조직에 `bible3d` 저장소를 만들고 이 폴더의 파일을 모두 올립니다.
2. Settings → Pages → Branch: `main` / `(root)` 저장.
3. 주소: `https://jangyu-church.github.io/bible3d/`

> 같은 `jangyu-church.github.io` 주소 아래에 있으므로 각 공간 앱을 미리보기 창 안에서 바로 띄울 수 있습니다.
