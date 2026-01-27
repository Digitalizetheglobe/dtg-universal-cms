// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const BannerManagement = () => {
//   const [banner, setBanner] = useState(null);
//   const [file, setFile] = useState(null);

//   const fetchBanner = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/banner/get");
//       setBanner(res.data.url);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchBanner();
//   }, []);

//   const uploadBanner = async () => {
//     if (!file) return alert("Select image");

//     const formData = new FormData();
//     formData.append("banner", file);

//     try {
//       await axios.post("http://localhost:5000/api/banner/upload", formData);
//       alert("Uploaded!");
//       fetchBanner();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const deleteBanner = async () => {
//     try {
//       await axios.delete("http://localhost:5000/api/banner/delete");
//       alert("Deleted!");
//       setBanner(null);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Banner Management</h2>

//       {banner ? (
//         <div>
//           <img
//             src={`http://localhost:5000${banner}`}
//             width="300"
//             style={{ borderRadius: 10 }}
//             alt="banner"
//           />
//           <br />
//           <button onClick={deleteBanner}>Delete Banner</button>
//         </div>
//       ) : (
//         <p>No banner uploaded</p>
//       )}

//       <hr />

//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={uploadBanner}>Upload Banner</button>
//     </div>
//   );
// };

// export default BannerManagement;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Upload,
  Trash2,
  Image,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const BannerManagement = () => {
  const [banner, setBanner] = useState(null);
  const [bannerVersion, setBannerVersion] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://api.harekrishnavidya.org/api/banner/get");
      console.log("Banner fetch response:", res.data);
      if (res.data.url) {
        setBanner(res.data.url);
        setBannerVersion(prev => prev + 1);
      } else {
        setBanner(null);
        setBannerVersion(0);
      }
    } catch (err) {
      console.error("Error fetching banner:", err);
      setBanner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
  }, [file]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const uploadBanner = async () => {
    if (!file) {
      showMessage("error", "Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("banner", file);

    setUploading(true);
    try {
      const res = await axios.post("https://api.harekrishnavidya.org/api/banner/upload", formData);
      showMessage("success", "Banner uploaded successfully!");
      setFile(null);
      setPreview(null);
      // Set banner immediately from response, then fetch to ensure sync
      if (res.data.url) {
        setBanner(res.data.url);
        setBannerVersion(prev => prev + 1);
      }
      // Small delay to ensure file is written, then fetch
      setTimeout(() => {
        fetchBanner();
      }, 500);
    } catch (error) {
      showMessage("error", "Failed to upload banner");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const deleteBanner = async () => {
    setLoading(true);
    try {
      await axios.delete("https://api.harekrishnavidya.org/api/banner/delete");
      showMessage("success", "Banner deleted successfully!");
      setBanner(null);
      setBannerVersion(0);
    } catch (err) {
      showMessage("error", "Failed to delete banner");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Banner Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Upload, preview, and manage your website banner
          </p>
        </div>

        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 animate-scale-in ${message.type === "success"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Banner Card */}
          <div className="rounded-xl border border-b-4  border-b-bg-gradient-to-br from-blue-50 to-blue-50 bg-card p-6 shadow-custom-md animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                Current Banner
              </h2>
              {banner && (
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  Active
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-lg bg-secondary sm:h-56 lg:h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : banner ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={`http://localhost:5000${banner}?v=${bannerVersion}`}
                    alt="Current banner"
                    className="h-48 w-full object-cover sm:h-56 lg:h-64"
                    onError={(e) => {
                      console.error("Failed to load banner image:", e.target.src);
                      // Try without version parameter
                      e.target.src = `https://api.harekrishnavidya.org/api/${banner}`;
                    }}
                    key={bannerVersion}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
                <button
                  onClick={deleteBanner}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Banner
                </button>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 sm:h-56 lg:h-64">
                <Image className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No banner uploaded
                </p>
              </div>
            )}
          </div>

          {/* Upload Card */}
          <div
            className="rounded-xl border border-border bg-card p-6 shadow-custom-md animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Upload New Banner
            </h2>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              {preview ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-48 w-full object-cover sm:h-56 lg:h-64"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm font-medium text-background">
                      Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-all group-hover:border-primary group-hover:bg-primary/5 sm:h-56 lg:h-64">
                  <div className="mb-3 rounded-full bg-primary/10 p-3 transition-transform group-hover:scale-110">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Drop your image here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse
                  </p>
                </div>
              )}
            </div>

            {/* File Info */}
            {file && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
                    <Image className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="flex-shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={uploadBanner}
              disabled={!file || uploading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Banner
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div
          className="mt-8 rounded-xl border border-border bg-card p-6 shadow-custom-sm animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <h3 className="text-sm font-semibold text-card-foreground">
            Tips for best results
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              Use images with a resolution of at least 1920x600 pixels for
              optimal display
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              Supported formats: JPG, PNG, WebP, GIF
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              Keep file size under 5MB for faster loading
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
