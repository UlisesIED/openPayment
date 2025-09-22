import {
    createAuthenticatedClient,
    isFinalizedGrant,
    isPendingGrant,
    AuthenticatedClient,
    OutgoingPayment,
    IncomingPayment,
    Grant,
    PendingGrant,
    WalletAddress,
    Quote,
} from "@interledger/open-payments";
import {
    URL_INTERLEDGER
} from '@/app/lib/constants'
import { createPrivateKey, randomUUID } from 'crypto';
import {
    AllowedActions,
    AllowedActionsOutGoingPaymentGrant,
    AllowedActionsQuoteGrant
} from '@/app/lib/types/types';
import {
    IClientConfig,
} from '@/app/lib/interfaces/definitions'
import Readline from "readline/promises";

export class OpenPaymentsService {
    private client: AuthenticatedClient;
    private senderWalletAddress?: WalletAddress;
    private reciverWalletAddress?: WalletAddress;
    private myWalletAddress?: WalletAddress;
    private incomingPaymentGrant?: Grant;
    private incomingPayment?: IncomingPayment;
    private quoteGrantRequest?: Grant;
    private quote?: Quote;
    private outGoingPaymentGrant?: Grant | PendingGrant;
    private finalizedOutGoingPayment?: Grant
    private outgoingPayment?: OutgoingPayment;

    private constructor(client: AuthenticatedClient) {
        this.client = client;
    }

    public static async initialize(config: IClientConfig): Promise<OpenPaymentsService> {
        const key = createPrivateKey({
            key: Buffer.from(config.privateKey, "base64"),
            format: "der",
            type: "pkcs8",
        });
        const client = await createAuthenticatedClient({
            walletAddressUrl: config.walletAddress,
            privateKey: key,
            keyId: config.keyId,
        });
        return new OpenPaymentsService(client);
    }

    public async addSenderWalletAddress(senderWalletName: string) {
        this.senderWalletAddress = await this.getWalletAddress(senderWalletName)
        console.log(this.senderWalletAddress);

    }

    public async addReciverWalletAddress(reciverWalletName: string) {
        this.reciverWalletAddress = await this.getWalletAddress(reciverWalletName)
        console.log(this.reciverWalletAddress);
    }

    public async addMyWalletAdress(myWalletName: string) {
        this.myWalletAddress = await this.getWalletAddress(myWalletName)
        console.log(this.myWalletAddress);
    }

    // INCOMING_PAYMENT_ACCESS_TOKEN =>            grant.access_token.value
    // INCOMING_PAYMENT_ACCESS_TOKEN_MANAGE_URL => grant.access_token.manage
    public async createIncomingPaymentGrant(allowedActions: AllowedActions[]): Promise<void> {
        if (!this.reciverWalletAddress) throw new Error("reciver Wallet Address is not defined")
        const grant = await this.client.grant.request(
            { url: this.reciverWalletAddress.authServer },
            {
                access_token: {
                    access: [{
                        type: "incoming-payment",
                        actions: allowedActions,
                    }],
                },
            },
        );
        if (isPendingGrant(grant)) {
            throw new Error("Expected non-interactive grant");
        }
        this.incomingPaymentGrant = grant;
    }

    public async createIncomingPayment(amount: string): Promise<void> {
        if (!this.reciverWalletAddress) throw new Error("reciver Wallet Address is not defined")
        if (!this.incomingPaymentGrant) throw new Error("incoming Payment Grant is not defined")
        const incomingPayment = await this.client.incomingPayment.create(
            {
                url: this.reciverWalletAddress.resourceServer,
                accessToken: this.incomingPaymentGrant.access_token.value,
            },
            {
                walletAddress: this.reciverWalletAddress.id,
                incomingAmount: {
                    value: amount,
                    assetCode: this.reciverWalletAddress.assetCode,
                    assetScale: this.reciverWalletAddress.assetScale,
                },
                expiresAt: new Date(Date.now() + 60_000 * 10).toISOString(),
            },
        )
        this.incomingPayment = incomingPayment;
    }

