
// ACCESS_TOKEN => token.access_token.value
// MANAGE_URL   => token.access_token.manage
export const rotateAccessToken = async (
    client: any,
    paymentGrant: any
) => {
    const token = await client.token.rotate({
        accessToken: paymentGrant.continue.access_token.value,
        url: paymentGrant.continue.uri,
    });
    return token;
}

export const revokeAccessToken = async (
    client: any,
    paymentGrant: any
) => {
    await client.token.revoke({
        accessToken: paymentGrant.continue.access_token.value,
        url: paymentGrant.continue.uri,
    });
}