const colors: Array<string> = [
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#f39c12",
  "#c0392b",
  "#d35400",
];

const nonVibrant: Array<string> = [
  "#34495e",
  "#2c3e50",
  "#bdc3c7",
  "#7f8c8d"
];

export function getColors(): Array<string> {
  return colors;
}

export function getRandomColor(vibrantOnly = false): string {
  let c = colors;
  if (!vibrantOnly) {
    c = c.concat(nonVibrant);
  }

  return c[Math.floor(Math.random() * c.length)];
}