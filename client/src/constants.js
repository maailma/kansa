export const API_ROOT = API_HOST ? `https://${API_HOST}/api/` : '/api/';

export const JS_ROOT = (() => {
  let script = document.currentScript;
  if (!script) {
    const scripts = document.getElementsByTagName('script');
    if (scripts.length === 0) return '/';
    script = scripts[scripts.length - 1];
  }
  return script.src.replace(/\/[^\/]+$/, '');
})();
