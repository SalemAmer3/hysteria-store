import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, `.is-visible` is added — which
 * triggers the CSS transition defined on `.reveal` in index.css.
 *
 * Usage:
 *   const ref = useScrollReveal<HTMLElement>();
 *   <section ref={ref} className="reveal"> … </section>
 *
 * The animation fires once per element (unobserved after first trigger).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    threshold = 0.12,
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Skip if user prefers reduced motion — CSS already handles it,
        // but we also skip the observer to avoid any JS overhead.
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.matches) {
            el.classList.add('is-visible');
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // fire once only
                }
            },
            { threshold },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}

/**
 * Observes multiple children of a container element and stagger-reveals them.
 * Applies `.is-visible` to each child sequentially as the container enters view.
 *
 * Usage:
 *   const ref = useScrollRevealChildren<HTMLDivElement>('.reveal');
 *   <div ref={ref}> <div className="reveal">…</div> … </div>
 */
export function useScrollRevealChildren<T extends HTMLElement = HTMLDivElement>(
    childSelector = '.reveal',
    threshold = 0.08,
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

        const children = Array.from(
            container.querySelectorAll<HTMLElement>(childSelector),
        );

        if (mq.matches) {
            children.forEach(c => c.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    children.forEach((child, i) => {
                        // each child gets a small stagger based on its index
                        setTimeout(() => child.classList.add('is-visible'), i * 80);
                    });
                    observer.unobserve(entry.target);
                }
            },
            { threshold },
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, [childSelector, threshold]);

    return ref;
}

/**
 * Animates a gold divider element (.gold-divider) when it enters the viewport.
 * Returns a ref to attach to the divider span/div.
 */
export function useGoldDivider<T extends HTMLElement = HTMLSpanElement>() {
    return useScrollReveal<T>(0.5);
}
