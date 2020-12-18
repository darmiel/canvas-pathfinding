const colors: Array<string> = [
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#2c3e50",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#f39c12",
  "#c0392b",
  "#d35400",
  "#bdc3c7",
  "#7f8c8d"
];

export function getColors(): Array<string> {
  return colors;
}

export function getRandomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)];
}