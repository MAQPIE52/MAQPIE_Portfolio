/**
 * MAQPIE Portfolio - 공용 스크립트
 *
 * data/projects.json 을 단일 데이터 소스로 사용합니다.
 *  - index.html                : #project-list 에 프로젝트 카드 목록을 렌더링
 *  - pages/project-detail.html : ?id= 로 지정된 프로젝트 1건의 상세를 렌더링
 *
 * 주의: fetch 를 사용하므로 file:// 로 열면 CORS 에 막힙니다.
 *       로컬에서는 `python -m http.server 5500` 처럼 HTTP 서버로 띄우세요.
 */

// pages/ 하위 문서에서는 한 단계 위가 사이트 루트입니다.
const BASE = location.pathname.includes("/pages/") ? ".." : ".";

const DATA_URL = `${BASE}/data/projects.json`;

/** 프로젝트 상세 페이지 URL 을 id 로 조립합니다. */
function detailUrl(id) {
    return `${BASE}/pages/project-detail.html?id=${encodeURIComponent(id)}`;
}

/** 썸네일 경로를 현재 문서 기준으로 보정합니다. (JSON 은 루트 기준 경로를 담고 있음) */
function thumbUrl(thumb) {
    return `${BASE}/${thumb}`;
}

// 1x1 투명 GIF. 깨진 이미지 아이콘 대신 회색 박스만 보이게 합니다.
const BLANK_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** 이미지가 없을 때 회색 플레이스홀더로 대체합니다. */
function attachThumbFallback(img) {
    img.addEventListener("error", () => {
        img.classList.add("is-placeholder");
        img.src = BLANK_IMAGE;
        img.alt = "이미지 준비 중";
    });
}

/** stack 배열을 태그 목록 <ul> 로 만듭니다. */
function buildStackList(stack) {
    const ul = document.createElement("ul");
    ul.className = "stack-list";
    (stack || []).forEach((name) => {
        const li = document.createElement("li");
        li.className = "stack-tag";
        li.textContent = name;
        ul.append(li);
    });
    return ul;
}

/** 안내 문구용 요소를 만듭니다. */
function buildMessage(text) {
    const li = document.createElement("li");
    li.className = "message";
    li.textContent = text;
    return li;
}

/** projects.json 을 읽어옵니다. */
async function loadProjects() {
    const res = await fetch(DATA_URL);
    if (!res.ok) {
        throw new Error(`projects.json 요청 실패 (HTTP ${res.status})`);
    }
    return res.json();
}

/** 목록 페이지: 카드 한 장을 만듭니다. */
function buildProjectCard(project) {
    const li = document.createElement("li");
    li.className = "project-card";

    const link = document.createElement("a");
    link.className = "project-card__link";
    link.href = detailUrl(project.id);

    const img = document.createElement("img");
    img.className = "project-card__thumb";
    img.src = thumbUrl(project.thumb);
    img.alt = `${project.title} 썸네일`;
    img.loading = "lazy";
    attachThumbFallback(img);

    const title = document.createElement("h3");
    title.className = "project-card__title";
    title.textContent = project.title;

    const period = document.createElement("p");
    period.className = "project-card__period";
    period.textContent = project.period;

    const summary = document.createElement("p");
    summary.className = "project-card__summary";
    summary.textContent = project.summary;

    link.append(img, title, period, summary, buildStackList(project.stack));
    li.append(link);
    return li;
}

/** 목록 페이지 렌더링 */
async function renderProjectList(listEl) {
    try {
        const projects = await loadProjects();
        if (!projects.length) {
            listEl.append(buildMessage("등록된 프로젝트가 없습니다."));
            return;
        }
        projects.forEach((project) => listEl.append(buildProjectCard(project)));
    } catch (err) {
        console.error(err);
        listEl.append(buildMessage("프로젝트를 불러오지 못했습니다."));
    }
}

/** 상세 페이지 렌더링 */
async function renderProjectDetail(rootEl) {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        rootEl.textContent = "프로젝트가 지정되지 않았습니다.";
        return;
    }

    try {
        const projects = await loadProjects();
        const project = projects.find((p) => p.id === id);

        if (!project) {
            rootEl.textContent = `'${id}' 프로젝트를 찾을 수 없습니다.`;
            return;
        }

        document.title = `${project.title} | MAQPIE`;

        const title = document.createElement("h1");
        title.textContent = project.title;

        const period = document.createElement("p");
        period.className = "detail__period";
        period.textContent = project.period;

        const img = document.createElement("img");
        img.className = "detail__thumb";
        img.src = thumbUrl(project.thumb);
        img.alt = `${project.title} 대표 이미지`;
        attachThumbFallback(img);

        const summary = document.createElement("p");
        summary.className = "detail__summary";
        summary.textContent = project.summary;

        const body = document.createElement("p");
        body.className = "detail__body";
        body.textContent = project.detail || "";

        rootEl.replaceChildren(
            title,
            period,
            img,
            buildStackList(project.stack),
            summary,
            body
        );
    } catch (err) {
        console.error(err);
        rootEl.textContent = "프로젝트를 불러오지 못했습니다.";
    }
}

// 페이지에 존재하는 컨테이너에 따라 알맞은 렌더러를 실행합니다.
const listEl = document.querySelector("#project-list");
if (listEl) {
    renderProjectList(listEl);
}

const detailEl = document.querySelector("#project-detail");
if (detailEl) {
    renderProjectDetail(detailEl);
}
