const { calculateRisk } = require('./utils/riskEngine');

const authentication = {
    spf: {
        result: 'FAIL',
        reason: 'Authentication-Results contains spf=fail'
    },

    dkim: {
        result: 'FAIL',
        reason: 'Authentication-Results contains dkim=fail'
    },

    dmarc: {
        result: 'FAIL',
        reason: 'Authentication-Results contains dmarc=fail'
    }
};

const headerAnalysis = {
    anomalies: [
        {
            type: 'REPLY_TO_MISMATCH',
            severity: 'HIGH',
            message: 'Reply-To domain differs from From domain'
        }
    ]
};

const urlAnalysis = {
    urls: [
        {
            hostname: 'bit.ly',
            indicators: [
                'Uses HTTP instead of HTTPS',
                'Uses a URL shortening service'
            ]
        }
    ]
};

const risk = calculateRisk(
    authentication,
    headerAnalysis,
    urlAnalysis
);

console.log('✅ Combined risk analysis successful');
console.log(JSON.stringify(risk, null, 2));