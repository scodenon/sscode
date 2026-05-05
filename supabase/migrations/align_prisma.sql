alter table "User"
  alter column "createdAt" type timestamp(3) using "createdAt"::timestamp(3),
  alter column "updatedAt" type timestamp(3) using "updatedAt"::timestamp(3),
  alter column "updatedAt" drop default;

alter table "Account"
  alter column "balanceStartAt" type timestamp(3) using "balanceStartAt"::timestamp(3),
  alter column "createdAt" type timestamp(3) using "createdAt"::timestamp(3),
  alter column "updatedAt" type timestamp(3) using "updatedAt"::timestamp(3),
  alter column "updatedAt" drop default;

alter table "Transaction"
  alter column "occurredAt" type timestamp(3) using "occurredAt"::timestamp(3),
  alter column "createdAt" type timestamp(3) using "createdAt"::timestamp(3),
  alter column "updatedAt" type timestamp(3) using "updatedAt"::timestamp(3),
  alter column "updatedAt" drop default;

create index if not exists "Transaction_category_idx" on "Transaction"("category");
create index if not exists "Account_userId_balanceStartAt_idx" on "Account"("userId", "balanceStartAt");

