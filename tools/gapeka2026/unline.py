import cv2, sys, numpy as np
img = cv2.imread(sys.argv[1], 0)
bw = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
h = cv2.morphologyEx(bw, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (60, 1)))
v = cv2.morphologyEx(bw, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 60)))
mask = cv2.dilate(h | v, np.ones((3, 3), np.uint8))
img[mask > 0] = 255
cv2.imwrite(sys.argv[2], img)
