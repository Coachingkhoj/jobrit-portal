import os
import feedparser
from supabase import create_client, Client
import re

SUPABASE_URL = "https://fksiepwvbygkcojvjyzy.supabase.co"
# Pehle GitHub Secret check karega, agar na mile toh direct key use karega
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or "sb_secret_y9qzQXHsXJyIlde69qBdSg_qTGqxDXj"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

RSS_FEEDS = [
    "https://remotive.com/remote-jobs/feed",
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss"
]

def clean_html(raw_html):
    cleanr = re.compile('<.*?>')
    return re.sub(cleanr, '', raw_html)

def run_auto_job_fetcher():
    print("🚀 Starting Automated Job Fetcher...")
    total_added = 0
    
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:8]:
                title = entry.get('title', 'Engineering / Remote Position')
                company = entry.get('author', 'Global Tech Corp')
                link = entry.get('link', '#')
                raw_desc = entry.get('summary', 'High-impact global remote role.')
                clean_desc = clean_html(raw_desc)[:350] + "..."
                
                existing = supabase.table('jobs').select('id').eq('title', title).execute()
                
                if not existing.data:
                    job_data = {
                        "title": title,
                        "company": company,
                        "location": "Worldwide Remote",
                        "type": "Full-Time",
                        "description": f"{clean_desc}\n\n[Apply Directly on Source]: {link}"
                    }
                    supabase.table('jobs').insert([job_data]).execute()
                    total_added += 1
                    print(f"  + Added: {title} @ {company}")
        except Exception as e:
            print(f"Error fetching feed {feed_url}: {e}")

    print(f"\n🎉 Added {total_added} new live jobs to Supabase.")

if __name__ == "__main__":
    run_auto_job_fetcher()
