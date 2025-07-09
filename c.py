import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

def scrape_images(query, folder, max_images=10, start_index=0):
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://www.bing.com/images/search?q={quote(query)}&form=HDRSC2"
    print(f"\n🔎 Fetching images for: '{query}'")

    try:
        response = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        images = soup.find_all("img")

        count = 0
        img_id = start_index

        for img in images:
            img_url = img.get("src") or img.get("data-src")
            if img_url and img_url.startswith("http"):
                try:
                    img_data = requests.get(img_url, timeout=5).content
                    file_path = os.path.join(folder, f"{img_id}.jpg")
                    with open(file_path, "wb") as f:
                        f.write(img_data)
                    print(f"✅ Saved: {file_path}")
                    count += 1
                    img_id += 1

                    if count >= max_images:
                        break
                except Exception as e:
                    print(f"❌ Error saving image: {e}")

        print(f"✅ Finished downloading {count} images for '{query}'\n")

    except Exception as e:
        print(f"❌ Error fetching Bing page for '{query}': {e}")

# ✅ Folder path (Other category)
output_folder = "D:/Civiclink/backend/dataset/scraped-images-bs4/other"
os.makedirs(output_folder, exist_ok=True)

# ✅ Keyword list for "other" category
keywords = [
    ("fallen tree on the ground", 119),
    ("illegal hoarding street", 129),
    ("construction waste on street", 139),
    ("parking blocking the road", 149),
    ("street vendor blocking footpath", 159),
]

# ✅ Scrape for each keyword
for keyword, start_idx in keywords:
    scrape_images(keyword, output_folder, max_images=10, start_index=start_idx)
