'use client';
import { useState, useRef } from 'react';

export default function DropZone({ onFileSelect, file }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      onFileSelect(droppedFile);
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
      className={`
        border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'bg-primary/10 border-primary shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' 
          : 'bg-white/5 border-white/10 hover:border-white/30'}
        ${file ? 'border-primary/50' : ''}
      `}
    >
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="text-3xl mb-3">
        {file ? '📄' : '📤'}
      </div>
      {file ? (
        <div>
          <p className="font-semibold text-primary truncate max-w-[250px] mx-auto">{file.name}</p>
          <p className="text-xs text-text-muted mt-1">Click or drag to change</p>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-white">Drop your resume here</p>
          <p className="text-xs text-text-muted mt-1">Only PDF files supported</p>
        </div>
      )}
    </div>
  );
}
