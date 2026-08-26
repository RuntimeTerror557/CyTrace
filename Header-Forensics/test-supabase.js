const supabase = require('./config/supabase');

async function testConnection() {
    const { data, error } = await supabase
        .from('emails')
        .select('id')
        .limit(1);

    if (error) {
        console.error('❌ Supabase connection failed:');
        console.error(error);
        return;
    }

    console.log('✅ Supabase connection successful!');
    console.log('Database is reachable.');
}

testConnection();