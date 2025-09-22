import {
    createAuthenticatedClient,
    isFinalizedGrant,
    isPendingGrant,
} from "@interledger/open-payments";
import { createPrivateKey, randomUUID } from 'crypto'
import { 
    KEY_ID, 
    PRIVATE_KEY_PATH, 
    WALLET_ADDRESS,
    URL_INTERLEDGER
} from '@/app/lib/constants'
import {
    AllowedActions
} from '@/app/lib/types/types'

export const createAuthClientAdmin = async () => {
    if(!WALLET_ADDRESS) throw new Error("WALLET_ADDRESS is not definied");
    if(!KEY_ID) throw new Error("KEY_ID is not definied");
    if(!PRIVATE_KEY_PATH) throw new Error("PRIVATE_KEY_PATH is not definied");
    const key = createPrivateKey({
        key: Buffer.from(PRIVATE_KEY_PATH, "base64"),
        format: "der",
        type: "pkcs8",
    });
    const client = await createAuthenticatedClient({
        walletAddressUrl: WALLET_ADDRESS,
        privateKey: key,
        keyId: KEY_ID
    });
    return client
}

export const createAuthClient = async (
    privateKey:string, 
    walletAddress:string,
    keyId:string
) => {
    const key = createPrivateKey({
        key: Buffer.from(privateKey, "base64"),
        format: "der",
        type: "pkcs8",
    });
    const client = await createAuthenticatedClient({
        walletAddressUrl: walletAddress,
        privateKey: key,
        keyId: keyId
    });
    return client
}

// INCOMING_PAYMENT_ACCESS_TOKEN =>            grant.access_token.value
// INCOMING_PAYMENT_ACCESS_TOKEN_MANAGE_URL => grant.access_token.manage
export const createIncomingPaymentGrantRequest = async (
    walletAddress: any, 
    client: any,
    allowedActions:AllowedActions[]
) => {
    const incomingPaymentGrant = await client.grant.request(
        {
            url: walletAddress.authServer,
        },
        {
            access_token: {
                access: [
                    {
                        type: "incoming-payment",
                        actions: allowedActions,
                    },
                ],
            },
        },
    );
    if (isPendingGrant(incomingPaymentGrant)) {
        throw new Error("Expected non-interactive grant");
    }
    return incomingPaymentGrant
}

// QUOTE_ACCESS_TOKEN =>,               grant.access_token.value
// QUOTE_ACCESS_TOKEN_MANAGE_URL => ,   grant.access_token.manage
export const createQuoteGrantRequest = async (walletAddressUrl: string, client: any) => {
    const walletAddress = await client.walletAddress.get({
        url: walletAddressUrl,
    });
    const quoteGrant = await client.grant.request(
        {
            url: walletAddress.authServer,
        },
        {
            access_token: {
                access: [
                    {
                        type: "quote",
                        actions: ["create", "read", "read-all"],
                    },
                ],
            },
        },
    );
    if (isPendingGrant(quoteGrant)) {
        throw new Error("Expected non-interactive grant");
    }
    return quoteGrant
};



// Please interact at the following URL=>   grant.interact.redirect
// CONTINUE_ACCESS_TOKEN =>                 grant.continue.access_token.value
// CONTINUE_URI =>                          grant.continue.uri

export const outgoingPaymentGrantWithoutIntervalRequest = async (walletAddressUrl: string, client: any, quote: any) => {
    const NONCE = randomUUID();
    const walletAddress = await client.walletAddress.get({
        url: walletAddressUrl,
    });
    const outgoingPaymentGrant = await client.grant.request(
        {
            url: walletAddress.authServer,
        },
        {
            access_token: {
                access: [
                    {
                        identifier: walletAddress.id,
                        type: "outgoing-payment",
                        actions: ["list", "list-all", "read", "read-all", "create"],
                        limits: {
                            debitAmount: {
                                assetCode: quote.debitAmount.assetCode,
                                assetScale: quote.debitAmount.assetScale,
                                value: quote.debitAmount.value,
                            },
                        },
                    },
                ],
            },
            interact: {
                start: ["redirect"],
                finish: {
                    method: "redirect",
                    uri: "http://localhost:3344",
                    nonce: NONCE,
                },
            },
        },
    );
    if (isPendingGrant(outgoingPaymentGrant)) {
        throw new Error("Expected non-interactive grant");
    }
    return outgoingPaymentGrant
};

export const outgoingPaymentGrantWithIntervalRequest = async (walletAddressUrl: string, client: any, quote: any, interval: string) => {
    const NONCE = randomUUID();
    const walletAddress = await client.walletAddress.get({
        url: walletAddressUrl,
    });
    const outgoingPaymentGrant = await client.grant.request(
        {
            url: walletAddress.authServer,
        },
        {
            access_token: {
                access: [
                    {
                        identifier: walletAddress.id,
                        type: "outgoing-payment",
                        actions: ["list", "list-all", "read", "read-all", "create"],
                        limits: {
                            debitAmount: {
                                assetCode: quote.debitAmount.assetCode,
                                assetScale: quote.debitAmount.assetScale,
                                value: quote.debitAmount.value,
                            },
                        },
                        interval: `R/${interval}/P1D`,
                    },
                ],
            },
            interact: {
                start: ["redirect"],
                finish: {
                    method: "redirect",
                    uri: "http://localhost:3344",
                    nonce: NONCE,
                },
            },
        },
    );
    if (isPendingGrant(outgoingPaymentGrant)) {
        throw new Error("Expected non-interactive grant");
    }
    return outgoingPaymentGrant
};


// OUTGOING_PAYMENT_ACCESS_TOKEN =>                 grant.access_token.value
// OUTGOING_PAYMENT_ACCESS_TOKEN_MANAGE_URL =>      grant.access_token.manage

export const continueGrantRequest = async (client: any, paymentGrant: any) => {
    const continueGrant = await client.grant.continue(
        {
            accessToken: paymentGrant.continue.access_token.value,
            url: paymentGrant.continue.uri,
        },
        {
            interact_ref: paymentGrant.interact.redirect,
        },
    );
    if (!isFinalizedGrant(continueGrant)) {
        throw new Error("Expected finalized grant. Received non-finalized grant.");
    }
    return continueGrant
}

export const revokeGrantRequest = async (client: any, paymentGrant: any) => {
    await client.grant.cancel({
        accessToken: paymentGrant.continue.access_token.value,
        url: paymentGrant.continue.uri,
    });
}

export const getWalletAddress = async (
    walletName:string,
    client:any
) => {
    const url = `${URL_INTERLEDGER}${walletName}`
    const walletAddress = await client.walletAddress.get({
        url: url,
    });
    return walletAddress;
}