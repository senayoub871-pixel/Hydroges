import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { signJwt, generateSalt, hashPassword, verifyPassword } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const {
      loginId,
      password,
      name,
      email,
      department,
      role,
      companyNumber,
      avatarInitials,
    } = req.body;

    if (!loginId || !password || !name || !email || !department) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    const existingLogin = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.loginId, loginId),
    });
    if (existingLogin) {
      res.status(409).json({ error: "Cet identifiant est déjà utilisé" });
      return;
    }

    const existingEmail = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (existingEmail) {
      res.status(409).json({ error: "Cette adresse email est déjà utilisée" });
      return;
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);

    const initials =
      avatarInitials ||
      name
        .split(" ")
        .map((n: string) => n[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);

    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        department,
        role: role || "Employé",
        companyNumber: companyNumber || "0125.6910.0681",
        loginId,
        passwordHash: hash,
        passwordSalt: salt,
        avatarInitials: initials,
      })
      .returning();

    const token = signJwt({
      userId: user.id,
      loginId: user.loginId!,
      name: user.name,
      role: user.role || "Employé",
      department: user.department,
      companyNumber: user.companyNumber || "0125.6910.0681",
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
        department: user.department,
        companyNumber: user.companyNumber,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to register user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { loginId, password, companyNumber } = req.body;

    if (!loginId || !password) {
      res.status(400).json({ error: "Identifiant ou mot de passe manquant" });
      return;
    }

    const user = await db.query.usersTable.findFirst({
      where: (u, { eq }) => eq(u.loginId, loginId),
    });

    if (!user || !user.passwordHash || !user.passwordSalt) {
      res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
      return;
    }

    if (
      companyNumber &&
      user.companyNumber &&
      user.companyNumber !== companyNumber
    ) {
      res.status(401).json({ error: "Numéro d'entreprise incorrect" });
      return;
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
      return;
    }

    const token = signJwt({
      userId: user.id,
      loginId: user.loginId!,
      name: user.name,
      role: user.role || "Employé",
      department: user.department,
      companyNumber: user.companyNumber || "0125.6910.0681",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
        department: user.department,
        companyNumber: user.companyNumber,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to login");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.currentUser });
});

export default router;
