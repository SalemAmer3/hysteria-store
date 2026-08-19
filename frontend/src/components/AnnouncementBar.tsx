import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const AnnouncementBar: React.FC = () => {
    const { language, t } = useLanguage();
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        async function loadTicker() {
            try {
                const res = await api.ticker.listPublic();
                const items: any[] = res.data || [];
                const texts = items.map((item) => {
                    if (language === 'ar' && item.arabic) return item.arabic;
                    if (language === 'he' && item.hebrew) return item.hebrew;
                    return item.text;
                }).filter(Boolean);

                setMessages(texts.length > 0 ? texts : [t('announceText')]);
            } catch {
                setMessages([t('announceText')]);
            }
        }
        loadTicker();
    }, [language, t]);

    if (messages.length === 0) return null;

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
