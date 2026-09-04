SELECT
    p.ref                          AS reference,
    p.label                        AS nom,
    p.price                        AS prix_vente_ht,
    p.price_ttc                    AS prix_vente_ttc,
    td.label                       AS domaine,
    ta.label                       AS type_activite,
    COALESCE(r.nb_inscrits, 0)     AS nb_inscrits_saison4,
    COALESCE(r.montant_total, 0)   AS montant_total_saison4
FROM llx_product AS p
LEFT JOIN llx_product_extrafields AS pe ON pe.fk_object = p.rowid
LEFT JOIN llx_c_typedomain        AS td ON td.rowid = pe.type_domaine
LEFT JOIN llx_c_typeactivity      AS ta ON ta.rowid = pe.type_activite
LEFT JOIN (
    SELECT
        fd.fk_product,
        COUNT(fd.rowid)   AS nb_inscrits,      -- 1 ligne de facture = 1 inscription
        SUM(fd.total_ttc) AS montant_total
    FROM llx_facturedet AS fd
    INNER JOIN llx_facture            AS f  ON f.rowid  = fd.fk_facture
    INNER JOIN llx_facture_extrafields AS fe ON fe.fk_object = f.rowid
    WHERE fe.inv_culturalseason = 4
      AND f.entity IN (1)
      AND f.fk_statut > 0                      -- exclut les brouillons
    GROUP BY fd.fk_product
) AS r ON r.fk_product = p.rowid
WHERE p.fk_product_type = 1
  AND p.entity IN (1)
ORDER BY p.ref;