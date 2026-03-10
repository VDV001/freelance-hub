"use client";

import { gsap, ScrollTrigger, SplitText } from "./plugins";

export function fadeInUp(selector: string | Element, options?: { delay?: number; stagger?: number }) {
  return gsap.from(selector, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: options?.delay ?? 0,
    stagger: options?.stagger ?? 0.1,
    scrollTrigger: {
      trigger: selector,
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
}

export function splitHeading(element: Element) {
  const split = SplitText.create(element, { type: "chars,words" });
  gsap.from(split.chars, {
    y: 80,
    opacity: 0,
    rotateX: -90,
    duration: 0.8,
    ease: "power4.out",
    stagger: 0.03,
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
  return split;
}

export function staggerCards(selector: string | Element) {
  return gsap.from(selector, {
    y: 40,
    opacity: 0,
    scale: 0.95,
    duration: 0.7,
    ease: "power2.out",
    stagger: { each: 0.08, from: "start" },
    scrollTrigger: {
      trigger: selector,
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });
}

export function counterUp(element: Element, target: number, duration = 2) {
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: target,
    duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
}
