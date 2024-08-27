export const isDevEnvironment = () => {
    if (typeof window !== 'undefined') {
        // 클라이언트 사이드
        return window.location.hostname === 'linkle-dev.vercel.app';
    }
    // 서버 사이드에서는 항상 false를 반환합니다.
    // 서버 사이드에서 환경을 구분해야 한다면 headers를 사용해야 합니다.
    return false;
};