export function removeBreaks(s: string) {
    return s.replace(/(\r\n|\n|\r)/gm, '');
}
