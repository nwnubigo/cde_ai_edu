# 소상공인 AI 홍보마케팅 교육 — 안내·신청 홈페이지

남원AI연구회 · 강사 조수영. 소상공인 대상 AI 홍보마케팅 교육을 알리고 **신청 전환**을 만드는 원페이지 랜딩 사이트입니다.
빌드 도구 없이 동작하는 정적 사이트라 파일을 그대로 올리면 배포가 끝납니다.

핵심 메시지: **"AI 활용, 이제 선택이 아니라 필수입니다"** (홍보영상 나레이션과 동일)

## 폴더 구성

```
.
├─ index.html            메인 랜딩 (히어로 → 공감 → 해결 → 특징 → 커리큘럼 → 안내 → 강사 → 단체 → FAQ → 신청)
├─ privacy.html          개인정보처리방침
├─ 404.html              없는 주소로 들어왔을 때
├─ robots.txt            검색엔진 수집 허용
├─ sitemap.xml           사이트맵
├─ netlify.toml          Netlify 배포·캐시·보안 헤더 설정
├─ assets/
│  ├─ css/style.css      스타일 (라이트/다크 자동 대응, 모바일 우선, 인쇄용 포함)
│  ├─ js/main.js         모바일 메뉴 · 신청 폼 · 공유하기 · 등장 효과
│  └─ img/               hero.jpg · phone.jpg · class.jpg · favicon.svg
└─ docs/
   ├─ 01_홍보영상_기획안.md      60초·30초 홍보영상 콘티와 나레이션 전문
   ├─ 02_웹사이트_기획안.md      사이트 기획 원안 (타깃·구조·디자인 가이드)
   └─ 영상편집_스크립트_build.py  ffmpeg 영상 조립 스크립트 (참고용)
```

## 바로 보기

`index.html`을 더블클릭하면 브라우저에서 열립니다. (글꼴은 Google Fonts에서 불러오므로 인터넷 연결 필요)

로컬 서버로 확인하려면:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## 현재 배포 주소

**https://nwnubigo.github.io/cde_ai_edu/**

GitHub Pages로 **자동 배포**됩니다. 이 브랜치에 push하면
`.github/workflows/sync-gh-pages.yml`이 내용을 `gh-pages` 브랜치로 복사하고,
GitHub Pages가 그 브랜치를 받아 1~2분 안에 사이트에 반영합니다. 별도 조작은 없습니다.

배포 구조:

```
작업 브랜치에 push
   → Sync gh-pages 워크플로 실행
   → gh-pages 브랜치 갱신
   → GitHub Pages 빌드 → https://nwnubigo.github.io/cde_ai_edu/
```

Netlify 프로젝트(`sosangongin-ai-edu`)도 미리 만들어 뒀습니다. 그쪽을 쓰시려면
Netlify에서 이 저장소를 연결(Import from GitHub)하면 `netlify.toml` 설정대로 배포됩니다.

## 배포 방법 (무료)

| 방법 | 절차 |
|---|---|
| **Netlify (추천)** | netlify.com 로그인 → Add new site → 이 저장소 연결 (또는 폴더 드래그) → 몇 초 뒤 주소 발급. `netlify.toml`이 있어 별도 설정 불필요 |
| **GitHub Pages** | 저장소 Settings → Pages → Branch를 이 브랜치 / 폴더는 `/ (root)`로 지정 |
| **Vercel** | 프로젝트 임포트 → Framework Preset을 `Other`로 두고 배포 |

배포 후 도메인 `소상공인AI홍보마케팅.신청하기.com`을 연결하고(호스팅 설정 → Domain → 도메인 등록업체 DNS에 CNAME/A 레코드 입력), HTTPS를 켜면 끝입니다.

## 오픈 전 바꿀 곳

| 찾을 문자열 | 바꿀 내용 | 위치 |
|---|---|---|
| `010-8366-8536` | 문의 전화번호 | index.html · privacy.html · 404.html · `main.js`의 `PHONE` 상수 |
| `su000@hanmail.net` | 문의 이메일 | index.html · privacy.html |
| `신청 시 안내` | 수강료가 확정되면 금액으로 | index.html 교육 안내 표 |
| `nwnubigo.github.io/cde_ai_edu` | 한글 도메인 연결 후 그 주소로 (퓨니코드: `xn--ai-he2iv73b8zdy2gupbu8y5pq9oj55i.xn--ok0b850bc9gv3i.com`) | index.html의 canonical·og:url·og:image, robots.txt, sitemap.xml, 404.html |
| `<div class="hero-media">` 안의 `<img>` | 유튜브 업로드 후 `<iframe>` 임베드로 교체 가능 | index.html |

> 카카오톡 공유 미리보기(og:image)는 **절대 주소**여야 보입니다. 도메인을 연결한 뒤 반드시 위 주소를 실제 도메인으로 바꿔주세요.

## 신청 폼 작동 방식

서버 없이 동작합니다. "신청 내용 보내기"를 누르면 입력값 검증 후 작성 내용이 담긴 **문자 메시지 창**이 열리고, 전송하면 010-8366-8536으로 접수됩니다. 문자 창이 열리지 않는 환경(PC 등)을 위해 "내용 복사" 버튼도 있습니다. 개인정보가 서버에 저장되지 않는다는 점은 `privacy.html`에 그대로 안내되어 있습니다.

구글폼으로 바꾸려면 `index.html`의 `<form id="form"> … </form>` 블록을 아래로 교체하세요.

```html
<a class="btn btn-primary" href="구글폼_링크" target="_blank" rel="noopener">구글폼으로 신청하기</a>
```

## 포함된 기능

- 모바일 우선 반응형 + 하단 고정 [신청하기] 버튼 (스마트폰 유입 대응)
- 라이트/다크 모드 자동 대응, 본문 18px·버튼 높이 56px 이상 (40~60대 가독성)
- 모바일 햄버거 메뉴, 본문 바로가기 링크, 폼 오류 인라인 안내 (접근성)
- 카카오톡·SNS 공유 미리보기(OG/Twitter 카드), Course·FAQPage 구조화 데이터(JSON-LD)
- "사장님께 알리기" 공유 버튼 (모바일 공유 시트 / PC는 주소 복사)
- 기관 담당자용 인쇄 스타일 (Ctrl+P로 제안 검토용 출력)

## 영상 자산

홍보영상 파일(60초 16:9 · 30초 9:16)은 용량 때문에 저장소에 포함하지 않았습니다. 유튜브에 올린 뒤 히어로 영역의 `<img>`를 `<iframe>`으로 교체하면 됩니다. 재편집은 `docs/영상편집_스크립트_build.py`를 참고하세요. (엔딩 카드 문구·자막·나레이션 타이밍은 파일 하단 `ending=` / `scenes=` / `vos=` 에서 수정)
