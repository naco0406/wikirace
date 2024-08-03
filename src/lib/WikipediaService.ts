import axios from 'axios';

const BASE_URL = 'https://ko.wikipedia.org/api/rest_v1';

type ApiMethod = {
    method: (...args: any[]) => Promise<any>;
    description: string;
    url: string;
    inputs: { name: string; description: string }[];
    responseType: 'json' | 'html' | 'pdf';
};

export const WikipediaAPI: { [key: string]: ApiMethod } = {
    GET_page: {
        method: async () => axios.get(`${BASE_URL}/page/`),
        description: "페이지 관련 API 진입점 목록을 가져옵니다.",
        url: '/page/',
        inputs: [],
        responseType: 'json'
    },
    GET_page_title: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/title/${encodeURIComponent(title)}`),
        description: "제목에 대한 리비전 메타데이터를 가져옵니다.",
        url: '/page/title/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_title_revision: {
        method: async (title: string, revision: string) => axios.get(`${BASE_URL}/page/title/${encodeURIComponent(title)}/${revision}`),
        description: "특정 제목/리비전에 대한 리비전 메타데이터를 가져옵니다.",
        url: '/page/title/{title}/{revision}',
        inputs: [
            { name: "title", description: "페이지 제목" },
            { name: "revision", description: "리비전 ID" }
        ],
        responseType: 'json'
    },
    GET_page_html: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/html/${encodeURIComponent(title)}`),
        description: "페이지의 최신 HTML을 가져옵니다.",
        url: '/page/html/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'html'
    },
    GET_page_html_revision: {
        method: async (title: string, revision: string) => axios.get(`${BASE_URL}/page/html/${encodeURIComponent(title)}/${revision}`),
        description: "특정 제목/리비전의 HTML을 가져옵니다.",
        url: '/page/html/{title}/{revision}',
        inputs: [
            { name: "title", description: "페이지 제목" },
            { name: "revision", description: "리비전 ID" }
        ],
        responseType: 'html'
    },
    GET_page_data_parsoid: {
        method: async (title: string, revision: string, tid: string) => axios.get(`${BASE_URL}/page/data-parsoid/${encodeURIComponent(title)}/${revision}/${tid}`),
        description: "특정 제목/리비전/tid에 대한 data-parsoid 메타데이터를 가져옵니다.",
        url: '/page/data-parsoid/{title}/{revision}/{tid}',
        inputs: [
            { name: "title", description: "페이지 제목" },
            { name: "revision", description: "리비전 ID" },
            { name: "tid", description: "Timeuuid" }
        ],
        responseType: 'json'
    },
    GET_page_lint: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/lint/${encodeURIComponent(title)}`),
        description: "페이지의 린터 오류를 가져옵니다.",
        url: '/page/lint/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_segments: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/segments/${encodeURIComponent(title)}`),
        description: "기계 번역에 사용될 세그먼트된 페이지를 가져옵니다.",
        url: '/page/segments/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_summary: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/summary/${encodeURIComponent(title)}`),
        description: "기본 메타데이터와 간단한 기사 소개를 가져옵니다.",
        url: '/page/summary/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_media_list: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/media-list/${encodeURIComponent(title)}`),
        description: "페이지에 사용된 미디어 파일 목록을 가져옵니다.",
        url: '/page/media-list/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_mobile_html: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/mobile-html/${encodeURIComponent(title)}`),
        description: "모바일 소비에 최적화된 페이지 콘텐츠 HTML을 가져옵니다.",
        url: '/page/mobile-html/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'html'
    },
    GET_page_mobile_html_offline_resources: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/mobile-html-offline-resources/${encodeURIComponent(title)}`),
        description: "모바일 HTML 형식 페이지의 오프라인 소비를 위한 스타일과 스크립트를 가져옵니다.",
        url: '/page/mobile-html-offline-resources/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_related: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/related/${encodeURIComponent(title)}`),
        description: "주어진 제목과 관련된 페이지들을 가져옵니다.",
        url: '/page/related/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_random: {
        method: async (format: string) => axios.get(`${BASE_URL}/page/random/${format}`),
        description: "무작위 페이지의 콘텐츠를 가져옵니다.",
        url: '/page/random/{format}',
        inputs: [{ name: "format", description: "응답 형식 (title, html, summary 등)" }],
        responseType: 'json'
    },
    GET_page_pdf: {
        method: async (title: string, format: string = 'a4', type: string = 'desktop') => axios.get(`${BASE_URL}/page/pdf/${encodeURIComponent(title)}/${format}/${type}`, { responseType: 'arraybuffer' }),
        description: "페이지를 PDF로 가져옵니다.",
        url: '/page/pdf/{title}/{format}/{type}',
        inputs: [
            { name: "title", description: "페이지 제목" },
            { name: "format", description: "PDF 형식 (기본값: a4)" },
            { name: "type", description: "렌더링 타입 (기본값: desktop)" }
        ],
        responseType: 'pdf'
    },
    GET_page_mobile_sections: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/mobile-sections/${encodeURIComponent(title)}`),
        description: "제목에 대한 모바일 최적화된 HTML 섹션을 가져옵니다.",
        url: '/page/mobile-sections/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_mobile_sections_lead: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/mobile-sections-lead/${encodeURIComponent(title)}`),
        description: "제목에 대한 모바일 최적화된 HTML 선두 섹션과 메타데이터를 가져옵니다.",
        url: '/page/mobile-sections-lead/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_page_mobile_sections_remaining: {
        method: async (title: string) => axios.get(`${BASE_URL}/page/mobile-sections-remaining/${encodeURIComponent(title)}`),
        description: "제목에 대한 비선두 모바일 최적화된 HTML 섹션을 가져옵니다.",
        url: '/page/mobile-sections-remaining/{title}',
        inputs: [{ name: "title", description: "페이지 제목" }],
        responseType: 'json'
    },
    GET_data_css_mobile: {
        method: async (type: string) => axios.get(`${BASE_URL}/data/css/mobile/${type}`),
        description: "모바일 앱용 CSS를 가져옵니다.",
        url: '/data/css/mobile/{type}',
        inputs: [{ name: "type", description: "CSS 타입" }],
        responseType: 'json'
    },
    GET_data_javascript_mobile: {
        method: async (type: string) => axios.get(`${BASE_URL}/data/javascript/mobile/${type}`),
        description: "모바일 앱용 JavaScript를 가져옵니다.",
        url: '/data/javascript/mobile/{type}',
        inputs: [{ name: "type", description: "JavaScript 타입" }],
        responseType: 'json'
    },
    GET_data_i18n: {
        method: async (type: string) => axios.get(`${BASE_URL}/data/i18n/${type}`),
        description: "I18n 정보를 가져옵니다.",
        url: '/data/i18n/{type}',
        inputs: [{ name: "type", description: "I18n 타입" }],
        responseType: 'json'
    },
};

export const apiCategories = {
    'Page Content': ['GET_page', 'GET_page_title', 'GET_page_title_revision', 'GET_page_html', 'GET_page_html_revision', 'GET_page_data_parsoid', 'GET_page_lint', 'GET_page_segments', 'GET_page_summary', 'GET_page_media_list', 'GET_page_related', 'GET_page_random', 'GET_page_pdf'],
    'Mobile': ['GET_page_mobile_html', 'GET_page_mobile_html_offline_resources', 'GET_page_mobile_sections', 'GET_page_mobile_sections_lead', 'GET_page_mobile_sections_remaining'],
    'Data': ['GET_data_css_mobile', 'GET_data_javascript_mobile', 'GET_data_i18n'],
};

export const importantAPIs = ['GET_page_html', 'GET_page_summary', 'GET_page_mobile_html', 'GET_page_random', 'GET_page_related'];