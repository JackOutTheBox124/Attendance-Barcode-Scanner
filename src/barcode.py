import cv2
import numpy as np
from pyzbar.pyzbar import decode
import requests

barcode_Data = ''
barcode_Type = ''

def decoder(image):
  gray_img = cv2.cvtColor(image,0)
  barcode = decode(gray_img)

  for obj in barcode:
    points = obj.polygon
    (x,y,w,h) = obj.rect
    pts = np.array(points, np.int32)
    pts = pts.reshape((-1, 1, 2))
    cv2.polylines(image, [pts], True, (0, 255, 0), 3)

    barcodeData = obj.data.decode("utf-8")
    barcodeType = obj.type
    string = "Data " + str(barcodeData) + " | Type " + str(barcodeType)
    cv2.putText(frame, string, (x,y), cv2.FONT_HERSHEY_SIMPLEX,0.8,(255,0,0), 2)
    print("Barcode: "+barcodeData +" | Type: "+barcodeType)

    global barcode_Data
    global barcode_Type

    barcode_Data = obj.data.decode("utf-8")
    barcode_Type = obj.type

    return (barcodeData, barcodeType)

def postData(barcodeData, barcodeType):
  print("posting data")
  url = 'http://localhost:5000/'
  if(barcodeData != '' and barcodeType == 'CODE39'):
    try:
      data = {'barcodeData': barcodeData, 'barcodeType': barcodeType}
      r = requests.post(url, json=data)
      print(r.status_code)
      print(r.text)
    except:
      print('error')
  global barcode_Data
  global barcode_Type

i = 0
cap = cv2.VideoCapture(0)
while True:
  i = i + 1
  ret, frame = cap.read()
  decoded = decoder(frame)
  if(i % 50 == 0 and barcode_Data != "CODE39"):
    postData(barcode_Data, barcode_Type)
    barcode_Data = ''
    barcode_Type = ''
  cv2.imshow('Image', frame)

  code = cv2.waitKey(10)
  if code == ord('q'):
    break