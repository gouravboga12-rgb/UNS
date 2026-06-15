import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzhrpafgsevjyifduncz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHJwYWZnc2V2anlpZmR1bmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjM4MjMsImV4cCI6MjA5NzA5OTgyM30.JnCJudrbA9ZiD8Jdi6PTj6oCHBX4qhnuw6yNulzOP8E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['products', 'categories', 'orders', 'reviews', 'enquiries', 'users'];
  for (const table of tables) {
    try {
      const { data, error, status } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table "${table}": Error (status ${status}) - ${error.message}`);
      } else {
        console.log(`Table "${table}": SUCCESS - Table exists. Found:`, data);
      }
    } catch (err: any) {
      console.log(`Table "${table}": Exception - ${err.message}`);
    }
  }
}

checkTables();
