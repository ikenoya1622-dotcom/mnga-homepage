-- =====================================================
-- news_items に content カラム追加（お知らせ詳細ページ用）
-- =====================================================

ALTER TABLE news_items
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '[]'::jsonb;
