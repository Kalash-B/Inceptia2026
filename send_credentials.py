#!/usr/bin/env python3
"""
send_credentials.py
-------------------
Reads team member data from team.csv and sends each member a
personalised HTML credential email via Gmail SMTP.

SETUP (one-time):
  1. Enable 2-Step Verification on your Google account.
  2. Go to https://myaccount.google.com/apppasswords
     and generate an App Password for "Mail".
  3. Paste the 16-character app password into APP_PASSWORD below.
  4. Set SITE_URL to your deployed domain.
  5. Run:           python send_credentials.py
     Dry-run only:  python send_credentials.py --dry-run
"""

import csv
import json
import smtplib
import sys
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

# ---------------------------------------------------------------------------
# CONFIGURE THESE BEFORE RUNNING
# ---------------------------------------------------------------------------
SENDER_EMAIL  = "inceptia2025@gmail.com"
APP_PASSWORD  = "rfaiyebbtnneiiuz"   # Google App Password
SITE_URL      = "https://inceptiaitsa.com"       # Change to live URL
SKIP_TEAMS    = {}                   # Test/placeholder teams to skip
SEND_DELAY_S  = 1.5                                 # Delay between sends (s)
# ---------------------------------------------------------------------------

TEAM_CSV  = Path(__file__).parent / "src" / "data" / "team.csv"
TEAM_JSON = Path(__file__).parent / "src" / "data" / "team.json"


