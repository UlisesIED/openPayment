


// INCOMING PAYMENT URL =>                  incomingPayment.id
export const createIncomingPayment = async (
    client:any, 
    walletAddress: string, 
    incomingPaymentAccessToken: string
) => {
    const incomingPayment = await client.incomingPayment.create(
        {
            url: new URL(walletAddress).origin,
            accessToken: incomingPaymentAccessToken,
        },
        {
            walletAddress: walletAddress,
            incomingAmount: {
                value: "1000",
                assetCode: "USD",
                assetScale: 2,
            },
            expiresAt: new Date(Date.now() + 60_000 * 10).toISOString(),
        },
    );
    return incomingPayment;
}

// "INCOMING PAYMENTS:", JSON.stringify(incomingPayments, null, 2)
export const listIncomingPayments = async (client: any, walletAddress: string, incomingPaymentAccessToken: string) => {
    const listIncomingPayments = await client.incomingPayment.list(
        {
            url: new URL(walletAddress).origin,
            walletAddress: walletAddress,
            accessToken: incomingPaymentAccessToken,
        },
        {
            first: 10,
            last: undefined,
            cursor: undefined,
        }
    )
    return listIncomingPayments;
}

// INCOMING PAYMENT => incomingPayment
export const getIncomingPaymentsWithAuth = async (client: any, incomingPaymentData: any) => {
    const incomingPayment = await client.incomingPayment.get({
        url: incomingPaymentData.access_token.manage,
        accessToken: incomingPaymentData.access_token.value,
    });
    return incomingPayment;
}

export const getIncomingPaymentsWithOutAuth = async (client: any, incomingPaymentData: any) => {
    const incomingPayment = await client.incomingPayment.get({
        url: incomingPaymentData.access_token.manage,
    });
    return incomingPayment
}


export const completeIncomingPayment  = async (client: any, incomingPaymentData: any) => {
    const incomingPayment = await client.incomingPayment.complete({
        url: incomingPaymentData.access_token.manage,
        accessToken: incomingPaymentData.access_token.value,
    });
    return incomingPayment;
}

