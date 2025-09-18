// src/components/common/ImageUploader.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useNotification } from '@/context/NotificationContext';
import { fileHelpers } from '@/utils/helpers';
import { cn } from '@/lib/utils';

const ImageUploader = ({
  onImageUpload,
  maxFiles = 1,
  maxSizeInMB = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  placeholder = "Click to upload or drag and drop images here",
  preview = true,
  cropEnabled = false,
  existingImages = []
}) => {
  const [uploadedImages, setUploadedImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useNotification();

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    if (uploadedImages.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} ${maxFiles === 1 ? 'image' : 'images'} allowed`);
      return;
    }

    // Validate each file
    const validFiles = [];
    const errors = [];

    fileArray.forEach((file, index) => {
      const validation = fileHelpers.validateFile(file, 'image');
      
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
        return;
      }

      // Additional validations
      if (file.size > maxSizeInMB * 1024 * 1024) {
        errors.push(`File ${file.name}: Size exceeds ${maxSizeInMB}MB limit`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${file.name}: Type not allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
      return;
    }

    setError(null);
    uploadFiles(validFiles);
  };

  // Upload files to backend
  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'disease-detection'); // or dynamic based on use case

        // Simulate progress for each file
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const increment = (index + 1) * (80 / files.length);
            return Math.min(prev + 2, increment);
          });
        }, 100);

        try {
          // Upload to backend API
          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('krishi_token')}`
            }
          });

          clearInterval(progressInterval);

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();
          
          if (result.success) {
            return {
              id: result.data.id,
              url: result.data.url,
              filename: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            };
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      });

      const results = await Promise.all(uploadPromises);
      setUploadProgress(100);

      // Update state with uploaded images
      const newImages = [...uploadedImages, ...results];
      setUploadedImages(newImages);

      // Callback to parent component
      if (onImageUpload) {
        onImageUpload(newImages);
      }

      showSuccess(`${files.length} ${files.length === 1 ? 'image' : 'images'} uploaded successfully! 📸`);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed. Please try again.');
      showError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = async (imageIndex) => {
    try {
      const imageToRemove = uploadedImages[imageIndex];
      
      // Delete from backend if it has an ID (already uploaded)
      if (imageToRemove.id) {
        const response = await fetch(`/api/upload/image/${imageToRemove.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('krishi_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete image from server');
        }
      }

      const newImages = uploadedImages.filter((_, index) => index !== imageIndex);
      setUploadedImages(newImages);

      if (onImageUpload) {
        onImageUpload(newImages);
      }

      showSuccess('Image removed successfully');
    } catch (error) {
      showError('Failed to remove image');
    }
  };

  // Preview image
  const previewImage = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const canUploadMore = uploadedImages.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-accent/50",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="space-y-4">
            {uploading ? (
              <>
                <Upload className="w-12 h-12 mx-auto text-primary animate-pulse" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading images...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 mx-auto text-gray-400" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{placeholder}</p>
                  <p className="text-xs text-muted-foreground">
                    {maxFiles > 1 
                      ? `Upload up to ${maxFiles} images (max ${maxSizeInMB}MB each)`
                      : `Maximum size: ${maxSizeInMB}MB`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: JPEG, PNG, WebP
                  </p>
                </div>
                <Button variant="outline" size="sm" type="button">
                  Choose Files
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Images Preview */}
      {preview && uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images ({uploadedImages.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={image.id || index}
                className="relative group border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
              >
                <img
                  src={image.url}
                  alt={image.filename || `Upload ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => previewImage(image.url)}
                      className="text-white hover:bg-white/20"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeImage(index)}
                      className="text-white hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Image info */}
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {image.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fileHelpers.formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
