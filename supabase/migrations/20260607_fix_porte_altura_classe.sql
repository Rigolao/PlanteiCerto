-- Fix ID 7: altura_adulta_max_m is NULL in DB but static data shows 20m
UPDATE trees SET altura_adulta_max_m = 20 WHERE id = 7;

-- Recalculate porte_altura_classe for all trees with known height
-- Rule: Pequeno <8m, Médio 8-15m, Grande >15m
UPDATE trees
SET porte_altura_classe = CASE
  WHEN altura_adulta_max_m > 15 THEN 'Grande'
  WHEN altura_adulta_max_m >= 8  THEN 'Médio'
  ELSE 'Pequeno'
END
WHERE altura_adulta_max_m IS NOT NULL
  AND porte_altura_classe IS DISTINCT FROM CASE
    WHEN altura_adulta_max_m > 15 THEN 'Grande'
    WHEN altura_adulta_max_m >= 8  THEN 'Médio'
    ELSE 'Pequeno'
  END;
