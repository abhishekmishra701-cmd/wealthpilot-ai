const SUPABASE_URL = "https://kqdmfcrzxwuttobcfjpk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_C_xmXmeWiCLpy_XuN7zYjA_dULjcjs8";

let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return supabaseClient;
}

async function currentUser() {
  const client=getSupabase();
  if (!client) throw new Error("Supabase client unavailable");
  const {data,error}=await client.auth.getUser();
  if (error) throw error;
  return data.user;
}

async function signUp(email,password) {
  const client=getSupabase();
  const {data,error}=await client.auth.signUp({email,password});
  if (error) throw error;
  return data;
}
async function signIn(email,password) {
  const client=getSupabase();
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if (error) throw error;
  return data;
}
async function signOut() {
  const client=getSupabase();
  const {error}=await client.auth.signOut();
  if (error) throw error;
}

async function createPortfolio(name,baseCurrency="INR") {
  const user=await currentUser();
  const client=getSupabase();
  const {data,error}=await client.from("wp_portfolios").insert({
    user_id:user.id,name,base_currency:baseCurrency
  }).select().single();
  if (error) throw error;
  return data;
}
async function listPortfolios() {
  const user=await currentUser();
  const client=getSupabase();
  const {data,error}=await client.from("wp_portfolios")
    .select("id,name,base_currency,created_at,updated_at")
    .eq("user_id",user.id).order("created_at",{ascending:false});
  if (error) throw error;
  return data || [];
}
async function createHolding(portfolioId,holding) {
  const client=getSupabase();
  const {data,error}=await client.from("wp_holdings").insert({
    portfolio_id:portfolioId,...holding
  }).select().single();
  if (error) throw error;
  return data;
}
async function listHoldings(portfolioId) {
  const client=getSupabase();
  const {data,error}=await client.from("wp_holdings")
    .select("*").eq("portfolio_id",portfolioId).order("created_at",{ascending:false});
  if (error) throw error;
  return data || [];
}
async function createTransaction(portfolioId,tx) {
  const client=getSupabase();
  const {data,error}=await client.from("wp_transactions").insert({
    portfolio_id:portfolioId,...tx
  }).select().single();
  if (error) throw error;
  return data;
}
async function listTransactions(portfolioId) {
  const client=getSupabase();
  const {data,error}=await client.from("wp_transactions")
    .select("*").eq("portfolio_id",portfolioId)
    .order("transaction_date",{ascending:false});
  if (error) throw error;
  return data || [];
}
async function createGoal(goal) {
  const user=await currentUser();
  const client=getSupabase();
  const {data,error}=await client.from("wp_goals").insert({
    user_id:user.id,...goal
  }).select().single();
  if (error) throw error;
  return data;
}
async function listGoals() {
  const user=await currentUser();
  const client=getSupabase();
  const {data,error}=await client.from("wp_goals")
    .select("*").eq("user_id",user.id).order("created_at",{ascending:false});
  if (error) throw error;
  return data || [];
}
