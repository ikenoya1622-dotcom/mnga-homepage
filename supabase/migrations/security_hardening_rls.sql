-- =====================================================================
-- 緊急セキュリティ強化：RLSを「ログイン者なら誰でも書込」→「admin限定」へ再設計
--   背景: 公開サインアップで自己登録した第三者が authenticated になり、
--         news_items / reports / admin_logs / storage を改ざん・削除できた（§P-SEC）。
--
-- 【適用前提（Supabaseダッシュボードで先に実施）】
--   1) Authentication → Sign In/Up → Email：「Allow new users to sign up」を OFF
--   2) 正規管理者ユーザーに admin ロールを付与（app_metadata）。SQL Editorで:
--        update auth.users
--          set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'
--          where email = 'ここに正規管理者のメール';
--      ※ app_metadata はユーザー自身が書き換えできない＝なりすまし不可。
--   3) 不正ユーザーを Auth → Users で削除、JWTシークレットをローテート（既存セッション全失効）。
--
-- 本ファイルは冪等（再実行可）。SQL Editor に貼り付けて実行。
-- =====================================================================

-- ── admin 判定ヘルパー（JWTの app_metadata.role='admin' のみ true）──
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ============================ news_items ============================
alter table public.news_items enable row level security;
-- 旧・緩い authenticated 全許可ポリシーを撤去
drop policy if exists "authenticated can insert news" on public.news_items;
drop policy if exists "authenticated can update news" on public.news_items;
drop policy if exists "authenticated can delete news" on public.news_items;
drop policy if exists "public can read news"          on public.news_items;
drop policy if exists news_public_read  on public.news_items;
drop policy if exists news_admin_write  on public.news_items;
-- 公開: 読み取りのみ
create policy news_public_read on public.news_items
  for select using (true);
-- 書込: admin のみ（INSERT/UPDATE/DELETE）
create policy news_admin_write on public.news_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================ reports ==============================
alter table public.reports enable row level security;
drop policy if exists "authenticated can insert reports" on public.reports;
drop policy if exists "authenticated can update reports" on public.reports;
drop policy if exists "authenticated can delete reports" on public.reports;
drop policy if exists "public can read reports"          on public.reports;
drop policy if exists reports_public_read on public.reports;
drop policy if exists reports_admin_write on public.reports;
create policy reports_public_read on public.reports
  for select using (true);
create policy reports_admin_write on public.reports
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================ admin_logs ===========================
-- 監査ログ：匿名/一般の読取・改ざんを全面禁止。admin のみ追記・閲覧可（更新/削除は不可＝追記専用）。
alter table public.admin_logs enable row level security;
drop policy if exists "anon can read admin_logs"          on public.admin_logs;
drop policy if exists "authenticated can insert admin_logs" on public.admin_logs;
drop policy if exists admin_logs_admin_insert on public.admin_logs;
drop policy if exists admin_logs_admin_select on public.admin_logs;
create policy admin_logs_admin_insert on public.admin_logs
  for insert to authenticated
  with check (public.is_admin());
create policy admin_logs_admin_select on public.admin_logs
  for select to authenticated
  using (public.is_admin());
-- UPDATE/DELETE ポリシーは作らない＝改ざん・削除不可（service_role のみバイパス可）

-- ============================ storage.objects ======================
-- 公開バケット(news-files / report-thumbnails)：読み取りは公開、書込/削除は admin 限定。
drop policy if exists "public can read news files"          on storage.objects;
drop policy if exists "authenticated can upload news files" on storage.objects;
drop policy if exists "authenticated can delete news files" on storage.objects;
drop policy if exists mnga_storage_public_read on storage.objects;
drop policy if exists mnga_storage_admin_write on storage.objects;

create policy mnga_storage_public_read on storage.objects
  for select using (bucket_id in ('news-files','report-thumbnails'));
create policy mnga_storage_admin_write on storage.objects
  for all to authenticated
  using (bucket_id in ('news-files','report-thumbnails') and public.is_admin())
  with check (bucket_id in ('news-files','report-thumbnails') and public.is_admin());

-- 追加推奨（任意・ダッシュボード）：バケットのファイルサイズ上限・許可MIME(image/* と application/pdf)を設定。
