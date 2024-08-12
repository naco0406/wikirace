export const validateJsonOutput = (output: { [key: string]: string }, pageTitles: string[]): boolean => {
    const validEmojis = ['⏪', '🟥', '🟧', '🟨', '🟩', '🟦', '🏁'];

    // Check if the number of keys in the output matches the number of page titles
    if (Object.keys(output).length !== pageTitles.length) {
        return false;
    }

    // Check if all page titles are present in the output
    if (!pageTitles.every(title => title in output)) {
        return false;
    }

    // Check if all emojis are valid
    if (!Object.values(output).every(emoji => validEmojis.includes(emoji))) {
        return false;
    }

    // Check if the last page title is matched with 🏁
    if (output[pageTitles[pageTitles.length - 1]] !== '🏁') {
        return false;
    }

    // Check if 🏁 appears only at the end
    if (Object.values(output).slice(0, -1).includes('🏁')) {
        return false;
    }

    // Check if '뒤로가기' is matched with ⏪
    const backIndex = pageTitles.indexOf('뒤로가기');
    if (backIndex !== -1 && output[pageTitles[backIndex]] !== '⏪') {
        return false;
    }

    return true;
};
