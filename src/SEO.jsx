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
            const canonicalUrl = path
                ? `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
                : `${window.location.origin}${window.location.pathname}`;
            setCanonicalLink(canonicalUrl);
            setMetaTag('property', 'og:url', canonicalUrl);
        }
    }, [title, description, path]);

    return null;
};

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

