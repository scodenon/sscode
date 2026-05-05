grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table "User" to anon, authenticated;
grant select, insert, update, delete on table "Account" to anon, authenticated;
grant select, insert, update, delete on table "Transaction" to anon, authenticated;

