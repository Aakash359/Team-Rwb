// has the browser reached the bottom of the page (with some buffer room)
export function hasReachedBottom(el) {
  return el.getBoundingClientRect().bottom <= window.innerHeight + 10;
}

export const getCurrentPath = () => window.location.pathname;
