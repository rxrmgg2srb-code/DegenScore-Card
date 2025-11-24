/**
 * Number utility functions for formatting and calculations
 */

export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

export function formatPercentage(value: number, decimals = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function round(value: number, decimals = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

export function toNumber(value: string | number, defaultValue = 0): number {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

export function random(min = 0, max = 1): number {
    return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sum(numbers: number[]): number {
    return numbers.reduce((acc, num) => acc + num, 0);
}

export function average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return sum(numbers) / numbers.length;
}

export function median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function max(numbers: number[]): number {
    return Math.max(...numbers);
}

export function min(numbers: number[]): number {
    return Math.min(...numbers);
}

export function range(numbers: number[]): { min: number; max: number; range: number } {
    const minVal = min(numbers);
    const maxVal = max(numbers);
    return { min: minVal, max: maxVal, range: maxVal - minVal };
}
