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

    // Join messages with separator
    const singlePass = messages.join('   ✦   ') + '   ✦   ';

    return (
        <div className="w-full bg-black text-white text-xs md:text-sm py-2 border-b border-zinc-900 overflow-hidden relative">
            {/* Track contains text duplicated twice — seamless loop via translateX(-50%) */}
            <div
                className="animate-marquee-track"
                style={{ textShadow: '0 0 10px rgba(212, 175, 55, 0.4)' }}
            >
                {/* First copy */}
                <span className="font-medium tracking-wide text-zinc-200 px-4">
                    {singlePass}
                </span>
                {/* Exact duplicate — creates the seamless loop */}
                <span className="font-medium tracking-wide text-zinc-200 px-4" aria-hidden="true">
                    {singlePass}
                </span>
            </div>
        </div>
    );
};
