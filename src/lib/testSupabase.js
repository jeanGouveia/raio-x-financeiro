// src/lib/testSupabase.js
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log("🔍 Testando conexão com Supabase...");

  try {
    // Teste simples: tenta ler as dicas (sem filtro)
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .limit(3);

    if (error) {
      console.error("❌ Erro ao conectar com Supabase:", error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ Conexão com Supabase OK!");
    console.log("Dicas encontradas:", data?.length || 0);
    console.table(data);
    
    return { success: true, data };
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
    return { success: false, error: err.message };
  }
}