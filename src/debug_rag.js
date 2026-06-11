const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log("Checking movies in database...");
  const { data: movies, error } = await supabase
    .from('movies')
    .select('id, title, description, embedding')
    .limit(10);

  if (error) {
    console.error("Error fetching movies:", error);
    return;
  }

  console.log(`Found ${movies.length} movies.`);
  movies.forEach(m => {
    console.log(`- [${m.id}] ${m.title}: Embedding exists? ${!!m.embedding}`);
    if (m.embedding) {
      console.log(`  Embedding length: ${m.embedding.length}`);
    }
  });

  console.log("\nTesting keyword search for 'tận thế'...");
  const { data: keywordMatch } = await supabase
    .from('movies')
    .select('title')
    .or('title.ilike.%tận thế%,description.ilike.%tận thế%');
  
  console.log("Keyword matches:", keywordMatch);
}

debug();
