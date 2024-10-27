const dbUtils = require('./mysql_header');

async function main() {
    //const user = await dbUtils.insertUser("AliceInWonderland", "aliceinwonderlend@example.com", "superpassword", "Alice", "rabbit hole", "Registered user");
    const user = await dbUtils.getItemByColumn("user", "name", "AliceInWonderland");
    const wasRegistered = await dbUtils.registerUser(user.user_id, 0);
    console.log(wasRegistered);
    
}

// Use an IIFE (Immediately Invoked Function Expression) to await main and closeConnection sequentially
(async () => {
    await main();  
    dbUtils.closeConnection();  
})();