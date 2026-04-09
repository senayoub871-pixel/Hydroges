import { Router, type IRouter } from "express";
import pg from "pg";
import { requireAuth } from "../middlewares/auth";

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

function getPool() {
  if (!pool) {
    const url = process.env["EXTERNAL_DB_URL"];
    if (!url) throw new Error("EXTERNAL_DB_URL not configured");
    pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

const router: IRouter = Router();

// GET /api/external/complaints
router.get("/complaints", requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query(
      `SELECT id, first_name, last_name, wilaya, commune, complaint_text, tracking_number, status, created_at, updated_at
       FROM complaints ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch complaints");
    res.status(500).json({ error: "Impossible de récupérer les réclamations" });
  }
});

// PATCH /api/external/complaints/:id/status
router.patch("/complaints/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const allowed = ["pending", "in_progress", "resolved", "rejected"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Statut invalide" });
      return;
    }
    const { rows } = await getPool().query(
      `UPDATE complaints SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`,
      [status, id]
    );
    if (!rows.length) { res.status(404).json({ error: "Réclamation introuvable" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update complaint status");
    res.status(500).json({ error: "Impossible de mettre à jour le statut" });
  }
});

// GET /api/external/marches  (project_offers + submissions)
router.get("/marches", requireAuth, async (req, res) => {
  try {
    const { rows: offers } = await getPool().query(
      `SELECT * FROM project_offers ORDER BY created_at DESC`
    );
    const { rows: submissions } = await getPool().query(
      `SELECT os.*, po.title AS offer_title
       FROM offer_submissions os
       JOIN project_offers po ON po.id = os.offer_id
       ORDER BY os.created_at DESC`
    );
    res.json({ offers, submissions });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch marchés");
    res.status(500).json({ error: "Impossible de récupérer les marchés" });
  }
});

// PATCH /api/external/marches/submissions/:id/status
router.patch("/marches/submissions/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const allowed = ["pending", "accepted", "rejected", "under_review"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Statut invalide" });
      return;
    }
    const { rows } = await getPool().query(
      `UPDATE offer_submissions SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`,
      [status, id]
    );
    if (!rows.length) { res.status(404).json({ error: "Soumission introuvable" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to update submission status");
    res.status(500).json({ error: "Impossible de mettre à jour le statut" });
  }
});

export default router;
