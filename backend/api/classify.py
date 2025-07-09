from tensorflow.keras.preprocessing import image
import numpy as np
import os
import joblib
from tensorflow.keras.models import load_model

model_path = r'D:/Civiclink/backend/api/model.h5'
labels_path = r'D:/Civiclink/backend/api/class_labels.pkl'

# ✅ Load Model
if os.path.exists(model_path):
    model = load_model(model_path)
    print(f"[DL] ✅ Model loaded from {model_path}")
else:
    print(f"[DL] ❌ Model not found")
    model = None

# ✅ Load Class Labels
if os.path.exists(labels_path):
    class_labels = joblib.load(open(labels_path, 'rb'))
    print(f"[DL] ✅ Loaded class labels: {class_labels}")
else:
    class_labels = ['electricity', 'garbage', 'other', 'road', 'water']  # fallback
    print("[DL] ⚠️ Using hardcoded class labels.")

def classify_issue_image(img_path):
    if model is None:
        print("[DL] ❌ Model not loaded. Returning default category.")
        return "other", 0.0

    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)[0]
        predicted_index = np.argmax(predictions)
        predicted_class = class_labels[predicted_index]
        confidence = float(predictions[predicted_index])

        print(f"[DL] ✅ Prediction: {predicted_class} ({confidence*100:.2f}% confidence)")
        return predicted_class, confidence

    except Exception as e:
        print(f"[DL] ❌ Error classifying image: {e}")
        return "other", 0.0
