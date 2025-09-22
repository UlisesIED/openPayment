

// QUOTE_URL => quote.id
export const createQuote = async (
    client: any,
    quoteToken: string,
    incomingPaymentUrl: string,
    walletAddress: string
) => {
    const quote = await client.quote.create(
        {
            url: new URL(walletAddress).origin,
            accessToken: quoteToken,
        },
        {
            method: "ilp",
            walletAddress: walletAddress,
            receiver: incomingPaymentUrl,
        },
    );
    return quote;
}


// This code snippet allows a client to create a quote 
// with a receiveAmount, which specifies the amount that 
// the recipient’s wallet will receive.
export const createQuoteWithReceiverAmount = async (
    client: any,
    quoteToken: string,
    incomingPaymentUrl: string,
    walletAddress: any,
    amount: number

) => {
    const quote = await client.quote.create(
        {
            url: new URL(walletAddress).origin,
            accessToken: quoteToken,
        },
        {
            method: "ilp",
            walletAddress: walletAddress,
            receiver: incomingPaymentUrl,
            receiveAmount: {
                value: amount,
                assetCode: walletAddress.assetCode,
                assetScale: walletAddress.assetScale,
            },
        },
    );
    return quote;
}


// QUOTE => JSON.stringify(quote, null, 2)
export const getQuotes = async (
    quoteAccessToken: string,
    quoteURL: string,
    client:any
) => {
    const quote = await client.quote.get({
        url: quoteURL,
        accessToken: quoteAccessToken,
    });
    return quote;
}