    // QUOTE_ACCESS_TOKEN =>,               grant.access_token.value
    // QUOTE_ACCESS_TOKEN_MANAGE_URL => ,   grant.access_token.manage
    public async createQuoteGrant(allowedActions: AllowedActionsQuoteGrant[]): Promise<void> {
        if (!this.senderWalletAddress) throw new Error("sender Wallet Address is not Defined")
        const quoteGrant = await this.client.grant.request(
            {
                url: this.senderWalletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            type: "quote",
                            actions: allowedActions,
                        },
                    ],
                },
            },
        );
        if (isPendingGrant(quoteGrant)) {
            throw new Error("Expected non-interactive grant");
        }
        this.quoteGrantRequest = quoteGrant;
    }

    public async createQuote() {
        if (!this.reciverWalletAddress) throw new Error("Reciver Wallet Address is not defined")
        if (!this.quoteGrantRequest) throw new Error("Quote Grant Request is not defined")
        if (!this.senderWalletAddress) throw new Error("Sender Wallet Address is not defined")
        if (!this.incomingPayment) throw new Error("Incoming Payment is not defined")
        const quote = await this.client.quote.create(
            {
                url: this.reciverWalletAddress.resourceServer,
                accessToken: this.quoteGrantRequest.access_token.value,
            },
            {
                walletAddress: this.senderWalletAddress.id,
                receiver: this.incomingPayment.id,
                method: "ilp"
            }
        );
        this.quote = quote;
    }

    public async getQuotes() {
        if (!this.quoteGrantRequest) throw new Error("Quote Grant Request is not defined")
        if (!this.quote) throw new Error("Quote is not defined")
        const quote = await this.client.quote.get({
            url: this.quote.id,
            accessToken: this.quoteGrantRequest.access_token.value,
        });
        return quote;
    }

    public async createOutGoingPaymentGrant(allowedActions: AllowedActionsOutGoingPaymentGrant[]) {
        if (!this.senderWalletAddress) throw new Error("Sender Wallet Address is not defined")
        if (!this.quote) throw new Error("quote is not defined")
        const NONCE = randomUUID();
        const outgoingPaymentGrant = await this.client.grant.request(
            {
                url: this.senderWalletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            identifier: this.senderWalletAddress.id,
                            type: "outgoing-payment",
                            actions: allowedActions,
                            limits: {
                                debitAmount: this.quote.debitAmount,
                            },
                        },
                    ],
                },
                interact: {
                    start: ["redirect"],
                    // finish: {
                    //     method: "redirect",
                    //     uri: "http://localhost:3344",
                    //     nonce: NONCE,
                    // },
                },
            },
        );
        console.log(outgoingPaymentGrant);
        await Readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
            .question('seguir...');
        this.outGoingPaymentGrant = outgoingPaymentGrant;

    }

    public async finalizedOutGoingPaymentGrant() {
        if (!this.outGoingPaymentGrant) throw new Error("out Going Payment Grant is not defined");
        const NONCE = randomUUID();
        const continueGrant = await this.client.grant.continue(
            {
                accessToken: this.outGoingPaymentGrant.continue.access_token.value,
                url: this.outGoingPaymentGrant.continue.uri,
            },
        );
        if (!isFinalizedGrant(continueGrant)) {
            throw new Error("Expected finalized grant. Received non-finalized grant.");
        }
        this.finalizedOutGoingPayment = continueGrant;
    }

    public async createOutgoingPayment() {
        if (!this.senderWalletAddress) throw new Error("Sender Wallet Address is not defined")
        if (!this.finalizedOutGoingPayment) throw new Error("finalized Out Going Payment is not defined")
        if (!this.senderWalletAddress) throw new Error("Sender Wallet Address is not defined")
        if (!this.quote) throw new Error("quote is not defined")
        const outgoingPayment = await this.client.outgoingPayment.create(
            {
                url: this.senderWalletAddress.resourceServer,
                accessToken: this.finalizedOutGoingPayment.access_token.value
            },
            {
                walletAddress: this.senderWalletAddress.id,
                quoteId: this.quote.id
            }
        )
        this.outgoingPayment = outgoingPayment;
        console.log(this.outgoingPayment);

    }

    public async getListIncomingPayments() {
        if (!this.reciverWalletAddress) throw new Error("reciver wallet Address is not defined")
        if (!this.incomingPaymentGrant) throw new Error("incoming Payment Grant is not defined")
        const listIncomingPayments = await this.client.incomingPayment.list(
            {
                url: this.reciverWalletAddress.resourceServer,
                walletAddress: this.reciverWalletAddress.id,
                accessToken: this.incomingPaymentGrant.access_token.value,
            },
            {
                first: 10,
                last: undefined,
                cursor: undefined,
            }
        )
        return listIncomingPayments;
    }

    public async createOutGoingPaymentListGrant(allowedActions: AllowedActionsOutGoingPaymentGrant[]) {
        if (!this.senderWalletAddress) throw new Error("Sender Wallet Address is not defined")
        const grant = await this.client.grant.request(
            {
                url: this.senderWalletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            identifier: this.senderWalletAddress.id,
                            type: "outgoing-payment",
                            actions: allowedActions,
                        },
                    ],
                },
                interact: {
                    start: ["redirect"],
                },
            },
                    
        );
        console.log(grant);
        
        await Readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
            .question('seguir...');
        this.outGoingPaymentGrant = grant;
        console.log(this.outGoingPaymentGrant);
        
    }

    public async getListOutgoingPayments() {
        if (!this.senderWalletAddress) throw new Error("reciver wallet Address is not defined")
        if (!this.finalizedOutGoingPayment) throw new Error("incoming Payment Grant is not defined")
        const listIncomingPayments = await this.client.outgoingPayment.list(
            {
                url: this.senderWalletAddress.resourceServer,
                walletAddress: this.senderWalletAddress.id,
                accessToken: this.finalizedOutGoingPayment.access_token.value,
            },
            {
                first: 10,
                last: undefined,
                cursor: undefined,
            }
        )
        return listIncomingPayments;
    }

    private async getWalletAddress(walletName: string) {
        const url = `${URL_INTERLEDGER}${walletName}`
        const walletAddress = await this.client.walletAddress.get({
            url: url,
        });
        return walletAddress;
    }
}