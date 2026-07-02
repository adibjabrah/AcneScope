import os
import time
import uuid
import json
import threading
from datetime import datetime

import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__)
CORS(app)

# load model YOLOv8
model = YOLO("best.pt")
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# === Penyimpanan Riwayat Testing (JSON file, sesuai arsitektur project yang belum memakai database) ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
HISTORY_FILE = os.path.join(DATA_DIR, 'history.json')
HISTORY_IMG_DIR = os.path.join(BASE_DIR, 'static', 'history')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(HISTORY_IMG_DIR, exist_ok=True)

history_lock = threading.Lock()
ALLOWED_EXT = {'.jpg', '.jpeg', '.png'}


def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_history(records):
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


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

    # source: upload | camera | video (default upload), dipakai untuk menandai asal data di riwayat
    source = request.form.get('source', 'upload')
    # save_history: mode video realtime mengirim 'false' agar inferensi live tidak membanjiri riwayat
    save_to_history = request.form.get('save_history', 'true').lower() != 'false'

    # membaca gambar
    filestr = file.read()
    npimg = np.frombuffer(filestr, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    h_img, w_img, _ = img.shape

    # deteksi YOLO (logika inti tidak diubah)
    t0 = time.time()
    res = model(img, conf=0.25)[0]
    inference_time_ms = round((time.time() - t0) * 1000, 2)
    boxes = res.boxes
    n = len(boxes)

    # confidence rata-rata & breakdown per kelas
    if n > 0:
        confs = boxes.conf.cpu().numpy()
        avg_confidence = round(float(confs.mean()), 4)
        cls_ids = boxes.cls.cpu().numpy().astype(int)
        classes = {}
        for cid in cls_ids:
            name = model.names[int(cid)]
            classes[name] = classes.get(name, 0) + 1
    else:
        avg_confidence = 0.0
        classes = {}

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

    response_data = {
        'image': img_base64,
        'total': n,
        'status': status,
        'saran': saran,
        'zona': zona,
        'avg_confidence': avg_confidence,
        'classes': classes,
        'inference_time_ms': inference_time_ms,
    }

    if save_to_history:
        record_id = uuid.uuid4().hex
        timestamp = datetime.now().isoformat()

        # nama file disk berbasis UUID (bukan nama dari user) untuk hindari path traversal
        original_name = secure_filename(file.filename) or 'capture.jpg'
        ext = os.path.splitext(original_name)[1].lower()
        if ext not in ALLOWED_EXT:
            ext = '.jpg'

        original_path = os.path.join(HISTORY_IMG_DIR, f'{record_id}_original{ext}')
        result_path = os.path.join(HISTORY_IMG_DIR, f'{record_id}_result.jpg')
        with open(original_path, 'wb') as f:
            f.write(filestr)
        cv2.imwrite(result_path, annotated)

        record = {
            'id': record_id,
            'timestamp': timestamp,
            'filename': original_name,
            'source': source,
            'original_image': f'/static/history/{record_id}_original{ext}',
            'result_image': f'/static/history/{record_id}_result.jpg',
            'total': n,
            'avg_confidence': avg_confidence,
            'status': status,
            'saran': saran,
            'zona': zona,
            'classes': classes,
            'inference_time_ms': inference_time_ms,
            'validation': None,
        }

        with history_lock:
            records = load_history()
            records.append(record)
            save_history(records)

        response_data.update({
            'id': record_id,
            'timestamp': timestamp,
            'filename': original_name,
            'original_image': record['original_image'],
            'result_image': record['result_image'],
        })

    return jsonify(response_data)


@app.route('/api/history', methods=['GET'])
def get_history():
    with history_lock:
        records = load_history()
    records_sorted = sorted(records, key=lambda r: r['timestamp'], reverse=True)
    return jsonify(records_sorted)


@app.route('/api/history/<record_id>', methods=['GET'])
def get_history_detail(record_id):
    with history_lock:
        records = load_history()
    record = next((r for r in records if r['id'] == record_id), None)
    if record is None:
        return jsonify({'error': 'Riwayat tidak ditemukan'}), 404
    return jsonify(record)


@app.route('/api/history/<record_id>/validation', methods=['POST'])
def submit_validation(record_id):
    data = request.get_json(silent=True) or {}
    validation_status = data.get('validation_status')
    if validation_status not in ('Ya', 'Sebagian', 'Tidak'):
        return jsonify({'error': 'validation_status harus Ya, Sebagian, atau Tidak'}), 400

    validation = {
        'validation_status': validation_status,
        'actual_count': data.get('actual_count'),
        'false_negative': data.get('false_negative'),
        'false_positive': data.get('false_positive'),
        'notes': data.get('notes', ''),
        'validated_at': datetime.now().isoformat(),
    }

    with history_lock:
        records = load_history()
        record = next((r for r in records if r['id'] == record_id), None)
        if record is None:
            return jsonify({'error': 'Riwayat tidak ditemukan'}), 404
        record['validation'] = validation
        save_history(records)

    return jsonify(record)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    with history_lock:
        records = load_history()

    total_percobaan = len(records)
    prediksi_benar = 0
    prediksi_salah = 0
    fp_total = 0
    fn_total = 0

    for r in records:
        v = r.get('validation')
        if not v:
            continue
        if v.get('validation_status') == 'Ya':
            prediksi_benar += 1
        elif v.get('validation_status') in ('Sebagian', 'Tidak'):
            prediksi_salah += 1
        fp_total += v.get('false_positive') or 0
        fn_total += v.get('false_negative') or 0

    akurasi_persen = round((prediksi_benar / total_percobaan) * 100, 2) if total_percobaan > 0 else 0.0

    timeline = sorted(
        [{'timestamp': r['timestamp'], 'total': r['total'], 'avg_confidence': r['avg_confidence']} for r in records],
        key=lambda x: x['timestamp']
    )

    return jsonify({
        'total_percobaan': total_percobaan,
        'prediksi_benar': prediksi_benar,
        'prediksi_salah': prediksi_salah,
        'fp_total': fp_total,
        'fn_total': fn_total,
        'akurasi_persen': akurasi_persen,
        'timeline': timeline,
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
