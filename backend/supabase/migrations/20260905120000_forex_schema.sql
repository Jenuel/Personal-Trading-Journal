-- Migration: 20260905120000_forex_schema
-- Reshapes the stock-trading scaffold into the FOREX journal schema the frontend expects.
-- Portfolio rows are preserved; trade rows are not, because a stock row
-- (symbol/quantity/price/type) has no FOREX equivalent.

-- Portfolios: extend to the full trading-account shape
ALTER TABLE portfolios
    ADD COLUMN description     TEXT,
    ADD COLUMN initial_balance NUMERIC     NOT NULL DEFAULT 0,
    ADD COLUMN current_balance NUMERIC     NOT NULL DEFAULT 0,
    ADD COLUMN currency        VARCHAR(3)  NOT NULL DEFAULT 'USD',
    ADD COLUMN broker          VARCHAR(255),
    ADD COLUMN account_type    VARCHAR(10) NOT NULL DEFAULT 'DEMO',
    ADD COLUMN updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now());

UPDATE portfolios
SET initial_balance = COALESCE(balance, 0),
    current_balance = COALESCE(balance, 0);

ALTER TABLE portfolios
    DROP COLUMN balance,
    ADD CONSTRAINT portfolios_account_type_check CHECK (account_type IN ('LIVE', 'DEMO', 'PROP'));

-- Trades: rebuilt around the FOREX model
DROP TABLE trades;

CREATE TABLE trades (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

    pair         VARCHAR(20) NOT NULL,
    direction    VARCHAR(5)  NOT NULL,
    lots         NUMERIC     NOT NULL,

    entry_price  NUMERIC     NOT NULL,
    exit_price   NUMERIC,
    stop_loss    NUMERIC,
    take_profit  NUMERIC,

    pips         NUMERIC,
    result       NUMERIC,
    rr           NUMERIC,
    outcome      VARCHAR(4),

    session      VARCHAR(10),
    setup        VARCHAR(255),

    date         TIMESTAMP WITH TIME ZONE NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT trades_direction_check CHECK (direction IN ('LONG', 'SHORT')),
    CONSTRAINT trades_outcome_check   CHECK (outcome IS NULL OR outcome IN ('WIN', 'LOSS', 'BE')),
    CONSTRAINT trades_session_check   CHECK (session IS NULL OR session IN ('LONDON', 'NEW_YORK', 'TOKYO', 'SYDNEY', 'OVERLAP'))
);

CREATE INDEX trades_portfolio_id_idx ON trades(portfolio_id);

-- Cash transactions: deposits and withdrawals against an account
CREATE TABLE cash_transactions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    type         VARCHAR(10) NOT NULL,
    amount       NUMERIC     NOT NULL,
    date         TIMESTAMP WITH TIME ZONE NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT cash_transactions_type_check CHECK (type IN ('DEPOSIT', 'WITHDRAWAL'))
);

CREATE INDEX cash_transactions_portfolio_id_idx ON cash_transactions(portfolio_id);
