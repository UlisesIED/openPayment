


// OUTGOING_PAYMENT_URL = ", outgoingPayment.id
export const createOutGoingPayment = async (
    client: any,
    wallet: any,
    quoteURL: any,
    outgoingPaymentAccessToken: string
) => {
    const outgoingPayment = await client.outgoingPayment.create(
        {
            url: new URL(wallet).origin,
            accessToken: outgoingPaymentAccessToken,
        },
        {
            walletAddress: wallet,
            quoteId: quoteURL,
        },
    );
    return outgoingPayment;
}


// OUTGOING PAYMENTS:", JSON.stringify(outgoingPayments, null, 2)
export const getListOutGoingPayments = async (
    client: any,
    wallet: any,
    outgoingPaymentAccessToken: string
) => {
    const outgoingPaymentsList = await client.outgoingPayment.list(
        {
            url: new URL(wallet).origin,
            walletAddress: wallet,
            accessToken: outgoingPaymentAccessToken,
        },
        {
            first: 10,
            last: undefined,
            cursor: undefined,
        },
    )
    return outgoingPaymentsList;
}

// OUTGOING PAYMENT => outgoingPayment
export const getOutGoingPayment = async (
    client: any,
    outGoingPaymentURL: any,
    outGoingPaymentAccessToken: string
) => {
    const outgoingPayment = await client.outgoingPayment.get({
        url: outGoingPaymentURL,
        accessToken: outGoingPaymentAccessToken,
    });
    return outgoingPayment;
}