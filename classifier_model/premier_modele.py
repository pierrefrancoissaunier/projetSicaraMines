import numpy as np 
import matplotlib.pyplot as plt 
import pandas as pd 
import tensorflow as tf 

from sklearn.preprocessing import StandardScaler


#### Extract dataset

cifar10 = tf.keras.datasets.cifar10
(images, targets), (images_test, targets_test) = cifar10.load_data()


target_name = ["airplane","automobile","bird","cat","deer","dog","frog","horse","ship","truck"]

print(images.shape)

images = images.astype('float')
images_test = images_test.astype('float')

images = images / 255
images_test = images_test / 255

batch_size = 40


model = tf.keras.models.Sequential() 

model.add(tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)))
model.add(tf.keras.layers.MaxPooling2D((2, 2)))
# model.add(tf.keras.layers.Dropout(0.25))
model.add(tf.keras.layers.Conv2D(64, (3, 3), activation='relu'))
model.add(tf.keras.layers.MaxPooling2D((2, 2)))
# model.add(tf.keras.layers.Dropout(0.25))
model.add(tf.keras.layers.Conv2D(64, (3, 3), activation='relu'))
model.add(tf.keras.layers.MaxPooling2D((2, 2)))
model.add(tf.keras.layers.Dropout(0.25))


model.add(tf.keras.layers.Flatten())

model.add(tf.keras.layers.Dense(350,activation = "relu"))
# model.add(tf.keras.layers.Dense(64,activation = "relu"))

model.add(tf.keras.layers.Dense(10,activation = "softmax"))

# print(model.summary())

optim = tf.keras.optimizers.Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999, amsgrad=False)
# optim = tf.keras.optimizers.SGD(learning_rate=0.01)

model.compile(
    loss="sparse_categorical_crossentropy",
    optimizer=optim,
    metrics=["accuracy"]
)

history = model.fit(images, targets, batch_size=batch_size, epochs = 8, validation_split = 0.2)

# loss_curve = history.history["loss"]
# acc_curve = history.history["accuracy"]

# loss_val_curve = history.history["val_loss"]
# acc_val_curve = history.history["val_accuracy"]


# plt.plot(acc_curve, label = "Train")
# plt.plot(acc_val_curve, label = "Val")
# plt.legend(loc='best')
# plt.title("Accuracy")
# plt.grid()

# plt.show()

loss, acc = model.evaluate(images_test, targets_test)
print("Test Loss =",loss)
print("Test Accuracy = ", acc)

model.save("Vfifth_model.h5")