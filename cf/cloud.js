//Set Up Moralis API Rate Limits Here
Moralis.settings.setAPIRateLimit({
    anonymous: 1000,
    authenticated: 2000,
    windowMs: 60000,
});
