import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.replace("/wallet", "") || "/";
    const method = req.method;

    // GET /wallet - wallet summary
    if (method === "GET" && path === "/summary") {
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return errorResponse(error.message, 500);

      const totalCredits = transactions
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalDebits = transactions
        .filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const balance = totalCredits - totalDebits;
      const totalTransactions = transactions.length;

      return jsonResponse({
        balance,
        totalCredits,
        totalDebits,
        totalTransactions,
      });
    }

    // GET /transactions
    if (method === "GET" && path === "/transactions") {
      const type = url.searchParams.get("type");
      const status = url.searchParams.get("status");
      const currency = url.searchParams.get("currency");
      const search = url.searchParams.get("search");

      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (type) query = query.eq("type", type);
      if (status) query = query.eq("status", status);
      if (currency) query = query.eq("currency", currency);
      if (search) query = query.ilike("description", `%${search}%`);

      const { data, error } = await query;
      if (error) return errorResponse(error.message, 500);
      return jsonResponse(data);
    }

    // POST /transactions
    if (method === "POST" && path === "/transactions") {
      const body = await req.json();
      const { type, amount, currency, status, description } = body;

      if (!type || !["credit", "debit"].includes(type)) {
        return errorResponse("Type must be 'credit' or 'debit'");
      }
      if (!amount || Number(amount) <= 0) {
        return errorResponse("Amount must be greater than 0");
      }
      if (!currency) return errorResponse("Currency is required");
      if (!description) return errorResponse("Description is required");

      // Check balance for debit
      if (type === "debit") {
        const { data: allTx } = await supabase
          .from("transactions")
          .select("type, amount");
        const balance = allTx.reduce((sum: number, t: { type: string; amount: number }) => {
          return t.type === "credit" ? sum + Number(t.amount) : sum - Number(t.amount);
        }, 0);
        if (Number(amount) > balance) {
          return errorResponse("Insufficient balance for this debit", 422);
        }
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          type,
          amount: Number(amount),
          currency,
          status: status || "completed",
          description,
        })
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);
      return jsonResponse(data, 201);
    }

    // PUT /transactions/:id
    if (method === "PUT" && path.startsWith("/transactions/")) {
      const id = path.split("/transactions/")[1];
      const body = await req.json();

      const { data, error } = await supabase
        .from("transactions")
        .update(body)
        .eq("id", id)
        .select()
        .single();

      if (error) return errorResponse(error.message, 500);
      if (!data) return errorResponse("Transaction not found", 404);
      return jsonResponse(data);
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    return errorResponse(err.message || "Internal server error", 500);
  }
});
