import { expect, test } from "bun:test";
import {
  CAROUSEL_EMPTY_MESSAGE,
  getSafeCarouselIndex,
  getCarouselPositionLabel,
} from "./Carousel.tsx";

test("getCarouselPositionLabel uses zero when there are no choices", () => {
  expect(getCarouselPositionLabel(0, 0)).toBe("← 0/0 →");
});

test("getCarouselPositionLabel uses one-based positions", () => {
  expect(getCarouselPositionLabel(2, 4)).toBe("← 3/4 →");
});

test("getSafeCarouselIndex clamps stale selections to the last choice", () => {
  expect(getSafeCarouselIndex(2, 1)).toBe(0);
});

test("getSafeCarouselIndex returns zero when there are no choices", () => {
  expect(getSafeCarouselIndex(4, 0)).toBe(0);
});

test("CAROUSEL_EMPTY_MESSAGE explains how to exit empty selection", () => {
  expect(CAROUSEL_EMPTY_MESSAGE).toContain("No options available");
  expect(CAROUSEL_EMPTY_MESSAGE).toContain("Enter or Esc");
});
