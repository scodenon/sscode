do $$
begin
  if not exists (select 1 from pg_type where typname = 'AccountType') then
    create type "AccountType" as enum ('cash', 'bank', 'credit', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'TransactionType') then
    create type "TransactionType" as enum ('income', 'expense');
  end if;
end $$;

create table if not exists "User" (
  id text primary key,
  email text not null unique,
  "passwordHash" text not null,
  name text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Account" (
  id text primary key,
  "userId" text not null,
  name text not null,
  type "AccountType" not null,
  currency text not null,
  "initialBalance" int not null,
  "balanceStartAt" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "Account_userId_fkey" foreign key ("userId") references "User"(id) on delete cascade
);

create index if not exists "Account_userId_idx" on "Account"("userId");

create table if not exists "Transaction" (
  id text primary key,
  "userId" text not null,
  "accountId" text not null,
  type "TransactionType" not null,
  amount int not null,
  currency text not null,
  description text,
  category text,
  "occurredAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "Transaction_userId_fkey" foreign key ("userId") references "User"(id) on delete cascade,
  constraint "Transaction_accountId_fkey" foreign key ("accountId") references "Account"(id) on delete cascade
);

create index if not exists "Transaction_userId_idx" on "Transaction"("userId");
create index if not exists "Transaction_accountId_idx" on "Transaction"("accountId");
create index if not exists "Transaction_userId_accountId_idx" on "Transaction"("userId", "accountId");

create or replace function public.set_updated_at() returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_updated_at_User'
  ) then
    create trigger set_updated_at_User
      before update on "User"
      for each row
      execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_updated_at_Account'
  ) then
    create trigger set_updated_at_Account
      before update on "Account"
      for each row
      execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_updated_at_Transaction'
  ) then
    create trigger set_updated_at_Transaction
      before update on "Transaction"
      for each row
      execute function public.set_updated_at();
  end if;
end $$;

alter table "User" enable row level security;
alter table "Account" enable row level security;
alter table "Transaction" enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table "User" to anon, authenticated;
grant select, insert, update, delete on table "Account" to anon, authenticated;
grant select, insert, update, delete on table "Transaction" to anon, authenticated;

