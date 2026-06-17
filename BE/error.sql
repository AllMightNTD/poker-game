026_05_25_11_52_42-postgres.sql 
[sudo] password for dev_ntd: 
could not change directory to "/home/dev_ntd/Know_Block/Know_Ledge_Block/BE": Permission denied
SET
SET
SET
SET
SET
 set_config 
------------
 
(1 row)

SET
SET
SET
SET
SET
ERROR:  schema "catalog_history" already exists
COMMENT
ERROR:  schema "point_dev_test" already exists
ERROR:  schema "point_performance" already exists
SET
ERROR:  relation "glue_user_info" already exists
ERROR:  relation "aml_same_email_prefix_daily_detection_jst" already exists
ERROR:  relation "aml_same_email_prefix_daily_detection_user" already exists
ERROR:  function default_identity(integer, integer, text) does not exist
LINE 2:     id bigint DEFAULT default_identity(478955, 0, ('1,1'::ch...
                              ^
HINT:  No function matches the given name and argument types. You might need to add explicit type casts.
CREATE TABLE
ERROR:  relation "pos_trade" already exists
ERROR:  relation "waf_blocked_access" already exists
ERROR:  relation "point_pos_order" already exists
ERROR:  column "id" of relation "point_pos_order" does not exist
ERROR:  column "symbol_id" of relation "point_pos_order" does not exist
ERROR:  column "user_id" of relation "point_pos_order" does not exist
ERROR:  column "order_side" of relation "point_pos_order" does not exist
ERROR:  column "order_type" of relation "point_pos_order" does not exist
ERROR:  column "order_channel" of relation "point_pos_order" does not exist
ERROR:  column "mm_price" of relation "point_pos_order" does not exist
ERROR:  column "amount" of relation "point_pos_order" does not exist
ERROR:  column "remaining_amount" of relation "point_pos_order" does not exist
ERROR:  column "order_status" of relation "point_pos_order" does not exist
ERROR:  column "order_operator" of relation "point_pos_order" does not exist
ERROR:  column "created_at" of relation "point_pos_order" does not exist
ERROR:  column "request_quote_asset" of relation "point_pos_order" does not exist
ERROR:  column "used_quote_asset" of relation "point_pos_order" does not exist
ERROR:  column "request_point_asset" of relation "point_pos_order" does not exist
ERROR:  column "used_point_asset" of relation "point_pos_order" does not exist
CREATE TABLE
ERROR:  column "id" of relation "point_pos_trade" does not exist
ERROR:  column "symbol_id" of relation "point_pos_trade" does not exist
ERROR:  column "user_id" of relation "point_pos_trade" does not exist
ERROR:  column "order_side" of relation "point_pos_trade" does not exist
ERROR:  column "order_type" of relation "point_pos_trade" does not exist
ERROR:  column "order_channel" of relation "point_pos_trade" does not exist
ERROR:  column "price" of relation "point_pos_trade" does not exist
ERROR:  column "amount" of relation "point_pos_trade" does not exist
ERROR:  column "jpy_conversion" of relation "point_pos_trade" does not exist
ERROR:  column "trade_action" of relation "point_pos_trade" does not exist
ERROR:  column "order_id" of relation "point_pos_trade" does not exist
ERROR:  column "fee" of relation "point_pos_trade" does not exist
ERROR:  column "asset_amount" of relation "point_pos_trade" does not exist
ERROR:  column "created_at" of relation "point_pos_trade" does not exist
ERROR:  column "request_quote_asset" of relation "point_pos_trade" does not exist
ERROR:  column "used_quote_asset" of relation "point_pos_trade" does not exist
ERROR:  column "request_point_asset" of relation "point_pos_trade" does not exist
ERROR:  column "used_point_asset" of relation "point_pos_trade" does not exist
CREATE TABLE
ERROR:  column "id" of relation "pos_best_price" does not exist
ERROR:  column "symbol_id" of relation "pos_best_price" does not exist
ERROR:  column "best_ask" of relation "pos_best_price" does not exist
ERROR:  column "best_bid" of relation "pos_best_price" does not exist
ERROR:  column "created_at" of relation "pos_best_price" does not exist
CREATE TABLE
ERROR:  column "id" of relation "pos_order" does not exist
ERROR:  column "symbol_id" of relation "pos_order" does not exist
ERROR:  column "user_id" of relation "pos_order" does not exist
ERROR:  column "order_side" of relation "pos_order" does not exist
ERROR:  column "order_type" of relation "pos_order" does not exist
ERROR:  column "order_channel" of relation "pos_order" does not exist
ERROR:  column "mm_price" of relation "pos_order" does not exist
ERROR:  column "amount" of relation "pos_order" does not exist
ERROR:  column "remaining_amount" of relation "pos_order" does not exist
ERROR:  column "order_status" of relation "pos_order" does not exist
ERROR:  column "order_operator" of relation "pos_order" does not exist
ERROR:  column "created_at" of relation "pos_order" does not exist
CREATE TABLE
ERROR:  column "id" of relation "pos_trade" does not exist
ERROR:  column "symbol_id" of relation "pos_trade" does not exist
ERROR:  column "user_id" of relation "pos_trade" does not exist
ERROR:  column "order_side" of relation "pos_trade" does not exist
ERROR:  column "order_type" of relation "pos_trade" does not exist
ERROR:  column "order_channel" of relation "pos_trade" does not exist
ERROR:  column "price" of relation "pos_trade" does not exist
ERROR:  column "amount" of relation "pos_trade" does not exist
ERROR:  column "jpy_conversion" of relation "pos_trade" does not exist
ERROR:  column "trade_action" of relation "pos_trade" does not exist
ERROR:  column "order_id" of relation "pos_trade" does not exist
ERROR:  column "fee" of relation "pos_trade" does not exist
ERROR:  column "asset_amount" of relation "pos_trade" does not exist
ERROR:  column "created_at" of relation "pos_trade" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_best_price_ada_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_best_price_ada_jpy" does not exist
ERROR:  column "best_ask" of relation "spot_best_price_ada_jpy" does not exist
ERROR:  column "best_bid" of relation "spot_best_price_ada_jpy" does not exist
ERROR:  column "created_at" of relation "spot_best_price_ada_jpy" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_best_price_amber_ada_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_best_price_amber_ada_jpy" does not exist
ERROR:  column "best_ask" of relation "spot_best_price_amber_ada_jpy" does not exist
ERROR:  column "best_bid" of relation "spot_best_price_amber_ada_jpy" does not exist
ERROR:  column "created_at" of relation "spot_best_price_amber_ada_jpy" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_best_price_nidt_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_best_price_nidt_jpy" does not exist
ERROR:  column "best_ask" of relation "spot_best_price_nidt_jpy" does not exist
ERROR:  column "best_bid" of relation "spot_best_price_nidt_jpy" does not exist
ERROR:  column "created_at" of relation "spot_best_price_nidt_jpy" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "user_id" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "order_side" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "order_type" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "order_channel" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "average_price" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "amount" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "remaining_amount" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "order_status" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "order_operator" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "post_only" of relation "spot_order_ada_jpy" does not exist
ERROR:  column "created_at" of relation "spot_order_ada_jpy" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "user_id" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "order_side" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "order_type" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "order_channel" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "average_price" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "amount" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "remaining_amount" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "order_status" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "order_operator" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "post_only" of relation "spot_order_nidt_jpy" does not exist
ERROR:  column "created_at" of relation "spot_order_nidt_jpy" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "user_id" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "order_side" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "order_type" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "order_channel" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "price" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "amount" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "jpy_conversion" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "trade_action" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "order_id" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "fee" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "target_order_id" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "target_user_id" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "asset_amount" of relation "spot_trade_ada_jpy" does not exist
ERROR:  column "created_at" of relation "spot_trade_ada_jpy" does not exist
CREATE TABLE
ERROR:  column "id" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "symbol_id" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "user_id" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "order_side" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "order_type" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "order_channel" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "price" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "amount" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "jpy_conversion" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "trade_action" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "order_id" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "fee" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "target_order_id" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "target_user_id" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "asset_amount" of relation "spot_trade_nidt_jpy" does not exist
ERROR:  column "created_at" of relation "spot_trade_nidt_jpy" does not exist
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE VIEW
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE VIEW
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
ERROR:  function default_identity(integer, integer, text) does not exist
LINE 2:     id bigint DEFAULT default_identity(304682, 0, '1,1'::tex...
                              ^
HINT:  No function matches the given name and argument types. You might need to add explicit type casts.
ERROR:  relation "pos_order" already exists
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
COPY 0
