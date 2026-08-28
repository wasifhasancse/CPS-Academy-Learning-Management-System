"use client";

import { useState, useRef } from "react";
import { uploadToImgBB } from "@/lib/imgbb";
import { Button } from "@/components/ui/Button";

export function ImageUpload({
  value = "",
  onChange,
  label = "Course Image / Thumbnail",
  description = "Upload an image (PNG, JPG, WebP) to ImgBB or enter an image URL.",
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (under 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const result = await uploadToImgBB(file);
      onChange?.(result.url);
    } catch (err) {
      setUploadError(err?.message || "Failed to upload image. Please check your connection.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange?.("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground block">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setIsManualMode(!isManualMode)}
            className="text-[11px] text-secondary hover:underline cursor-pointer"
          >
            {isManualMode ? "Upload File instead" : "Enter URL directly"}
          </button>
        </div>
      )}

      {uploadError && (
        <div role="alert" className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs">
          {uploadError}
        </div>
      )}

      {/* Preview Section if Image Exists */}
      {value ? (
        <div className="relative rounded-xl border border-border bg-surface p-2 flex items-center gap-3">
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-card border border-border flex-shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Course Thumbnail Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1516116211227-bbc2416b2505?w=600";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-foreground block truncate">
              Image Uploaded
            </span>
            <span className="text-[10px] text-muted block truncate font-mono">
              {value}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs py-1 px-2.5"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="text-xs py-1 px-2"
              disabled={disabled || isUploading}
              onClick={handleRemove}
            >
              ✕
            </Button>
          </div>
        </div>
      ) : isManualMode ? (
        <input
          type="url"
          placeholder="https://i.ibb.co/..."
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
        />
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            isUploading
              ? "bg-surface/50 border-primary/50 cursor-wait"
              : "border-border hover:border-primary hover:bg-surface/30"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-1">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-primary dark:text-highlight">
                Uploading to ImgBB...
              </span>
              <span className="text-[10px] text-muted">Saving image file</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 py-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:text-highlight flex items-center justify-center mb-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-xs font-semibold text-foreground">
                Click to upload course image
              </div>
              <div className="text-[10px] text-muted">
                Direct ImgBB integration • PNG, JPG, WebP up to 10MB
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {description && !value && (
        <p className="text-[10px] text-muted">{description}</p>
      )}
    </div>
  );
}
