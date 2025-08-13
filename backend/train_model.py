# import os
# import numpy as np
# import joblib
# from sklearn.utils.class_weight import compute_class_weight
# from tensorflow.keras.preprocessing.image import ImageDataGenerator
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.models import Model
# from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
# from tensorflow.keras.applications import MobileNetV2
# from tensorflow.keras.callbacks import ModelCheckpoint

# # ✅ Paths
# DATA_DIR = r'D:/Civiclink/dataset/scraped-images-bs4'
# MODEL_SAVE_PATH = r'D:/Civiclink/backend/api/model.h5'
# CLASS_WEIGHT_PATH = r'D:/Civiclink/backend/api/class_weights.pkl'
# LABELS_PATH = r'D:/Civiclink/backend/api/class_labels.pkl'

# # ✅ Categories / Classes
# categories = sorted(os.listdir(DATA_DIR))
# num_classes = len(categories)
# print(f"✅ Classes found: {categories}")

# # ✅ Image Data Generators
# datagen = ImageDataGenerator(
#     rescale=1./255,
#     validation_split=0.2,
#     rotation_range=20,
#     zoom_range=0.2,
#     horizontal_flip=True
# )

# train_gen = datagen.flow_from_directory(
#     DATA_DIR,
#     target_size=(224, 224),  # ✅ MobileNetV2 input size
#     batch_size=16,
#     class_mode='categorical',
#     subset='training'
# )

# val_gen = datagen.flow_from_directory(
#     DATA_DIR,
#     target_size=(224, 224),
#     batch_size=16,
#     class_mode='categorical',
#     subset='validation'
# )

# # ✅ Handle Class Imbalance
# # ✅ Handle Class Imbalance
# labels = train_gen.classes
# class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(labels), y=labels)
# class_weights = dict(enumerate(class_weights))
# print(f"✅ Computed Class Weights: {class_weights}")

# # ✅ Manually lower the weight for 'other' class (index 2)
# if 2 in class_weights:
#     original_other_weight = class_weights[2]
#     class_weights[2] = original_other_weight * 0.6  # Reduce 'other' weight by 40%
#     print(f"✅ Adjusted 'other' class weight from {original_other_weight} to {class_weights[2]}")


# # ✅ Build Model with MobileNetV2
# base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
# base_model.trainable = False  # ✅ Freeze base model

# x = base_model.output
# x = GlobalAveragePooling2D()(x)
# x = Dense(256, activation='relu')(x)
# x = Dropout(0.5)(x)
# output = Dense(num_classes, activation='softmax')(x)

# model = Model(inputs=base_model.input, outputs=output)

# model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
# model.summary()

# # ✅ Save best model
# checkpoint = ModelCheckpoint(
#     MODEL_SAVE_PATH,
#     monitor='val_loss',
#     save_best_only=True,
#     verbose=1
# )

# # ✅ Train the model
# history = model.fit(
#     train_gen,
#     epochs=20,
#     validation_data=val_gen,
#     class_weight=class_weights,
#     callbacks=[checkpoint]
# )

# # ✅ Save Class Weights and Labels
# joblib.dump(class_weights, CLASS_WEIGHT_PATH)
# joblib.dump(categories, LABELS_PATH)
# print(f"✅ Model saved at: {MODEL_SAVE_PATH}")
# print(f"✅ Class weights saved at: {CLASS_WEIGHT_PATH}")
# print(f"✅ Class labels saved at: {LABELS_PATH}")




import os
import numpy as np
import joblib
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

# ================= Paths =================
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'scraped-images-bs4')
DATA_DIR = os.path.abspath(DATA_DIR)
MODEL_SAVE_PATH = r'E:/Civiclink/backend/api/model.keras'  # ✅ Use .keras format
CLASS_WEIGHT_PATH = r'E:/Civiclink/backend/api/class_weights.pkl'
LABELS_PATH = r'E:/Civiclink/backend/api/class_labels.pkl'

# ✅ Ensure save directory exists
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
os.makedirs(os.path.dirname(CLASS_WEIGHT_PATH), exist_ok=True)
os.makedirs(os.path.dirname(LABELS_PATH), exist_ok=True)

# ================= Categories =================
categories = sorted(os.listdir(DATA_DIR))
num_classes = len(categories)
print(f"✅ Classes found: {categories}")

# ================= Image Generators =================
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

train_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=(224, 224),
    batch_size=16,
    class_mode='categorical',
    subset='training'
)

val_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=(224, 224),
    batch_size=16,
    class_mode='categorical',
    subset='validation'
)

# ================= Class Weights =================
labels = train_gen.classes
class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(labels), y=labels)
class_weights = dict(enumerate(class_weights))
print(f"✅ Computed Class Weights: {class_weights}")

# Reduce 'other' weight
other_index = categories.index('other') if 'other' in categories else None
if other_index is not None:
    original_other_weight = class_weights[other_index]
    class_weights[other_index] = original_other_weight * 0.6
    print(f"✅ Adjusted 'other' class weight from {original_other_weight} to {class_weights[other_index]}")

# ================= Build Model =================
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base_model.trainable = False  # Freeze initially

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.5)(x)
output = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)
model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

# ================= Callbacks =================
checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_loss', save_best_only=True, verbose=1)
early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

# ================= Train Model =================
history = model.fit(
    train_gen,
    epochs=30,
    validation_data=val_gen,
    class_weight=class_weights,
    callbacks=[checkpoint, early_stop]
)

# ================= Optional: Fine-tune Base =================
base_model.trainable = True
for layer in base_model.layers[:-50]:
    layer.trainable = False

model.compile(optimizer=Adam(learning_rate=1e-5), loss='categorical_crossentropy', metrics=['accuracy'])

history_ft = model.fit(
    train_gen,
    epochs=15,
    validation_data=val_gen,
    class_weight=class_weights,
    callbacks=[checkpoint, early_stop]
)

# ================= Save Class Weights and Labels =================
joblib.dump(class_weights, CLASS_WEIGHT_PATH)
joblib.dump(categories, LABELS_PATH)
print(f"✅ Model saved at: {MODEL_SAVE_PATH}")
print(f"✅ Class weights saved at: {CLASS_WEIGHT_PATH}")
print(f"✅ Class labels saved at: {LABELS_PATH}")
