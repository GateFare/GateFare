import Amadeus from 'amadeus';

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    hostname: (process.env.AMADEUS_HOSTNAME || 'test') as 'test' | 'production',
});

export default amadeus;