def build_html(member: dict, team_name: str, domain: str) -> str:
    login_url = f"{SITE_URL}/login"
    dash_url  = f"{SITE_URL}/dashboard"
    logo_url  = f"{SITE_URL}/inceptia_logo.webp"
    hero_url  = f"{SITE_URL}/hero-bg.webp"
    name      = member["name"]
    mail      = member["mail"]
    password  = member["password"]
    position  = member.get("position", "Member")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Inceptia 2026 &#8212; Your Login Credentials</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Segoe UI',Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#111118;
                    border:1px solid rgba(255,215,0,0.25);
                    border-radius:20px;overflow:hidden;
                    box-shadow:0 0 100px rgba(255,215,0,0.1),0 0 0 1px rgba(255,215,0,0.06);">

        <!-- ============ HERO HEADER ============ -->
        <tr>
          <td style="padding:0;margin:0;">
            <!--[if mso]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"
                    style="width:600px;height:260px;">
              <v:fill type="tile" src="{hero_url}" color="#0e0c00"/>
              <v:textbox inset="0,0,0,0">
            <![endif]-->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#0e0c00;
                           background-image:url('{hero_url}');
                           background-size:cover;background-position:center top;">
                  <!-- Overlay -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:linear-gradient(170deg,
                                    rgba(10,8,0,0.90) 0%,
                                    rgba(12,10,2,0.85) 50%,
                                    rgba(10,10,14,0.92) 100%);
                                 padding:52px 40px 44px;text-align:center;
                                 border-bottom:2px solid rgba(255,215,0,0.20);">

                        <!-- Logo -->
                        <img src="{logo_url}" alt="Inceptia Logo" width="62" height="62"
                             style="display:block;margin:0 auto 20px;border-radius:50%;
                                    border:2px solid rgba(255,215,0,0.5);
                                    box-shadow:0 0 0 4px rgba(255,215,0,0.08),
                                               0 0 28px rgba(255,215,0,0.4);"/>

                        <!-- Eyebrow -->
                        <p style="margin:0 0 6px;font-size:10px;letter-spacing:6px;
                                   text-transform:uppercase;color:rgba(255,215,0,0.55);
                                   font-weight:700;">
                          WELCOME TO
                        </p>

                        <!-- INCEPTIA wordmark -->
                        <h1 style="margin:0;font-size:52px;font-weight:900;
                                    letter-spacing:6px;text-transform:uppercase;
                                    color:#ffd700;
                                    text-shadow:0 0 30px rgba(255,215,0,0.7),
                                                0 0 60px rgba(255,215,0,0.35),
                                                0 2px 4px rgba(0,0,0,0.8);">
                          <strong>INCEPTIA</strong>
                        </h1>

                        <!-- Year badge -->
                        <p style="margin:6px 0 18px;font-size:13px;letter-spacing:5px;
                                   text-transform:uppercase;font-weight:700;
                                   color:rgba(255,215,0,0.40);">
                          2&thinsp;0&thinsp;2&thinsp;6
                        </p>

                        <!-- Gold rule -->
                        <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                          <tr>
                            <td style="width:50px;height:1px;
                                       background:linear-gradient(90deg,transparent,#d97706);"></td>
                            <td style="width:10px;height:10px;
                                       background:radial-gradient(circle,#ffd700,#d97706);
                                       border-radius:50%;
                                       box-shadow:0 0 10px #ffd700;
                                       margin:0 8px;"></td>
                            <td style="width:50px;height:1px;
                                       background:linear-gradient(90deg,#d97706,transparent);"></td>
                          </tr>
                        </table>

                        <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;
                                    color:#ffffff;letter-spacing:1px;">
                          Your Access Credentials
                        </h2>
                        <p style="margin:0;font-size:13px;color:#a3a3a3;">
                          Hello, <strong style="color:#ffe566;">{name}</strong> &#8212; your portal is ready!
                        </p>

                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!--[if mso]>
              </v:textbox>
            </v:rect>
            <![endif]-->
          </td>
        </tr>

        <!-- ============ BODY ============ -->
        <tr>
          <td style="padding:38px 40px;">

            <!-- Intro text -->
            <p style="margin:0 0 26px;font-size:14px;line-height:1.85;color:#c0c0c0;">
              You have been officially registered for 
              <strong style="color:#ffd700;font-weight:900;">INCEPTIA 2026</strong>.
              Use the credentials below to access your participant portal.
            </p>

            <!-- ── Credentials Card ── -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:linear-gradient(150deg,#0f0900 0%,#08080f 100%);
                          border:1px solid rgba(255,215,0,0.25);
                          border-radius:14px;overflow:hidden;margin:0 0 30px;
                          box-shadow:inset 0 1px 0 rgba(255,215,0,0.1),
                                     0 8px 40px rgba(0,0,0,0.5);">

              <!-- Card header bar -->
              <tr>
                <td style="padding:13px 24px;
                           background:linear-gradient(90deg,
                             rgba(255,215,0,0.14) 0%,
                             rgba(255,215,0,0.04) 100%);
                           border-bottom:1px solid rgba(255,215,0,0.18);">
                  <p style="margin:0;font-size:9px;letter-spacing:4px;
                             text-transform:uppercase;color:#ffd700;font-weight:800;">
                    Login Credentials
                  </p>
                </td>
              </tr>

              <!-- Email -->
              <tr>
                <td style="padding:20px 24px;
                           border-bottom:1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0 0 5px;font-size:9px;letter-spacing:3px;
                             text-transform:uppercase;color:#555;">
                    Email / Login ID
                  </p>
                  <p style="margin:0;font-size:15px;font-family:'Courier New',monospace;
                             color:#ffe566;font-weight:700;word-break:break-all;">
                    {mail}
                  </p>
                </td>
              </tr>

              <!-- Password -->
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 5px;font-size:9px;letter-spacing:3px;
                             text-transform:uppercase;color:#555;">
                    Password
                  </p>
                  <p style="margin:0;font-size:22px;font-family:'Courier New',monospace;
                             color:#ffd700;font-weight:900;letter-spacing:4px;
                             text-shadow:0 0 12px rgba(255,215,0,0.35);">
                    {password}
                  </p>
                </td>
              </tr>
            </table>
            <!-- ── End Credentials Card ── -->

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:0 0 30px;">
                  <a href="{login_url}"
                     style="display:inline-block;padding:17px 54px;
                            background:linear-gradient(135deg,#ffd700 0%,#d4af37 50%,#b8860b 100%);
                            color:#131313;font-size:12px;font-weight:900;
                            letter-spacing:3px;text-transform:uppercase;
                            text-decoration:none;border-radius:50px;
                            border:1px solid rgba(255,215,0,0.9);
                            text-shadow:0 1px 1px rgba(255,255,255,0.4);
                            box-shadow:0 0 20px rgba(255,215,0,0.5),
                                       0 0 40px rgba(255,215,0,0.25);">
                    Log In to Portal &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <!-- Info note -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:rgba(255,215,0,0.03);
                          border:1px solid rgba(255,215,0,0.10);
                          border-left:3px solid #d97706;
                          border-radius:0 10px 10px 0;
                          margin:0 0 26px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:13px;color:#d4d4d4;line-height:1.75;">
                    After logging in you will be taken to your personal dashboard where you
                    can find your <strong style="color:#ffe566;">QR pass</strong> for food
                    counters and track your meal claims during the event.
                  </p>
                  <p style="margin:0;font-size:12px;color:#666;">
                    Dashboard:&nbsp;
                    <a href="{dash_url}" style="color:#f59e0b;text-decoration:none;
                                                font-weight:600;">{dash_url}</a>
                  </p>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 20px;"/>

            <p style="margin:0;font-size:11px;color:#404040;line-height:1.8;text-align:center;">
              Keep these credentials safe and do not share them with others.<br/>
              If you have trouble logging in, please contact the event organisers.
            </p>
          </td>
        </tr>

        <!-- ============ FOOTER ============ -->
        <tr>
          <td style="background:linear-gradient(90deg,#090700,#0d0d0d,#090700);
                     padding:24px 40px;text-align:center;
                     border-top:1px solid rgba(255,215,0,0.12);">
            <p style="margin:0 0 6px;font-size:14px;font-weight:900;
                      letter-spacing:4px;text-transform:uppercase;
                      color:#ffd700;
                      text-shadow:0 0 14px rgba(255,215,0,0.4);">
              <strong>INCEPTIA</strong> 2026
            </p>
            <p style="margin:0;font-size:10px;color:#333;letter-spacing:1px;">
              Automated credential mailer &bull; Please do not reply to this email
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def build_plain(member: dict, team_name: str, domain: str) -> str:
    login_url = f"{SITE_URL}/login"
    dash_url  = f"{SITE_URL}/dashboard"
    return (
        f"Hello {member['name']},\n\n"
        f"Welcome to Inceptia 2026!\n\n"
        f"You are registered as {member.get('position', 'Member')} of team "
        f"'{team_name}' in the {domain} domain.\n\n"
        f"--- YOUR LOGIN CREDENTIALS ---\n"
        f"Email   : {member['mail']}\n"
        f"Password: {member['password']}\n\n"
        f"Login here: {login_url}\n\n"
        f"After logging in, visit your dashboard to find your QR pass:\n"
        f"{dash_url}\n\n"
        f"Keep these credentials safe.\n\n"
        f"Inceptia 2026 Team"
    )


def send_mail(smtp: smtplib.SMTP_SSL, member: dict, team_name: str, domain: str) -> None:
    first_name = member["name"].split()[0]
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Inceptia 2026 \u2014 Your Login Credentials, {first_name}!"
    msg["From"]    = f"Inceptia 2026 <{SENDER_EMAIL}>"
    msg["To"]      = member["mail"]

    msg.attach(MIMEText(build_plain(member, team_name, domain), "plain"))
    msg.attach(MIMEText(build_html(member, team_name, domain),  "html"))

    smtp.sendmail(SENDER_EMAIL, member["mail"], msg.as_string())


def main(dry_run: bool = False) -> None:
    recipients: list = []

    if TEAM_JSON.exists():
        print(f"Loading recipients from JSON: {TEAM_JSON}")
        with open(TEAM_JSON, encoding="utf-8") as f:
            data = json.load(f)
        for team in data.get("teams", []):
            team_name = team.get("name", "Unknown")
            domain    = team.get("domain", "Unknown")
            if team_name in SKIP_TEAMS:
                print(f"[SKIP ] Team '{team_name}' is in SKIP_TEAMS — skipping.")
                continue
            for member in team.get("team", []):
                recipients.append((member, team_name, domain))
    elif TEAM_CSV.exists():
        print(f"Loading recipients from CSV: {TEAM_CSV}")
        with open(TEAM_CSV, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                clean_row = {k.strip(): v.strip() for k, v in row.items() if k}
                team_name = clean_row.get("Team Name", "Unknown")
                name = clean_row.get("Name", "")
                mail = clean_row.get("Email", "")

                if not mail:
                    continue

                if team_name in SKIP_TEAMS:
                    print(f"[SKIP ] Team '{team_name}' is in SKIP_TEAMS — skipping.")
                    continue

                member = {
                    "name": name,
                    "mail": mail,
                    "password": "Sammy",
                    "position": "Member",
                }
                recipients.append((member, team_name, team_name))
    else:
        print("[ERROR] Neither team.json nor team.csv was found.")
        sys.exit(1)

    total = len(recipients)
    if total == 0:
        print("[ERROR] No valid recipients found in team.csv")
        sys.exit(1)
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Ready to send to {total} recipients.\n")

    if dry_run:
        for i, (member, team_name, domain) in enumerate(recipients, 1):
            print(f"  [{i:>3}/{total}] {member['mail']:<48} {member['name']} ({team_name})")
        print(f"\n[DRY RUN] No emails sent. Remove --dry-run to send for real.")
        return

    if APP_PASSWORD == "YOUR_16_CHAR_APP_PASSWORD_HERE":
        print("[ERROR] Set APP_PASSWORD in send_credentials.py before running for real.")
        sys.exit(1)

    sent   = 0
    failed = []

    print("Connecting to Gmail SMTP (smtp.gmail.com:465)...")
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SENDER_EMAIL, APP_PASSWORD)
            print(f"Authenticated as {SENDER_EMAIL}\n")

            for i, (member, team_name, domain) in enumerate(recipients, 1):
                try:
                    send_mail(smtp, member, team_name, domain)
                    print(f"  [OK   {i:>3}/{total}] \u2192 {member['mail']:<48} ({member['name']})")
                    sent += 1
                except Exception as e:
                    print(f"  [FAIL {i:>3}/{total}] \u2192 {member['mail']:<48} | {e}")
                    failed.append((member["mail"], str(e)))

                if i < total:
                    time.sleep(SEND_DELAY_S)

    except smtplib.SMTPAuthenticationError:
        print("\n[ERROR] Gmail authentication failed.")
        print("  - Use an App Password, not your account password.")
        print("  - Generate one at: https://myaccount.google.com/apppasswords")
        sys.exit(1)

    print(f"\n{'=' * 62}")
    print(f"  Sent: {sent}/{total}    Failed: {len(failed)}")
    if failed:
        print("\n  Failed recipients:")
        for addr, reason in failed:
            print(f"    {addr}  \u2014  {reason}")


if __name__ == "__main__":
    main(dry_run="--dry-run" in sys.argv)
