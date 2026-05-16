export const getVal = async (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kp_db', 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get(key);

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
};

export const setVal = async (key: string, val: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kp_db', 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      const setRequest = store.put(val, key);

      setRequest.onsuccess = () => resolve();
      setRequest.onerror = () => reject(setRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
};
