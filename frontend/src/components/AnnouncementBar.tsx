import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const AnnouncementBar: React.FC = () => {
    const { getLocalized, t } = useLanguage();
    const [messages, setMessages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function loadPromos() {
            try {
                const adsRes = await api.ads.listPublic();
                const activeAds = adsRes.data.filter((ad: any) => ad.is_active);

                let promoTexts: string[] = [];
                if (activeAds.length > 0) {
                    activeAds.forEach((ad: any) => {
                        const txt = getLocalized(ad, 'description');
                        if (txt) promoTexts.push(txt);
                    });
                }

                // Add default/fallback announcement if none set
                if (promoTexts.length === 0) {
                    promoTexts.push(t('announceText'));
                }

                setMessages(promoTexts);
            } catch (err) {
                setMessages([t('announceText')]);
            }
        }
        loadPromos();
    }, [t]);

    useEffect(() => {
        if (messages.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [messages]);

    if (messages.length === 0) return null;

    return (
        <div className="w-full bg-black text-white text-xs md:text-sm py-2 px-4 border-b border-zinc-900 overflow-hidden relative min-h-[38px] flex items-center justify-center">
            <div className="w-full text-center flex justify-center items-center font-medium tracking-wide transition-opacity duration-500 ease-in-out">
                {messages.map((message, index) => (
                    <span
                        key={index}
                        className={`absolute transition-all duration-700 ease-in-out ${index === currentIndex
                                ? 'opacity-100 transform translate-y-0 scale-100'
                                : 'opacity-0 transform translate-y-4 scale-95 pointer-events-none'
                            }`}
                        style={{ textShadow: '0 0 10px rgba(212, 175, 55, 0.4)' }}
                    >
                        {message}
                    </span>
                ))}
            </div>
        </div>
    );
};
