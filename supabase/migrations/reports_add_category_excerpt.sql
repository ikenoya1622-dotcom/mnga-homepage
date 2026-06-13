-- =====================================================
-- reports に category / excerpt カラムを追加
--   - category: Reports 一覧のカテゴリチップ（Meetup / Project / Talk / Press）
--   - excerpt : カード／詳細リード文の抜粋（未入力なら本文から自動生成）
-- いずれも NULL 許容なので既存データ・既存の管理画面はそのまま動作する。
-- =====================================================

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS excerpt  text;

-- 一覧のカテゴリ絞り込み用インデックス
CREATE INDEX IF NOT EXISTS idx_reports_category_date
  ON reports (category, published_at DESC);
