# MAQPIE Portfolio

UiPath RPA 개발자 이상화의 포트폴리오 사이트. 빌드 도구 없는 정적 사이트(HTML / CSS / Vanilla JS)입니다.

다크 테마가 기본이며, OS 설정이 라이트 테마이면 `prefers-color-scheme` 로 자동 전환됩니다.

## 콘텐츠 원본은 Notion

프로젝트 내용의 **원본은 Notion `Portfolio` 페이지의 `프로젝트` 데이터베이스**입니다.
이 저장소는 그중 공개할 것만 골라 보여주는 창구입니다.

```
Notion 프로젝트 DB  ──(사이트 공개 ✓ 인 항목만)──▶  data/projects.json  ──▶  사이트
```

Notion DB 속성과 `projects.json` 필드는 다음과 같이 대응합니다.

| Notion 속성 | projects.json |
| --- | --- |
| 제목 | `title` |
| 사이트 ID | `id` |
| 기간 | `period` |
| 역할 | `role` |
| 기술 스택 | `stack` (배열) |
| 한 줄 요약 | `summary` |
| 문제 | `problem` |
| 접근 | `approach` (줄바꿈 → 배열) |
| 결과 | `result` |
| 사이트 공개 | 체크된 항목만 JSON 에 포함 |

`thumb` 은 Notion 에 없습니다. 이미지를 `assets/img/projects/` 에 넣고 경로를 직접 적으면 됩니다.

새 프로젝트를 사이트에 올리는 순서: **Notion 에서 내용을 채우고 → `사이트 공개` 체크 → `projects.json` 에 항목 추가.**

## 폴더 구조

```
.
├── index.html                  메인 (히어로 / 소개 / 기술 / 프로젝트 / 연락처)
├── data/projects.json          프로젝트 데이터 (단일 소스)
├── pages/
│   ├── about.html              소개 상세
│   └── project-detail.html     프로젝트 상세 (?id= 로 조회)
└── assets/
    ├── css/reset.css           최소 리셋
    ├── css/style.css           테마 토큰 · 레이아웃 · 컴포넌트
    ├── js/main.js              목록·상세 렌더링
    ├── img/projects/           프로젝트 썸네일
    ├── img/profile/            프로필 이미지
    └── files/resume.pdf        이력서
```

## 동작 방식

`data/projects.json` 이 유일한 데이터 소스입니다.

1. `index.html` 이 `assets/js/main.js` 를 로드
2. `main.js` 가 `projects.json` 을 `fetch` 해서 `#project-list` 에 카드 렌더링
3. 카드를 누르면 `pages/project-detail.html?id=<id>` 로 이동
4. 상세 페이지가 같은 JSON 에서 해당 `id` 를 찾아 내용을 채움

프로젝트를 추가하려면 `projects.json` 에 항목 하나를 넣기만 하면 됩니다. HTML 은 건드릴 필요가 없습니다.

```json
{
  "id": "고유-식별자",
  "title": "프로젝트 제목",
  "period": "2026.05 ~",
  "role": "설계 · 개발",
  "stack": ["UiPath", "Python"],
  "summary": "목록 카드에 보이는 한 줄 요약",
  "thumb": "assets/img/projects/파일명.png",
  "problem": "어떤 불편이 있었는지",
  "approach": ["어떻게 접근했는지", "단계별로 한 줄씩"],
  "result": "무엇이 달라졌는지"
}
```

`problem` / `approach` / `result` / `role` 은 없으면 해당 블록이 그냥 빠집니다.

### 예시 항목 표시

`"example": true` 를 붙이면 카드에 **예시** 배지가 붙습니다.
아직 확정되지 않은 항목을 임시로 올려둘 때 쓰세요. 현재 사용 중인 항목은 없습니다.

### 썸네일

`thumb` 파일이 없으면 제목에서 뽑은 이니셜을 얹은 그라데이션 SVG 가 자동으로 그려집니다.
`assets/img/projects/` 에 실제 이미지를 넣으면 그쪽이 우선합니다. 16:9 비율을 권장합니다.

## 로컬 실행

`fetch` 를 사용하므로 **`index.html` 을 더블클릭해서 열면(`file://`) CORS 에 막혀 프로젝트 목록이 비어 보입니다.** 반드시 HTTP 서버로 띄우세요.

```bash
python -m http.server 5500
# http://localhost:5500 접속
```

VS Code 를 쓴다면 Live Server 확장으로 열어도 됩니다.

## 배포

빌드 과정이 없으므로 GitHub Pages 에 그대로 올릴 수 있습니다.
저장소 **Settings → Pages** 에서 Source 를 `main` 브랜치 `/ (root)` 로 지정하면 됩니다.

## 채워야 할 내용

- **Notion 프로젝트 DB** — SK텔레콤 담당 9건이 제목만 들어가 있습니다.
  내용을 채우고 `사이트 공개` 를 켠 뒤 `projects.json` 으로 옮기세요.
  사내 시스템 이름을 공개 사이트에 올려도 되는지는 먼저 확인이 필요합니다.
- `pages/about.html` 의 **자격 · 교육** 섹션 — 해당 없으면 섹션째 삭제
- `index.html` 의 **기술 스택** — 실제 사용 도구에 맞게 조정
- `assets/img/projects/fleet.png` — 없으면 자동 생성 SVG 로 대체됩니다
- `assets/files/resume.pdf` — 현재 빈 파일
