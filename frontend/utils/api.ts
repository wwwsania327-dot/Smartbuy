export const fetchMergedProducts = async () => {
  const res = await fetch("https://smartbuy-2azo.onrender.com/api/products");
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const data = await res.json();
  return data.products || data;
};
