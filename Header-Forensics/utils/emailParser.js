const { simpleParser } = require('mailparser');

async function parseEmail(rawEmail) {
    const parsed = await simpleParser(rawEmail);

    function getAllHeaders(name) {
        const values = [];

        for (const [key, value] of parsed.headers) {
            if (key.toLowerCase() === name.toLowerCase()) {
                values.push(value);
            }
        }

        return values;
    }

    return {
        from: parsed.from?.text || null,

        to: parsed.to?.text || null,

        subject: parsed.subject || null,

        date: parsed.date || null,

        messageId: parsed.messageId || null,

        returnPath:
            parsed.headers.get('return-path') || null,

        replyTo:
            parsed.replyTo?.text ||
            parsed.headers.get('reply-to') ||
            null,

        received:
            getAllHeaders('received'),

        authenticationResults:
            getAllHeaders('authentication-results'),

        receivedSPF:
            getAllHeaders('received-spf'),

        dkimSignature:
            getAllHeaders('dkim-signature'),

        html: parsed.html || null,

        text: parsed.text || null
    };
}

module.exports = {
    parseEmail
};