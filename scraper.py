import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import time

categories = {
    "road": ["pothole on road", "damaged road surface", "road damage"],
    "garbage": ["street garbage", "garbage dump on road", "overflowing garbage on street"],
    "water": ["water leakage on street", "pipe leakage road", "water overflow street"],
    "electricity": ["damaged street light pole", "broken electric pole", "fallen electricity pole road"],
    "other": ["civic infrastructure damage", "public infrastructure issue", "city infrastructure problem"]
}

output_dir = os.path.join("dataset", "scraped-images-bs4")
os.makedirs(output_dir, exist_ok=True)

def scrape_bing_images(query, folder, start_count, max_images=50):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    count = 0
    page = 0

    while count < max_images and page < 5:
        start = page * 35
        search_url = f"https://www.bing.com/images/search?q={quote(query)}&first={start}&FORM=HDRSC2"
        print(f"🔎 Fetching: {search_url}")

        try:
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.text, "html.parser")
            image_tags = soup.find_all("img")

            for img in image_tags:
                if count >= max_images:
                    break
                img_url = img.get("src") or img.get("data-src")
                if img_url and img_url.startswith("http"):
                    try:
                        img_resp = requests.get(img_url, timeout=5)
                        if len(img_resp.content) < 5000:
                            continue
                        filename = os.path.join(folder, f"{start_count + count}.jpg")
                        with open(filename, "wb") as f:
                            f.write(img_resp.content)
                        print(f"✅ Saved: {filename}")
                        count += 1
                    except Exception as e:
                        print(f"❌ Error downloading image: {e}")

        except Exception as e:
            print(f"❌ Error fetching page: {e}")

        page += 1
        time.sleep(1)

    print(f"✅ Finished '{query}' with {count} images\n")
    return count

if __name__ == "__main__":
    for category, query_list in categories.items():
        category_folder = os.path.join(output_dir, category)
        os.makedirs(category_folder, exist_ok=True)

        current_image_count = len(os.listdir(category_folder))
        print(f"\n🎯 Category: {category} | Starting from image: {current_image_count}")

        for q in query_list:
            downloaded = scrape_bing_images(q, category_folder, start_count=current_image_count, max_images=50)
            current_image_count += downloaded

    print("\n🎉 BS4 Bing Scraping Complete!")
