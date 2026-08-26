function calculateRisk(authentication, headerAnalysis, urlAnalysis) {
    let score = 0;
    const reasons = [];

    // =========================
    // SPF
    // =========================

    if (authentication.spf.result === 'FAIL') {
        score += 30;
        reasons.push('SPF authentication failed');
    } else if (authentication.spf.result === 'NONE') {
        score += 10;
        reasons.push('No SPF authentication result found');
    }

    // =========================
    // DKIM
    // =========================

    if (authentication.dkim.result === 'FAIL') {
        score += 30;
        reasons.push('DKIM authentication failed');
    } else if (authentication.dkim.result === 'NONE') {
        score += 10;
        reasons.push('No DKIM authentication result found');
    }

    // =========================
    // DMARC
    // =========================

    if (authentication.dmarc.result === 'FAIL') {
        score += 30;
        reasons.push('DMARC authentication failed');
    } else if (authentication.dmarc.result === 'NONE') {
        score += 10;
        reasons.push('No DMARC authentication result found');
    }

    // =========================
    // Header anomalies
    // =========================

    if (headerAnalysis && headerAnalysis.anomalies) {
        for (const anomaly of headerAnalysis.anomalies) {

            if (anomaly.severity === 'HIGH') {
                score += 15;
            } else if (anomaly.severity === 'MEDIUM') {
                score += 10;
            } else if (anomaly.severity === 'LOW') {
                score += 5;
            }

            reasons.push(anomaly.message);
        }
    }

    // =========================
    // URL analysis
    // =========================

    if (urlAnalysis && urlAnalysis.urls) {

        for (const url of urlAnalysis.urls) {

            if (!url.indicators) {
                continue;
            }

            for (const indicator of url.indicators) {

                if (indicator === 'Uses a URL shortening service') {
                    score += 5;
                    reasons.push(
                        `URL shortening service detected: ${url.hostname}`
                    );
                }

                if (indicator === 'Uses HTTP instead of HTTPS') {
                    score += 5;
                    reasons.push(
                        `URL uses HTTP instead of HTTPS: ${url.hostname}`
                    );
                }

                if (
                    indicator ===
                    'Uses an IP address instead of a domain'
                ) {
                    score += 10;
                    reasons.push(
                        `URL uses an IP address: ${url.hostname}`
                    );
                }

                if (
                    indicator ===
                    'URL contains embedded username information'
                ) {
                    score += 10;
                    reasons.push(
                        `URL contains embedded username information`
                    );
                }
            }
        }
    }

    // =========================
    // Cap score
    // =========================

    score = Math.min(score, 100);

    // =========================
    // Determine risk level
    // =========================

    let level;

    if (score >= 70) {
        level = 'HIGH';
    } else if (score >= 40) {
        level = 'MEDIUM';
    } else {
        level = 'LOW';
    }

    return {
        score,
        level,
        reasons
    };
}

module.exports = {
    calculateRisk
};