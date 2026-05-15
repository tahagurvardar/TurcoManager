const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

const clampPercent = (value, fallback = 50) => {
  const number = Number(value);
  return clamp(Number.isFinite(number) ? number : fallback, 0, 100);
};

const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};

const weightedAverage = (items, selector, fallback = 0) => {
  if (!items.length) return fallback;
  return items.reduce((sum, item) => sum + selector(item), 0) / items.length;
};

module.exports = {
  clamp,
  clampPercent,
  round,
  weightedAverage,
};
