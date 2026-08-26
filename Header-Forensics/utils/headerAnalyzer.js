function extractEmailAddress(value) {
    if (!value) return null;

    // If mailparser returns an object
    if (typeof value === 'object') {
        if (value.text) {
            value = value.text;
        } else if (value.value) {
            value = value.value;
        } else {
            return null;
        }
    }

    value = String(value);

    const match = value.match(/<([^>]+)>/);

    if (match) {
        return match[1].toLowerCase();
    }

    const emailMatch = value.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    );

    return emailMatch ? emailMatch[0].toLowerCase() : null;
}

function extractDomain(email) {
    if (!email || !email.includes('@')) {
        return null;
    }

    return email.split('@')[1].toLowerCase();
}

function analyzeHeaders(parsedEmail) {
    const anomalies = [];

    const fromEmail = extractEmailAddress(parsedEmail.from);
    const returnPathEmail = extractEmailAddress(parsedEmail.returnPath);
    const replyToEmail = extractEmailAddress(parsedEmail.replyTo);

    const fromDomain = extractDomain(fromEmail);
    const returnPathDomain = extractDomain(returnPathEmail);
    const replyToDomain = extractDomain(replyToEmail);

    // Return-Path mismatch
    if (
        fromDomain &&
        returnPathDomain &&
        fromDomain !== returnPathDomain
    ) {
        anomalies.push({
            type: 'RETURN_PATH_MISMATCH',
            severity: 'MEDIUM',
            message: 'Return-Path domain differs from From domain',
            details: {
                fromDomain,
                returnPathDomain
            }
        });
    }

    // Reply-To mismatch
    if (
        fromDomain &&
        replyToDomain &&
        fromDomain !== replyToDomain
    ) {
        anomalies.push({
            type: 'REPLY_TO_MISMATCH',
            severity: 'HIGH',
            message: 'Reply-To domain differs from From domain',
            details: {
                fromDomain,
                replyToDomain
            }
        });
    }

    // Missing Message-ID
    if (!parsedEmail.messageId) {
        anomalies.push({
            type: 'MISSING_MESSAGE_ID',
            severity: 'LOW',
            message: 'Message-ID header is missing'
        });
    }

    // Missing Received header
    if (
        !parsedEmail.received ||
        parsedEmail.received.length === 0
    ) {
        anomalies.push({
            type: 'MISSING_RECEIVED_HEADER',
            severity: 'MEDIUM',
            message: 'No Received header was found'
        });
    }

    const receivedCount = parsedEmail.received
        ? parsedEmail.received.length
        : 0;

    return {
        anomalies,
        receivedCount
    };
}

module.exports = {
    analyzeHeaders
};