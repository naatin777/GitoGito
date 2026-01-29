const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
};

export function cycleZip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const length1 = arr1.length;
  const length2 = arr2.length;

  if (length1 === 0 || length2 === 0) return [];

  const totalLength = lcm(length1, length2);

  const result: [T, U][] = [];

  for (let i = 0; i < totalLength; i++) {
    const val1 = arr1[i % length1];
    const val2 = arr2[i % length2];
    result.push([val1, val2]);
  }
  return result;
}
