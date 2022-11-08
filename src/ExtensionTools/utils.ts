export const documentReadyPromiseAndWindowIsOk = (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false)
  } else if(window.document.readyState === 'complete') {
    return Promise.resolve(true)
  } else {
    return new Promise<true>(resolve => window.addEventListener('load', () => resolve(true), {once: true}));
  }
}
