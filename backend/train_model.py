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

# Paths and persistence locations
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'scraped-images-bs4')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'api', 'model.keras')
CLASS_WEIGHT_PATH = os.path.join(os.path.dirname(__file__), 'api', 'class_weights.pkl')
LABELS_PATH = os.path.join(os.path.dirname(__file__), 'api', 'class_labels.pkl')

# Ensure directories exist for saving artifacts
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
os.makedirs(os.path.dirname(CLASS_WEIGHT_PATH), exist_ok=True)
os.makedirs(os.path.dirname(LABELS_PATH), exist_ok=True)

# Discover class labels from directory names
categories = sorted(os.listdir(DATA_DIR))
num_classes = len(categories)
print(f"✅ Classes found: {categories}")

# Image generators with augmentation and train/val split
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

# Training data generator
train_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=(224, 224),
    batch_size=16,
    class_mode='categorical',
    subset='training'
)

# Validation data generator
val_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=(224, 224),
    batch_size=16,
    class_mode='categorical',
    subset='validation'
)

# Compute balanced class weights to handle dataset imbalance
labels = train_gen.classes
class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(labels), y=labels)
class_weights = dict(enumerate(class_weights))
print(f"✅ Computed Class Weights: {class_weights}")

other_index = categories.index('other') if 'other' in categories else None
if other_index is not None:
    original_other_weight = class_weights[other_index]
    class_weights[other_index] = original_other_weight * 0.6
    print(f"✅ Adjusted 'other' class weight from {original_other_weight} to {class_weights[other_index]}")

# Build Transfer Learning model (MobileNetV2 backbone + custom head)
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base_model.trainable = False  

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.5)(x)
output = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)
model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

# Checkpoint the best model and stop early 
checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_loss', save_best_only=True, verbose=1)
early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

# Train the new head with frozen backbone
history = model.fit(
    train_gen,
    epochs=30,
    validation_data=val_gen,
    class_weight=class_weights,
    callbacks=[checkpoint, early_stop]
)

# Fine-tune: unfreeze last ~50 layers of the backbone at a low LR
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

# Persist artifacts for inference (class weights optional; labels needed)
joblib.dump(class_weights, CLASS_WEIGHT_PATH)
joblib.dump(categories, LABELS_PATH)
print(f"✅ Model saved at: {MODEL_SAVE_PATH}")
print(f"✅ Class weights saved at: {CLASS_WEIGHT_PATH}")
print(f"✅ Class labels saved at: {LABELS_PATH}")