-- Preview: show current SKUs and what they'd become after stripping non-digits
SELECT id, sku, regexp_replace(sku, '\D', '', 'g') AS sku_numeric FROM "auction_items" ORDER BY id;
