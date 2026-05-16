# Fix Double Email - 1 seul template frontend

**Problème :** 2 emails = Frontend template + Backend hardcoded

**Files:**
1. backend/alerts/services.py (read → remove send_mail direct)
2. Test : 1 seul email frontend template

**Steps:**
- [x] 1. read_file backend/alerts/services.py ✅

- [x] 2. Edit: supprimer _send_alert_email_to_recipients() ✅

- [x] 3. Test: créer notification → 1 seul email ✅

