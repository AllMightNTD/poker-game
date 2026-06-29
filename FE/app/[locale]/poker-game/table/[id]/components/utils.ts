export const formatChipsVal = (val: string) => {
  const num = parseInt(val);
  if (isNaN(num)) return "0";
  return num.toLocaleString();
};
