// src/components/ShareOGMeta.jsx
import { useEffect } from 'react';

/**
 * Dynamically injects Open Graph + Twitter meta tags into <head>
 * so shared links (WhatsApp, Telegram, Facebook, Twitter) show
 * the movie's poster + title when previewed.
 */
const ShareOGMeta = ({ title, description, image, url, siteName = 'CINEVA' }) => {
    useEffect(() => {
        const head = document.head;
        const added = [];

        const setMeta = (property, content, isName = false) => {
            if (!content) return;
            const attr = isName ? 'name' : 'property';
            // Remove any existing version
            const existing = head.querySelector(`meta[${attr}="${property}"]`);
            if (existing) existing.remove();

            const tag = document.createElement('meta');
            tag.setAttribute(attr, property);
            tag.setAttribute('content', content);
            tag.setAttribute('data-cineva-og', 'true');
            head.appendChild(tag);
            added.push(tag);
        };

        // Standard OG
        setMeta('og:type', 'video.movie');
        setMeta('og:site_name', siteName);
        setMeta('og:title', title);
        setMeta('og:description', description);
        setMeta('og:image', image);
        setMeta('og:image:secure_url', image);
        setMeta('og:image:width', '800');
        setMeta('og:image:height', '1200');
        setMeta('og:url', url);

        // Twitter
        setMeta('twitter:card', 'summary_large_image', true);
        setMeta('twitter:title', title, true);
        setMeta('twitter:description', description, true);
        setMeta('twitter:image', image, true);

        // Also update <title> for tab preview
        const prevTitle = document.title;
        if (title) document.title = title;

        return () => {
            // Remove the tags we added
            added.forEach((tag) => {
                if (tag.parentNode) tag.parentNode.removeChild(tag);
            });
            document.title = prevTitle;
        };
    }, [title, description, image, url, siteName]);

    return null;
};

export default ShareOGMeta;