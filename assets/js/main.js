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

/* ------------------------------------------------------------------ *
 * 썸네일 폴백
 *
 * assets/img/projects/ 에 실제 이미지가 없어도 빈 회색 박스가 보이지
 * 않도록, 제목에서 뽑은 이니셜을 얹은 그라데이션 SVG 를 그려 넣습니다.
 * 실제 이미지 파일을 넣으면 그쪽이 우선합니다.
 * ------------------------------------------------------------------ */

/** 문자열을 0~359 사이 색상값으로 바꿉니다. (같은 프로젝트는 항상 같은 색) */
function hueFrom(text) {
    let hash = 0;
    for (const ch of text) {
        hash = (hash * 31 + ch.codePointAt(0)) % 360;
    }
    return hash;
}

/** 제목에서 표시용 이니셜을 뽑습니다. */
function initialsFrom(title) {
    return title.trim().slice(0, 2);
}

/** 프로젝트용 플레이스홀더 SVG 를 data URI 로 만듭니다. */
function placeholderThumb(project) {
    const hue = hueFrom(project.id || project.title);
    const label = initialsFrom(project.title);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img">
        <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="hsl(${hue} 60% 22%)"/>
                <stop offset="100%" stop-color="hsl(${(hue + 48) % 360} 55% 12%)"/>
            </linearGradient>
        </defs>
        <rect width="320" height="180" fill="url(#g)"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
              font-family="system-ui, sans-serif" font-size="48" font-weight="700"
              fill="hsl(${hue} 70% 78%)" fill-opacity="0.85">${label}</text>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " "))}`;
}

/** 이미지 로드에 실패하면 플레이스홀더로 교체합니다. */
function attachThumbFallback(img, project) {
    img.addEventListener(
        "error",
        () => {
            img.classList.add("is-placeholder");
            img.src = placeholderThumb(project);
            img.alt = `${project.title} 이미지 준비 중`;
        },
        { once: true }
    );
}

/* ------------------------------------------------------------------ *
 * 공용 빌더
 * ------------------------------------------------------------------ */

/** stack 배열을 태그 목록으로 만듭니다. */
function buildTagList(items) {
    const ul = document.createElement("ul");
    ul.className = "tag-list";
    (items || []).forEach((name) => {
        const li = document.createElement("li");
        li.className = "tag";
        li.textContent = name;
        ul.append(li);
    });
    return ul;
}

/** 안내 문구용 요소를 만듭니다. */
function buildMessage(text, tag = "li") {
    const el = document.createElement(tag);
    el.className = "message";
    el.textContent = text;
    return el;
}

/** projects.json 을 읽어옵니다. */
async function loadProjects() {
    const res = await fetch(DATA_URL);
    if (!res.ok) {
        throw new Error(`projects.json 요청 실패 (HTTP ${res.status})`);
    }
    return res.json();
}

/* ------------------------------------------------------------------ *
 * 목록 페이지
 * ------------------------------------------------------------------ */

function buildProjectCard(project) {
    const li = document.createElement("li");
    li.className = "project-card";

    const link = document.createElement("a");
    link.className = "project-card__link";
    link.href = detailUrl(project.id);

    const figure = document.createElement("div");
    figure.className = "project-card__media";

    const img = document.createElement("img");
    img.className = "project-card__thumb";
    img.alt = `${project.title} 썸네일`;
    // loading="lazy" 를 쓰면 카드가 화면에 들어올 때까지 로드가 미뤄지고,
    // 이미지가 없을 때 폴백도 그만큼 늦게 그려집니다. 카드 수가 적어 즉시 로드합니다.
    attachThumbFallback(img, project);
    img.src = thumbUrl(project.thumb);
    figure.append(img);

    // 샘플로 넣어둔 항목임을 눈에 띄게 표시합니다. (실제 프로젝트로 바꿀 때 example 필드를 지우세요)
    if (project.example) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "예시";
        figure.append(badge);
    }

    const body = document.createElement("div");
    body.className = "project-card__body";

    const period = document.createElement("p");
    period.className = "project-card__period";
    period.textContent = project.period;

    const title = document.createElement("h3");
    title.className = "project-card__title";
    title.textContent = project.title;

    const summary = document.createElement("p");
    summary.className = "project-card__summary";
    summary.textContent = project.summary;

    body.append(period, title, summary, buildTagList(project.stack));
    link.append(figure, body);
    li.append(link);
    return li;
}

async function renderProjectList(listEl) {
    try {
        const projects = await loadProjects();
        if (!projects.length) {
            listEl.replaceChildren(buildMessage("등록된 프로젝트가 없습니다."));
            return;
        }
        listEl.replaceChildren(...projects.map(buildProjectCard));
    } catch (err) {
        console.error(err);
        listEl.replaceChildren(buildMessage("프로젝트를 불러오지 못했습니다."));
    }
}

/* ------------------------------------------------------------------ *
 * 상세 페이지
 * ------------------------------------------------------------------ */

/** 제목 + 본문 한 덩어리를 만듭니다. 내용이 없으면 null 을 돌려줍니다. */
function buildDetailBlock(heading, content) {
    if (!content || (Array.isArray(content) && !content.length)) {
        return null;
    }

    const section = document.createElement("section");
    section.className = "detail__block";

    const h2 = document.createElement("h2");
    h2.className = "detail__block-title";
    h2.textContent = heading;
    section.append(h2);

    if (Array.isArray(content)) {
        const ul = document.createElement("ul");
        ul.className = "detail__steps";
        content.forEach((line) => {
            const li = document.createElement("li");
            li.textContent = line;
            ul.append(li);
        });
        section.append(ul);
    } else {
        const p = document.createElement("p");
        p.textContent = content;
        section.append(p);
    }

    return section;
}

/** 기간 / 역할 같은 짧은 항목을 정의 목록으로 만듭니다. */
function buildMetaList(project) {
    const dl = document.createElement("dl");
    dl.className = "detail__meta";

    const entries = [
        ["기간", project.period],
        ["역할", project.role],
    ].filter(([, value]) => value);

    entries.forEach(([key, value]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        dt.textContent = key;
        const dd = document.createElement("dd");
        dd.textContent = value;
        row.append(dt, dd);
        dl.append(row);
    });

    return dl;
}

async function renderProjectDetail(rootEl) {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
        rootEl.replaceChildren(buildMessage("프로젝트가 지정되지 않았습니다.", "p"));
        return;
    }

    try {
        const projects = await loadProjects();
        const project = projects.find((p) => p.id === id);

        if (!project) {
            rootEl.replaceChildren(
                buildMessage(`'${id}' 프로젝트를 찾을 수 없습니다.`, "p")
            );
            return;
        }

        document.title = `${project.title} | MAQPIE`;

        const header = document.createElement("header");
        header.className = "detail__header";

        const eyebrow = document.createElement("p");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = "Project";

        const title = document.createElement("h1");
        title.className = "detail__title";
        title.textContent = project.title;

        const summary = document.createElement("p");
        summary.className = "detail__summary";
        summary.textContent = project.summary;

        header.append(eyebrow, title, summary, buildMetaList(project));

        const img = document.createElement("img");
        img.className = "detail__thumb";
        img.alt = `${project.title} 대표 이미지`;
        attachThumbFallback(img, project);
        img.src = thumbUrl(project.thumb);

        const blocks = [
            buildDetailBlock("문제", project.problem),
            buildDetailBlock("접근", project.approach),
            buildDetailBlock("결과", project.result),
        ].filter(Boolean);

        // 스택은 문단이 아니라 태그로 보여주므로 따로 만듭니다.
        const stackBlock = document.createElement("section");
        stackBlock.className = "detail__block";
        const stackTitle = document.createElement("h2");
        stackTitle.className = "detail__block-title";
        stackTitle.textContent = "사용 기술";
        stackBlock.append(stackTitle, buildTagList(project.stack));

        rootEl.replaceChildren(header, img, stackBlock, ...blocks);
    } catch (err) {
        console.error(err);
        rootEl.replaceChildren(buildMessage("프로젝트를 불러오지 못했습니다.", "p"));
    }
}

/* ------------------------------------------------------------------ *
 * 부트스트랩 - 페이지에 존재하는 컨테이너에 맞는 렌더러만 실행합니다.
 * ------------------------------------------------------------------ */

const listEl = document.querySelector("#project-list");
if (listEl) {
    renderProjectList(listEl);
}

const detailEl = document.querySelector("#project-detail");
if (detailEl) {
    renderProjectDetail(detailEl);
}
