const Amadeus = require('amadeus');
require('dotenv').config();

const clientId = process.env.AMADEUS_CLIENT_ID;
const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
const hostname = process.env.AMADEUS_HOSTNAME || 'test';

console.log("Client ID present:", !!clientId);
console.log("Client Secret present:", !!clientSecret);
console.log("Hostname:", hostname);

if (!clientId || !clientSecret) {
    console.error("Missing credentials in .env");
    process.exit(1);
}

const amadeus = new Amadeus({
    clientId: clientId,
    clientSecret: clientSecret,
    hostname: hostname
});

async function test() {
    try {
        console.log("\n=== TEST 1: Using Amadeus.location.any ===");
        console.log("Amadeus.location:", Amadeus.location);

        if (Amadeus.location && Amadeus.location.any) {
            const response1 = await amadeus.referenceData.locations.get({
                keyword: 'LON',
                subType: Amadeus.location.any,
                page: { limit: 1 }
            });
            console.log("✅ Success with Amadeus.location.any");
            console.log("Data:", JSON.stringify(response1.data[0], null, 2));
        } else {
            console.log("❌ Amadeus.location.any is not available");
        }
    } catch (error) {
        console.error("❌ Error with Amadeus.location.any:", error.code || error.message);
    }

    try {
        console.log("\n=== TEST 2: Using CITY,AIRPORT string ===");
        const response2 = await amadeus.referenceData.locations.get({
            keyword: 'LON',
            subType: 'CITY,AIRPORT',
            page: { limit: 1 }
        });
        console.log("✅ Success with 'CITY,AIRPORT'");
        console.log("Data:", JSON.stringify(response2.data[0], null, 2));
    } catch (error) {
        console.error("❌ Error with 'CITY,AIRPORT':", error.code || error.message);
    }

    try {
        console.log("\n=== TEST 3: Without subType ===");
        const response3 = await amadeus.referenceData.locations.get({
            keyword: 'LON',
            page: { limit: 1 }
        });
        console.log("✅ Success without subType");
        console.log("Data:", JSON.stringify(response3.data[0], null, 2));
    } catch (error) {
        console.error("❌ Error without subType:", error.code || error.message);
    }
}

test();
