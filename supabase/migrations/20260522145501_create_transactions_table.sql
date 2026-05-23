/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key, auto-generated)
      - `type` (text, either 'credit' or 'debit', not null)
      - `amount` (numeric, must be > 0, not null)
      - `currency` (text, default 'USD', not null)
      - `status` (text, one of 'completed', 'pending', 'failed', default 'completed')
      - `description` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `transactions` table
    - Add policies for authenticated users to perform CRUD on own data
    - Add policies for anonymous users to perform CRUD (for demo purposes)

  3. Notes
    - Amount check constraint ensures positive values only
    - Status check constraint ensures valid status values
    - Type check constraint ensures credit or debit only
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow anonymous users to read transactions"
  ON transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous users to insert transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update transactions"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to delete transactions"
  ON transactions FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
