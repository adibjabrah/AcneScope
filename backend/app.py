import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS 
from ultralytics import YOLO
import base64

app = Flask(__name__)
CORS(app) 

# load model YOLOv8
model = YOLO("best.pt")
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def tentukan_status(n):
    if n == 0: 
        return "AMAN", "Tidak terdeteksi jerawat aktif. Lanjutkan perawatan rutin."
    if n <= 5: 
        return "PERLU PERHATIAN", "Terdeteksi sedikit jerawat. Jaga kebersihan wajah."
    return "PERLU PENANGANAN", "Jerawat signifikan. Disarankan konsultasi dermatologi."

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file yang diunggah'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tidak ada file yang dipilih'}), 400

    # membaca gambar
    filestr = file.read()
    npimg = np.frombuffer(filestr, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    h_img, w_img, _ = img.shape

    # deteksi YOLO
    res = model(img, conf=0.25)[0]
    boxes = res.boxes
    n = len(boxes)

    # deteksi zona wajah 
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
    zona = {"Dahi": 0, "Pipi Kiri": 0, "Pipi Kanan": 0, "Hidung": 0, "Dagu": 0}

    if len(faces) > 0:
        faces = sorted(faces, key=lambda x: x[2]*x[3], reverse=True)
        fx, fy, fw, fh = faces[0]
    else:
        fx, fy, fw, fh = 0, 0, w_img, h_img

    # klasifikasi zona
    for xc, yc, w, h in boxes.xywhn.cpu().numpy():
        xc_px, yc_px = xc * w_img, yc * h_img
        if fx <= xc_px <= fx + fw and fy <= yc_px <= fy + fh:
            rel_x = (xc_px - fx) / fw
            rel_y = (yc_px - fy) / fh
            if rel_y < 0.35:
                zona["Dahi"] += 1
            elif rel_y > 0.70:
                zona["Dagu"] += 1
            else:
                if rel_x < 0.35:
                    zona["Pipi Kanan"] += 1 
                elif rel_x > 0.65:
                    zona["Pipi Kiri"] += 1
                else:
                    zona["Hidung"] += 1

    # anotasi gambar
    annotated = res.plot()
    if len(faces) > 0:
        cv2.rectangle(annotated, (fx, fy), (fx+fw, fy+fh), (0, 255, 255), 2)
        
    _, buffer = cv2.imencode('.jpg', annotated)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    status, saran = tentukan_status(n)

    return jsonify({
        'image': img_base64,
        'total': n,
        'status': status,
        'saran': saran,
        'zona': zona
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)