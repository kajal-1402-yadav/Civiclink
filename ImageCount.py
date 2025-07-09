import os

base_dir = "dataset/scraped-images-bs4"

total_count = 0
category_counts = {}

for category in os.listdir(base_dir):
    category_path = os.path.join(base_dir, category)
    if os.path.isdir(category_path):
        num_images = len([f for f in os.listdir(category_path) if f.endswith((".jpg", ".png", ".jpeg"))])
        category_counts[category] = num_images
        total_count += num_images

print("\n📊 Image Count Per Category:")
for cat, count in category_counts.items():
    print(f"{cat}: {count} images")

print(f"\n✅ Total images in dataset: {total_count}")
