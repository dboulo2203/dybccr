export function toogleTheme() {
  if (document.documentElement.getAttribute('data-bs-theme') === 'dark') {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    sessionStorage.setItem('theme', 'light');
  } else {
    sessionStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }
}

export function setTheme() {
  const them = sessionStorage.getItem('theme');
  if (them) document.documentElement.setAttribute('data-bs-theme', them);
}
