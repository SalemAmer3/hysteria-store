import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'product' | 'article';
    price?: number;
    currency?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = 'https://hysteriaps.online/hysteria-logo.jpeg',
    type = 'website',
    price,
    currency = 'ILS',
}) => {
    const location = useLocation();
    const baseUrl = 'https://hysteriaps.online';
    const url = `${baseUrl}${location.pathname}${location.search}`;

    // Default values
    const defaultTitle = 'هستيريا - متجر العطور ومستحضرات التجميل في الخليل | Histeria Hebron';
    const defaultDescription = 'متجر هستيريا في الخليل - عطور فاخرة، مستحضرات تجميل، عناية بالبشرة والشعر. توصيل سريع لجميع مناطق فلسطين.';
    const defaultKeywords = 'هستيريا, هستيريا الخليل, متجر هستيريا, Histeria, Histeria Hebron, عطور, مستحضرات تجميل, الخليل, فلسطين';

    const finalTitle = title ? `${title} | هستيريا Histeria` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

    useEffect(() => {
        // Update document title
        document.title = finalTitle;

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            
            element.setAttribute('content', content);
        };

        // Basic meta tags
        updateMetaTag('description', finalDescription);
        updateMetaTag('keywords', finalKeywords);

        // Open Graph
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:title', finalTitle, true);
        updateMetaTag('og:description', finalDescription, true);
        updateMetaTag('og:image', image, true);
        updateMetaTag('og:type', type, true);

        // Twitter
        updateMetaTag('twitter:url', url, true);
        updateMetaTag('twitter:title', finalTitle, true);
        updateMetaTag('twitter:description', finalDescription, true);
        updateMetaTag('twitter:image', image, true);

        // Product-specific meta tags
        if (type === 'product' && price) {
            updateMetaTag('product:price:amount', price.toString(), true);
            updateMetaTag('product:price:currency', currency, true);
        }

        // Update canonical link
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);

    }, [finalTitle, finalDescription, finalKeywords, image, url, type, price, currency]);

    return null; // This component doesn't render anything
};
