export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Failed to save to localStorage", error);
  }
};

export const loadFromLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Failed to load from localStorage", error);
    return null;
  }
};
