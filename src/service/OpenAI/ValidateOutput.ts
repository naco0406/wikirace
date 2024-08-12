export const validateJsonOutput = (output: Array<{ index: number; title: string; similarity: number }>, pageTitles: string[]): boolean => {
    // 마지막 항목(목적지)과 "뒤로가기"를 제외한 예상 출력 항목 수 계산
    const expectedCount = pageTitles.length - 1 - pageTitles.filter(title => title === "뒤로가기").length;

    // 출력 항목 수 확인
    if (output.length !== expectedCount) {
        return false;
    }

    // 각 항목 검증
    for (let i = 0; i < output.length; i++) {
        const item = output[i];

        // 인덱스, 제목, 유사도 존재 여부 확인
        if (!('index' in item) || !('title' in item) || !('similarity' in item)) {
            return false;
        }

        // 인덱스 유효성 검사
        if (item.index < 0 || item.index >= pageTitles.length - 1) {
            return false;
        }

        // 제목 일치 여부 확인
        if (item.title !== pageTitles[item.index]) {
            return false;
        }

        // 유사도 범위 확인 (0에서 1 사이)
        if (item.similarity < 0 || item.similarity > 1) {
            return false;
        }

        // 순서 확인 (이전 항목과 비교)
        if (i > 0 && item.index <= output[i - 1].index) {
            return false;
        }
    }

    return true;
};