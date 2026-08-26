function getAuthResult(authenticationResults, type) {
    if (!authenticationResults || authenticationResults.length === 0) {
        return {
            result: 'NONE',
            reason: `${type.toUpperCase()} result not found`
        };
    }

    const text = authenticationResults.join(' ').toLowerCase();

    const regex = new RegExp(`\\b${type}\\s*=\\s*(pass|fail|softfail|neutral|none|temperror|permerror)\\b`);

    const match = text.match(regex);

    if (!match) {
        return {
            result: 'NONE',
            reason: `${type.toUpperCase()} result not found`
        };
    }

    return {
        result: match[1].toUpperCase(),
        reason: `Authentication-Results contains ${type}=${match[1]}`
    };
}

function analyzeAuthentication(parsedEmail) {
    const spf = getAuthResult(
        parsedEmail.authenticationResults,
        'spf'
    );

    const dkim = getAuthResult(
        parsedEmail.authenticationResults,
        'dkim'
    );

    const dmarc = getAuthResult(
        parsedEmail.authenticationResults,
        'dmarc'
    );

    return {
        spf,
        dkim,
        dmarc
    };
}

module.exports = {
    analyzeAuthentication
};