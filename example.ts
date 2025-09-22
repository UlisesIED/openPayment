import  Readline  from "readline/promises";  
import {OpenPaymentsService} from '@/app/lib/services/OpenPaymentsService'
import {
    KEY_ID,
    PRIVATE_KEY_PATH,
    WALLET_ADDRESS
} from '@/app/lib/constants'

async function realizarPago() {
    // 1.- paso generamos la conexión al entorno del wallet con las variables de entrno
    // WALLET_ADDRESS =     https://ilp.interledger-test.dev/azteca
    // PRIVATE_KEY_PATH =   MC4CAQAwBQYDK2VwBCIEIAmeL+n4cgy00Mw0+60H3WH0WuEnmgfVYgKQu3rclQsr
    // KEY_ID =             eb7b68cb-48f1-499b-a0c3-deaa24b1237f   
    const paymentService = await OpenPaymentsService.initialize({
        walletAddress:  WALLET_ADDRESS!,
        privateKey:     PRIVATE_KEY_PATH!,
        keyId:          KEY_ID!,
    });

    // 2.- paso obtenemos los nombres de los wallet del emisor y receptor
    const reciverWalletName = "ulises";
    const senderWalletName = "base";
    // 3.- paso obtenermos las wallets de los mismos
    await paymentService.addSenderWalletAddress(senderWalletName);
    await paymentService.addReciverWalletAddress(reciverWalletName);
    // 4.- paso generamos los accesos del pago y generamos el pago
    // posibles acciones ["list", "read", "read-all", "complete", "create"]
    await paymentService.createIncomingPaymentGrant(["create"]);
    await paymentService.createIncomingPayment("200");
    // 5.- generamos los accesos del grant y el grant
    // posibles acciones ["create", "read", "read-all"]
    await paymentService.createQuoteGrant(['create']);
    await paymentService.createQuote();
    // posibles acciones ["list", "list-all", "read", "read-all", "create"]
    // 6.- Este es el paso mas importante en este paso se manda la url 
    // que da acceso al pago si no se autoriza, lanzara un error el sistema
    await paymentService.createOutGoingPaymentGrant(['create']);
    // 7.- Este paso valida que el pago haya sido autorizado y genera el grant
    await paymentService.finalizedOutGoingPaymentGrant();
    // 8.- El paso final se manda el pago a la persona.
    await paymentService.createOutgoingPayment();
    return
}


async function getIncomingTransactions(){
    // paso 1 generamos al cliente 
    const paymentService = await OpenPaymentsService.initialize({
        walletAddress:  WALLET_ADDRESS!,
        privateKey:     PRIVATE_KEY_PATH!,
        keyId:          KEY_ID!,
    });

    // 2.- pedimos el nombre del wallet de la cuenta y su wallet
    const reciverWallet = "arturo";
    await paymentService.addReciverWalletAddress(reciverWallet);
    // 3.- creamos el incoming Payment Grant
    await paymentService.createIncomingPaymentGrant(['list']);
    // 3.- Obtenemos la lista del wallet
    const listIncomingPayments = await paymentService.getListIncomingPayments();
    console.log(listIncomingPayments);
    return
}

async function getOutGoingTransactions(){
    // paso 1 generamos al cliente 
    const paymentService = await OpenPaymentsService.initialize({
        walletAddress:  WALLET_ADDRESS!,
        privateKey:     PRIVATE_KEY_PATH!,
        keyId:          KEY_ID!,
    });

    const senderWalletName = "456f9935";
    await paymentService.addSenderWalletAddress(senderWalletName);
    await paymentService.createOutGoingPaymentListGrant([ 'list', "read"]);
    await paymentService.finalizedOutGoingPaymentGrant()
    const listOutgoingPayment = await paymentService.getListOutgoingPayments();
    console.log(listOutgoingPayment);
}

;
// realizarPago().catch(error => {
//     console.error("Ocurrió un error:", error);
//     process.exit(1);
// });

realizarPago().catch(error => {
    console.error("Ocurrió un error:", error);
    process.exit(1);
});

// (async () => {

//     const privateKey = "MC4CAQAwBQYDK2VwBCIEIAmeL+n4cgy00Mw0+60H3WH0WuEnmgfVYgKQu3rclQsr"
//     console.log(privateKey);

//     const key = createPrivateKey({
//         key: Buffer.from(privateKey, "base64"),
//         format: "der",
//         type: "pkcs8",
//     });

