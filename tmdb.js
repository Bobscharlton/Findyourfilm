// netlify/functions/tmdb.js
exports.handler = async function(event, context) {
    // 1. Grab the private key from the Netlify Vault
    const API_KEY = process.env.TMDB_API_KEY;
    
    // 2. See what the frontend is asking for
    const path = event.queryStringParameters.path;
    
    if (!path) {
        return { statusCode: 400, body: "Missing TMDB path" };
    }

    // 3. Rebuild the query string to send to TMDB
    let queryParams = new URLSearchParams(event.queryStringParameters);
    queryParams.delete('path'); // Remove our custom routing parameter
    queryParams.append('api_key', API_KEY); // Secretly attach the key!

    const tmdbUrl = `https://api.themoviedb.org/3${path}?${queryParams.toString()}`;

    // 4. Fetch the data from TMDB and send it back to the user
    try {
        const response = await fetch(tmdbUrl);
        const data = await response.json();
        
        // Cache control: Tells browsers to remember this exact search for 1 hour to save API calls!
        return {
            statusCode: 200,
            headers: {
                "Cache-Control": "public, s-maxage=3600"
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
}