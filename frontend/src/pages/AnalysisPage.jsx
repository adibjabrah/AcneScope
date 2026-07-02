import { useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import CameraCapture from '../components/CameraCapture';
import VideoRealtime from '../components/VideoRealtime';
import ResultPanel from '../components/ResultPanel';
import ValidationSection from '../components/ValidationSection';

const TABS = [
  { key: 'upload', label: 'Upload Image', icon: 'fa-solid fa-cloud-arrow-up' },
  { key: 'camera', label: 'Camera', icon: 'fa-solid fa-camera' },
  { key: 'video', label: 'Video', icon: 'fa-solid fa-video' },
];

// Halaman Beranda (route "/") — perilaku & tampilan tab Upload identik dengan App.jsx sebelumnya,
// ditambah tab Camera & Video serta section Validasi Hasil di bawah hasil deteksi.
function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleResult = (data) => {
    setResult(data);
    if (data) {
      setTimeout(() => {
        const el = document.getElementById('resultArea');
        if (el) window.scrollTo({ top: el.offsetTop - 50, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="container mb-5">
      <div className="row justify-content-center mb-4">
        <div className="col-lg-6 col-md-8">
          <div className="mode-tabs mb-3">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`mode-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`${tab.icon} me-1`}></i>{tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'upload' && (
            <UploadPanel onResult={handleResult} loading={loading} setLoading={setLoading} />
          )}
          {activeTab === 'camera' && (
            <CameraCapture onResult={handleResult} loading={loading} setLoading={setLoading} />
          )}
          {activeTab === 'video' && (
            <VideoRealtime onResult={handleResult} />
          )}
        </div>
      </div>

      {result && (
        <>
          <ResultPanel result={result} />
          <div className="row justify-content-center">
            <div className="col-lg-11">
              <ValidationSection
                recordId={result.id}
                existingValidation={null}
                onValidated={(validation) => setResult((prev) => ({ ...prev, validation }))}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalysisPage;
