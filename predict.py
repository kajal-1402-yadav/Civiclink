import sys
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# ✅ Categories must match the training label order
categories = ['electricity', 'garbage', 'other', 'road', 'water']

# ✅ Load your trained model
model = load_model('civiclink_cnn_model.h5')

def predict_image(img_path):
    try:
        img = image.load_img(img_path, target_size=(150, 150))
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0  # ✅ Normalize just like during training
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array, verbose=0)
        predicted_class = categories[np.argmax(prediction)]
        confidence = np.max(prediction) * 100

        print(f"\n✅ Prediction: {predicted_class.upper()} ({confidence:.2f}% confidence)")

    except Exception as e:
        print(f"❌ Error loading or predicting image: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("\nUsage: python predict.py path/to/image.jpg")
    else:
        predict_image(sys.argv[1])
