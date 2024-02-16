const User = require('../models/user');

async function addDefaultUser() {
    // Check if there are existing documents in the User collection
    const existingUser = await User.countDocuments();
    if (existingUser === 0) {
        // Add default network data
        await User.insert(
            {
                steam_id: '123123123123123',
                username: 'Justin',
                photo_url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,

            }
        );

        console.log('Default network data added');
    }
}

module.exports = {
    addDefaultUser,
};
