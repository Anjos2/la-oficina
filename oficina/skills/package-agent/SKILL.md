---
name: package-agent
description: Packages an existing agent folder into a shareable file — verified, with everything private excluded, optionally encrypted with a password — so its owner can hand it out by any channel (email, WhatsApp, a drive) or publish it to a catalog. Use when the user wants to share, export, distribute or send an agent they built, or asks to "make a zip" of their agent. Responde en el idioma del usuario / works in the user's language.
---

# Skill: Package Agent (La Oficina)

You turn a finished agent folder into a **distributable package**: one file the owner can send by any channel they already use. No server involved — the file never leaves their machine unless *they* send it. This is the offline mirror of publishing to a catalog, and it produces the **same inner format**, so anything you package here can also be published to a catalog later, unchanged.

**Language rule (absolute)**: speak to the user in THEIR language at every step.

**Honesty rule (same as ADR-006)**: the password protects the file **in transit**. Whoever has the file AND the password gets the agent — and once installed, it is a folder of text files that works offline, forever, and can be copied onward. Never imply otherwise. The point is convenient, controlled hand-over — not copy protection.

## Phase 1 — Locate and identify

1. Ask for the **agent folder** to package.
2. Read its `AGENTS.md` to learn the agent's name; derive the **slug** from the folder name (lowercase, no spaces). Ask for a **version** for this package (propose `1.0.0`, or the next patch if the owner mentions an earlier one).
3. Confirm: name, slug, version, folder.

## Phase 2 — Pre-flight verification (never package a broken or leaky agent)

Run ALL of these against the folder. Any failure → stop, show exactly what failed, and do not package until the owner fixes it (offer to help fix):

- `AGENTS.md` exists, with **zero** residual placeholders (grep `{[A-Z_]+}` → 0 matches).
- `CLAUDE.md` is the intact 3-line pointer (starts with `@AGENTS.md`).
- `.agents/skills/` and `.claude/skills/` are **identical trees** (recursive diff). If they drifted, offer to re-mirror from `.agents/` (the canonical side) before packaging.
- Every skill has `SKILL.md` in **uppercase** with `name` + `description` frontmatter.
- Chapter count in `memoria/` matches `memoria/00-INDEX.md`.
- **Leak scan** — the folder must NOT carry: `.env` files, private keys (`*.key`, `*.pem`, `id_rsa*`, `id_ed25519*`), files named like credentials/secrets, or tokens embedded in text (grep for obvious patterns: `sk-`, `ghp_`, `AKIA`, `xoxb-`, `Bearer ` followed by long strings). A finding here is a **hard stop**: show the file and let the owner decide — remove it or abort. Never package a secret "because it is probably fine".

## Phase 3 — Decide what travels

**Included** (the standard anatomy): `AGENTS.md`, `CLAUDE.md`, `memoria/` (chapters + `00-INDEX` + `investigaciones/`), `.agents/skills/`, `.claude/skills/`, `research-seed.md`.

**Excluded always**: `.git/` (its history can carry the owner's internal paths and data), `.gitignore`, editor/OS junk (`.DS_Store`, `Thumbs.db`, `.vscode/`).

**Anything else** found in the folder (work directories like `piloto/`, drafts, client material): list it and ask the owner item by item — include or exclude. **Default to exclude**: work folders are where client data hides. The recipient needs the agent's identity and knowledge, not the owner's working papers.

The package does **not** carry the core protocol: the installer plugin provides it on the recipient's machine (one shared copy, always current).

## Phase 4 — Build the package

From the PARENT directory of the agent folder (so the archive has a single root folder):

```bash
tar czf <slug>-<version>.tar.gz --exclude='<folder>/.git' --exclude='<folder>/.gitignore' [more --exclude per Phase 3] <folder>
```

Compute and record: `sha256sum <slug>-<version>.tar.gz` and its size in bytes.

## Phase 5 — Encryption (recommended; the owner decides)

Explain the trade-off in one line: *"encrypted, the file is unreadable without the password — if the wrong person gets the file, they get nothing; unencrypted, anyone holding the file holds the agent."* Recommend encrypting for anything shared beyond the owner's own machines.

If the owner says yes:

1. **Generate a strong password** (offer this; people invent weak ones): `openssl rand -base64 18` → 24 characters. Or accept the owner's if they insist.
2. Encrypt with the **canonical command** (the installer decrypts with exactly these parameters — do not vary them):

```bash
openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -salt -in <slug>-<version>.tar.gz -out <slug>-<version>.tar.gz.enc -pass 'pass:<PASSWORD>'
```

3. **Verify the roundtrip before declaring anything done**: decrypt to a temp file, check its sha256 equals the inner package's sha256, delete the temp. An encryption you never test is a package you might never open.
4. Delete the plain `.tar.gz` if the owner only intends to share the encrypted one (ask; keeping both around invites sending the wrong file).
5. **Never write the password to any file.** It exists in the conversation and wherever the owner stores it — that is all.

If the owner declines encryption, the deliverable is the plain `.tar.gz` and you say plainly what that means (anyone with the file has the agent).

## Phase 6 — Hand-over instructions (the deliverable is TWO things: file + how to share it)

Give the owner a ready-to-copy message for their recipients, in the owner's language, containing:

- What it is: "<Name> v<version>, an agent for [Claude Code](https://claude.com/claude-code) or [Codex](https://developers.openai.com/codex)".
- How to install: *"install the La Oficina plugin (2 commands, see https://oficina.itelsystems.pe) and run `/oficina:install-agent` — point it at this file; it will ask you for the password."*
- The **sha256 of the inner package** (so the installer can verify integrity after decrypting).

And the security instructions for the owner, stated as rules, not suggestions:

1. **Send the file and the password by DIFFERENT channels** (file by email → password by WhatsApp or voice). If both travel together, interception of one channel yields everything.
2. The password unlocks **every copy** of this file, for anyone, forever. To rotate access for a new group, re-package with a new password (30 seconds).
3. Losing the password does not lose the agent — the owner still has the original folder and can re-package anytime.

## Hard rules of this skill

- Never package with a failing pre-flight check, and never skip the leak scan.
- Never write the password to disk, and never put it in the same hand-over message as the file path.
- Never claim the package can be remotely revoked or expires — an offline file cannot do either. For revocable access, the owner wants a catalog (that is the other distribution channel, with download codes).
- The canonical encryption parameters (`-aes-256-cbc -pbkdf2 -iter 600000 -salt`) are a **contract with the installer** — never "improve" them unilaterally: a package encrypted with different parameters will not open on the recipient's side.
