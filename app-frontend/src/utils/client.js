let clientPromise = null;

export function getClient() {
  if (!clientPromise) {
    if (window.app && typeof window.app.initialized === 'function') {
      const initialized = window.app.initialized();
      // Ensure we always return a Promise
      // If it's already a Promise, use it; otherwise wrap it
      clientPromise = initialized instanceof Promise 
        ? initialized 
        : Promise.resolve(initialized);
    } else {
      // If window.app is not available, return a rejected promise
      clientPromise = Promise.reject(new Error('App client is not available'));
    }
  }
  return clientPromise;
}