# MAQPIE Portfolio

UiPath 기반 RPA 개발자 포트폴리오 사이트. 빌드 도구 없는 정적 사이트(HTML / CSS / Vanilla JS)입니다.

## 폴더 구조

```
.
├── index.html                  메인 페이지 (소개 / 프로젝트 / 연락처)
├── data/projects.json          프로젝트 데이터 (단일 소스)
├── pages/
│   ├── project-detail.html     프로젝트 상세 (?id= 로 조회)
│   └── about.html              (미작성)
└── assets/
    ├── css/reset.css           최소 리셋
    ├── css/style.css           레이아웃 / 컴포넌트
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
  "stack": ["UiPath", "Python"],
  "summary": "한 줄 요약",
  "thumb": "assets/img/projects/파일명.png",
  "detail": "상세 페이지에 표시할 본문"
}
```

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

## 남은 작업

- `index.html` 의 소개 문구 채우기
- `assets/img/projects/fleet.png` 썸네일 추가 (없으면 회색 플레이스홀더로 표시됨)
- `assets/files/resume.pdf` 실제 이력서로 교체
- `pages/about.html` 작성 여부 결정