//     const client = await createAuthenticatedClient({
//         walletAddressUrl: "https://ilp.interledger-test.dev/azteca",
//         privateKey: key,
//         keyId: "eb7b68cb-48f1-499b-a0c3-deaa24b1237f"
//     })
//     console.log("client");
//     console.log({client});

//     console.log("incomingPayment");
//     console.log(client.incomingPayment.get);
    
//     console.log("==========================================================================");

//     const sendWalletAddress = await client.walletAddress.get({
//         url: 'https://ilp.interledger-test.dev/456f9935'
//     })
//     console.log("sendWalletAddress");
//     console.log(sendWalletAddress);
//     console.log("==========================================================================");
    
//     const reciveWalletAddress = await client.walletAddress.get({
//         url: 'https://ilp.interledger-test.dev/arturo'
//     })
//     console.log("sendWalletAddress, reciveWalletAddress");
//     console.log(sendWalletAddress, reciveWalletAddress);
//     console.log("==========================================================================");
    










//     const incomingPaymentGrant = await client.grant.request(
//         {
//             url: reciveWalletAddress.authServer
//         },
//         {
//             access_token:{
//                 access:[
//                     {
//                         type: 'incoming-payment',
//                         actions: ["create"]
//                     }
//                 ]
//             }
//         }
//     );
//     console.log("incomingPaymentGrant");
//     console.log(incomingPaymentGrant);
//     console.log("==========================================================================");
    


//     console.log("===========================================");
    
//     if(!isFinalizedGrant(incomingPaymentGrant)){
//         throw new Error("Se espera a que finalice")
//     }

//     console.log("incomingPaymentGrant");
//     console.log(incomingPaymentGrant);
    
//     console.log("==========================================================================");

//     const incomingPayment = await client.incomingPayment.create(
//         {
//             url:reciveWalletAddress.resourceServer,
//             accessToken:incomingPaymentGrant.access_token.value,
//         },
//         {
//             walletAddress:reciveWalletAddress.id,
//             incomingAmount:{
//                 assetCode:reciveWalletAddress.assetCode,
//                 assetScale: reciveWalletAddress.assetScale,
//                 value: "1000"
//             },
//         }
//     );

        

    
//     console.log({incomingPayment});
//     console.log("==========================================================================");

//     const quoteGrant = await client.grant.request(
//         {
//             url:sendWalletAddress.authServer,
//         },
//         {
//             access_token:{
//                 access: [
//                     {
//                         type:"quote",
//                         actions:["create"]
//                     }
//                 ]
//             }
//         }
//     );

//     if(!isFinalizedGrant(quoteGrant)){
//         throw new Error("se espera que se finalice la consesion");
//     }

//     console.log(quoteGrant);
//     console.log("==========================================================================");
    
//     const quote = await client.quote.create(
//         {
//             url:reciveWalletAddress.resourceServer,
//             accessToken: quoteGrant.access_token.value,
//         },
//         {
//             walletAddress: sendWalletAddress.id,
//             receiver:incomingPayment.id,
//             method: "ilp"
//         }
//     );

//     console.log({quote});
//     console.log("==========================================================================");

//     const outgoingPaymentGrant = await client.grant.request(
//         {
//             url:sendWalletAddress.authServer,
//         },
//         {
//             access_token:{
//                 access:[
//                     {
//                         type:"outgoing-payment",
//                         actions:["create"],
//                         limits:{
//                             debitAmount:quote.debitAmount,
//                         },
//                         identifier:sendWalletAddress.id
//                     }
//                 ]
//             },
//             interact:{
//                 start: ["redirect"]
//             },
//         }
//     )
//     console.log({outgoingPaymentGrant});
//     console.log("==========================================================================");

//     await Readline
//     .createInterface({
//             input: process.stdin,
//             output: process.stdout
//     })
//     .question('seguir...');
    
//     const finalizedOutgoingPaymentGrant = await client.grant.continue({
//         url:outgoingPaymentGrant.continue.uri,
//         accessToken:outgoingPaymentGrant.continue.access_token.value
//     });
    
//     console.log("finalizedOutgoingPaymentGrant");
//     console.log(finalizedOutgoingPaymentGrant);
    


//     if(!isFinalizedGrant(finalizedOutgoingPaymentGrant)){
//         throw new Error("se espera a que acabe este rollo")
//     }

//     const outgoingPayment = await client.outgoingPayment.create(
//         {
//             url:sendWalletAddress.resourceServer,
//             accessToken:finalizedOutgoingPaymentGrant.access_token.value
//         },
//         {
//             walletAddress:sendWalletAddress.id,
//             quoteId:quote.id
//         }
//     )

//     console.log({outgoingPayment});
    
// })();

