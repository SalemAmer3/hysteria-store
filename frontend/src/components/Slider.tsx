import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Slider: React.FC = () => {
    const { getLocalized, direction, t } = useLanguage();
    const [sliders, setSliders]       = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading]       = useState(true);
    // Track whether the hero has mounted so we can trigger entry animation
    const [mounted, setMounted]       = useState(false);
    // Parallax offset (px) updated on scroll
    const [parallaxY, setParallaxY]   = useState(0);
    const containerRef                = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadSliders() {
            try {
                const res = await api.sliders.listPublic();
                const activeSliders = res.data.filter((s: any) => s.is_active);
                setSliders(activeSliders);
            } catch (err) {
                console.error('Failed to load sliders', err);
            } finally {
                setLoading(false);
                // Tiny delay so the element is painted before we trigger fade-in
                requestAnimationFrame(() => setMounted(true));
            }
        }
        loadSliders();
    }, []);

    // ── Parallax on scroll (max ±30 px, only if no reduced-motion preference) ──
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.matches) return;

        const onScroll = () => {
            const el = containerRef.current;
            if (!el) return;
            const rect   = el.getBoundingClientRect();
            const viewH  = window.innerHeight;
            // Only apply when the hero is partially visible
            if (rect.bottom < 0 || rect.top > viewH) return;
            // Map scroll position to a small vertical offset (max 30px)
            const ratio  = Math.min(Math.max(-rect.top / viewH, 0), 1);
            setParallaxY(ratio * 30);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Auto-advance ──────────────────────────────────────────────────────────
    const slideCount = sliders.length;

    useEffect(() => {
        if (slideCount <= 1) return;
        const dur = sliders[currentIndex]?.interval || 5000;
        const timer = setInterval(
            () => setCurrentIndex((prev) => (prev + 1) % slideCount),
            dur,
        );
        return () => clearInterval(timer);
    }, [currentIndex, slideCount, sliders]);

    const handlePrev = () => setCurrentIndex((p) => (p - 1 + slideCount) % slideCount);
    const handleNext = () => setCurrentIndex((p) => (p + 1) % slideCount);

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="w-full aspect-[21/9] min-h-[300px] md:min-h-[480px] bg-zinc-950 flex items-center justify-center shimmer rounded-2xl">
                <div className="text-zinc-600 font-medium font-sans">Histeria Luxury Banners...</div>
            </div>
        );
    }

    // ── Fallback (no active sliders) ──────────────────────────────────────────
    if (slideCount === 0) {
        return (
            <div
                ref={containerRef}
                className={`relative w-full aspect-[21/9] min-h-[320px] md:min-h-[500px] overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center select-none transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 filter blur-xs"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')`,
                        transform: `translateY(${parallaxY}px)`,
                        willChange: 'transform',
                    }}
                />
                <div className="relative z-10 text-center max-w-2xl px-6 space-y-4">
                    <span className="text-gold-400 text-xs md:text-sm font-extrabold uppercase tracking-widest font-sans">
                        Exclusive Collection
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#f5ecd2] tracking-wide leading-tight">
                        {t('home')} - HISTERIA
                    </h1>
                    <p className="text-zinc-400 text-xs md:text-base leading-relaxed">
                        Discover our premium range of lifestyle items and luxury fragrances.
                    </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
            </div>
        );
    }

    // ── Main slider ───────────────────────────────────────────────────────────
    const currentSlider = sliders[currentIndex];
    const title   = getLocalized(currentSlider, 'name');
    const details = getLocalized(currentSlider, 'description');

    return (
        <div
            ref={containerRef}
            /* Hero entry: zoom-in (scale 1.04→1) + fade, triggered once on mount */
            className={`relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[300px] md:min-h-[480px] overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-900 select-none group transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            style={mounted ? { animation: 'zoom-in 0.9s cubic-bezier(0.22,1,0.36,1) both' } : undefined}
        >
            {/* ── Slide images ── */}
            {sliders.map((slider, index) => (
                <div
                    key={slider.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                >
                    <img
                        src={slider.image_url}
                        alt={getLocalized(slider, 'name')}
                        /* Parallax: translateY moves the image slightly as page scrolls */
                        className={`w-full h-full object-cover transform transition-transform duration-[8000ms] ${
                            index === currentIndex ? 'scale-105' : 'scale-100'
                        }`}
                        style={{ transform: `translateY(${parallaxY}px) scale(${index === currentIndex ? 1.05 : 1})`, willChange: 'transform' }}
                    />
                    {/* Vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-black/50 pointer-events-none" />
                </div>
            ))}

            {/* ── Slide text — staggered fade-in-up, re-runs on slide change ── */}
            <div className="absolute bottom-8 md:bottom-16 z-20 w-full px-6 md:px-16 flex flex-col justify-end pointer-events-none">
                <div className="max-w-xl space-y-2 md:space-y-4">
                    {/* Gold label */}
                    <span
                        key={`label-${currentIndex}`}
                        className="inline-block text-gold-400 text-[10px] md:text-xs font-extrabold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-zinc-800/80 backdrop-blur-md animate-fade-in"
                        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                    >
                        Histeria Masterpiece
                    </span>

                    {/* Title */}
                    <h2
                        key={`title-${currentIndex}`}
                        className="text-2xl md:text-5xl font-extrabold md:leading-tight text-white drop-shadow-md animate-fade-in font-sans"
                        style={{ animationDelay: '280ms', animationFillMode: 'both' }}
                    >
                        {title}
                    </h2>

                    {/* Description */}
                    {details && (
                        <p
                            key={`desc-${currentIndex}`}
                            className="text-zinc-300 text-xs md:text-base leading-relaxed drop-shadow-sm font-light max-w-md animate-fade-in"
                            style={{ animationDelay: '460ms', animationFillMode: 'both' }}
                        >
                            {details}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Navigation buttons ── */}
            {slideCount > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className={`absolute top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 rounded-full bg-black/60 hover:bg-black/95 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-gold-400/40 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer ${
                            direction === 'rtl' ? 'right-4 md:right-8' : 'left-4 md:left-8'
                        }`}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    </button>

                    <button
                        onClick={handleNext}
                        className={`absolute top-1/2 -translate-y-1/2 z-20 p-2.5 md:p-3 rounded-full bg-black/60 hover:bg-black/95 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-gold-400/40 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer ${
                            direction === 'rtl' ? 'left-4 md:left-8' : 'right-4 md:right-8'
                        }`}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    </button>

                    {/* Indicator dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {sliders.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    idx === currentIndex
                                        ? 'w-6 bg-gold-400'
                                        : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
