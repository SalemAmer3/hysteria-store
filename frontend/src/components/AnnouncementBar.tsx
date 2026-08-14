import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const AnnouncementBar: React.FC = () => {
    const { getLocalized, t } = useLanguage();
    const [messages, setMessages] = useState<string[]>([]);

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
                if (promoTexts.length === 0) promoTexts.push(t('announceText'));
                setMessages(promoTexts);
            } catch {
                setMessages([t('announceText')]);
            }
        }
        loadPromos();
    }, [t]);

    if (messages.length === 0) return null;

    // Repeat messages so the marquee loops seamlessly
    const combined = [...messages, ...messages].join('   ✦   ');

    return (
        <div className="w-full bg-black text-white text-xs md:text-sm py-2 border-b border-zinc-900 overflow-hidden relative">
            <div
                className="animate-marquee"
                style={{ textShadow: '0 0 10px rgba(212, 175, 55, 0.4)' }}
            >
                <span className="font-medium tracking-wide text-zinc-200">
                    {combined}
                </span>
            </div>
        </div>
    );
};
