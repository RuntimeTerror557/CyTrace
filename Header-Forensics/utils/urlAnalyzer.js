const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

const SHORTENER_DOMAINS = [
    'bit.ly',
    'tinyurl.com',
    't.co',
    'goo.gl',
    'ow.ly',
    'is.gd',
    'buff.ly',
    'cutt.ly'
];

function analyzeUrls(html, text) {
    const content = `${html || ''}\n${text || ''}`;

    const matches = content.match(URL_REGEX) || [];

    const uniqueUrls = [...new Set(matches)];

    const urls = uniqueUrls.map((rawUrl) => {
        const cleanUrl = rawUrl.replace(/[),.;!?]+$/, '');

        let parsed;

        try {
            parsed = new URL(cleanUrl);
        } catch {
            return {
                url: cleanUrl,
                valid: false,
                indicators: ['Invalid URL format']
            };
        }

        const indicators = [];

        const hostname = parsed.hostname.toLowerCase();

        // HTTP instead of HTTPS
        if (parsed.protocol === 'http:') {
            indicators.push('Uses HTTP instead of HTTPS');
        }

        // URL shortener
        if (SHORTENER_DOMAINS.includes(hostname)) {
            indicators.push('Uses a URL shortening service');
        }

        // IP address instead of domain
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
            indicators.push('Uses an IP address instead of a domain');
        }

        // Suspicious username in URL
        if (parsed.username) {
            indicators.push('URL contains embedded username information');
        }

        return {
            url: cleanUrl,
            valid: true,
            protocol: parsed.protocol,
            hostname,
            indicators
        };
    });

    return {
        count: urls.length,
        urls
    };
}

module.exports = {
    analyzeUrls
};