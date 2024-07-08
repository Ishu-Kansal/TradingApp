DELETE FROM public."Orders" WHERE id NOT IN (SELECT id FROM public."Orders" ORDER BY id ASC LIMIT 10);
UPDATE public."Orders" SET status = 0, quantity_sat = 0;
ALTER SEQUENCE "Orders_id_seq" RESTART WITH 11;
SELECT * FROM public."Orders" ORDER BY id ASC