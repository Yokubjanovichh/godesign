// Формирует внутреннюю ссылку с учётом base (для GitHub Pages /godesign/,
// на корневом хостинге — просто '/'). Работает в обоих случаях.
// import.meta.env.BASE_URL может быть '/godesign', '/godesign/' или '/'.
const base = import.meta.env.BASE_URL.replace(/\/+$/, ''); // → '/godesign' или ''

export function link(path: string): string {
  return base + '/' + path.replace(/^\/+/, '');
}
