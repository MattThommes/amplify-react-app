import { useEffect } from 'react';

const SEO = ({ title, description, path }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
            setMetaTag('property', 'og:title', title);
            setMetaTag('name', 'twitter:title', title);
        }

        if (description) {
            setMetaTag('name', 'description', description);
            setMetaTag('property', 'og:description', description);
            setMetaTag('name', 'twitter:description', description);
        }

        if (typeof window !== 'undefined' && window.location) {
            const origin = getCanonicalOrigin();
            const rawPath = path
                ? (path.startsWith('/') ? path : `/${path}`)
                : window.location.pathname;
            const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
            const canonicalUrl = `${origin}${normalizedPath}`;
            setCanonicalLink(canonicalUrl);
            setMetaTag('property', 'og:url', canonicalUrl);
        }
    }, [title, description, path]);

    return null;
};

function getCanonicalOrigin() {
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
        const href = existingCanonical.getAttribute('href');
        if (href && /^https?:\/\//i.test(href) && !/yourdomain\.com/i.test(href)) {
            try {
                return new URL(href).origin;
            } catch {
                // Fall back to window.location.origin normalization below
            }
        }
    }
    return window.location.origin.replace(/^(https?:\/\/)www\./i, '$1');
}

function setMetaTag(attrName, attrValue, content) {
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

function setCanonicalLink(url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    link.setAttribute('href', url);
}

export default SEO;

