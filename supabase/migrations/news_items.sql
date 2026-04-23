-- =====================================================
-- news_items テーブル（お知らせ管理）
-- =====================================================

CREATE TABLE IF NOT EXISTS news_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category      text NOT NULL,        -- '定款' | '事業報告' | 'お知らせ'
  published_at  date NOT NULL,
  title         text NOT NULL,
  file_url      text,                 -- 任意: PDF の公開URL
  sort_order    int DEFAULT 0,        -- 小さいほど上に表示
  created_at    timestamptz DEFAULT now()
);

-- 並び替え用のインデックス
CREATE INDEX IF NOT EXISTS idx_news_items_category_date
  ON news_items (category, published_at DESC, sort_order);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可（公開コンテンツ）
DROP POLICY IF EXISTS "public can read news" ON news_items;
CREATE POLICY "public can read news"
  ON news_items FOR SELECT
  USING (true);

-- 書き込みは認証ユーザーのみ
DROP POLICY IF EXISTS "authenticated can insert news" ON news_items;
CREATE POLICY "authenticated can insert news"
  ON news_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated can update news" ON news_items;
CREATE POLICY "authenticated can update news"
  ON news_items FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can delete news" ON news_items;
CREATE POLICY "authenticated can delete news"
  ON news_items FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- Storage: news-files バケット
-- =====================================================
-- Supabase Dashboard → Storage → Create bucket で以下を作成:
--   Name:  news-files
--   Public bucket: ON
-- その後、以下の Storage ポリシーを実行:

-- 誰でも PDF を読み取り可
DROP POLICY IF EXISTS "public can read news files" ON storage.objects;
CREATE POLICY "public can read news files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-files');

-- 認証ユーザーのみアップロード可
DROP POLICY IF EXISTS "authenticated can upload news files" ON storage.objects;
CREATE POLICY "authenticated can upload news files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news-files');

-- 認証ユーザーのみ削除可
DROP POLICY IF EXISTS "authenticated can delete news files" ON storage.objects;
CREATE POLICY "authenticated can delete news files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'news-files');
