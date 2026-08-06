import csv
import json
from pathlib import Path

TEAM_CSV = Path(r"c:\Users\kazbr\projects\inceptia\src\data\team.csv")
TEAM_JSON = Path(r"c:\Users\kazbr\projects\inceptia\src\data\team.json")

AVATARS = [
    "/profiles_char/harry.png",
    "/profiles_char/hermoine.png",
    "/profiles_char/ron.png",
    "/profiles_char/sirius.png",
    "/profiles_char/snape.png",
    "/profiles_char/voldemort.png"
]

TEAM_NAME_MAP = {
    "web develompent": "Web Development",
    "web development": "Web Development",
    "social media": "Social Media",
    "epm": "EPM",
    "design": "Design",
    "technical team": "Technical Team",
    "marketing and sponsorship": "Marketing and Sponsorship",
    "documentation": "Documentation",
    "finance": "Finance"
}

def generate_token(name: str) -> str:
    parts = name.strip().split()
    if len(parts) == 1:
        return f"{parts[0].capitalize()}."
    first = parts[0].capitalize()
    last_initial = parts[-1][0].upper()
    return f"{first}{last_initial}."

def main():
    if not TEAM_CSV.exists():
        print(f"CSV file not found: {TEAM_CSV}")
        return

    teams_dict = {}
    tokens_seen = set()
    avatar_idx = 0

    with open(TEAM_CSV, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            clean_row = {k.strip(): v.strip() for k, v in row.items() if k}
            raw_team = clean_row.get("Team Name", "").strip()
            name = clean_row.get("Name", "").strip()
            mail = clean_row.get("Email", "").strip().lower()

            if not name or not mail:
                continue

            normalized_team = TEAM_NAME_MAP.get(raw_team.lower(), raw_team.title())
            
            token = generate_token(name)
            if token in tokens_seen:
                # Handle collisions if any
                parts = name.strip().split()
                if len(parts) >= 2:
                    token = f"{parts[0].capitalize()}{parts[1][:2].capitalize()}."
                else:
                    token = f"{parts[0].capitalize()}1."
            tokens_seen.add(token)

            avatar = AVATARS[avatar_idx % len(AVATARS)]
            avatar_idx += 1

            member_data = {
                "name": name,
                "mail": mail,
                "password": "Sammy",
                "token": token,
                "position": "Member",
                "counter": 0,
                "avatar": avatar
            }

            if normalized_team not in teams_dict:
                teams_dict[normalized_team] = []
            teams_dict[normalized_team].append(member_data)

    output = {"teams": []}
    for team_name, members in teams_dict.items():
        output["teams"].append({
            "name": team_name,
            "domain": team_name,
            "team": members
        })

    with open(TEAM_JSON, mode="w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"Successfully generated {TEAM_JSON} with {sum(len(t['team']) for t in output['teams'])} members across {len(output['teams'])} teams.")

if __name__ == "__main__":
    main()
