import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchFromNode } from "../utils/nodeApi";

const PreviewContext = createContext(null);

export function PreviewProvider({ children }) {
  const [previewData, setPreviewData] = useState({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const isIframe = window.self !== window.top;
    const params = new URLSearchParams(window.location.search);
    const hasPreviewParam = params.get("preview") === "true";
    const previewToken = params.get("previewToken");

    const inPreview = isIframe || hasPreviewParam || !!previewToken;
    setIsPreviewMode(inPreview);

    if (inPreview) {
      console.log("SIS Web is running in PREVIEW MODE. Ready to sync.");

      // Notify parent admin panel that the preview is ready to receive data
      if (isIframe) {
        window.parent.postMessage({ type: "PREVIEW_READY" }, "*");
      }

      // Fetch draft data snapshot from suae-node backend if previewToken is present
      if (previewToken) {
        fetchFromNode(`/public/preview-draft?token=${encodeURIComponent(previewToken)}`)
          .then((res) => {
            if (!res.ok) throw new Error("Preview token expired or invalid");
            return res.json();
          })
          .then((data) => {
            if (data && data.content) {
              setPreviewData(data.content);
            }
          })
          .catch((err) => {
            console.error("Failed to load draft by token:", err);
          });
      }
    }

    // Listen for live update messages from suae-frontend editor
    const handleMessage = (event) => {
      const message = event.data;
      if (message && message.type === "PREVIEW_UPDATE") {
        const { section, data } = message;
        console.log(`Received PREVIEW_UPDATE for [${section}]:`, data);
        setPreviewData((prev) => {
          const updatedSection = Array.isArray(data)
            ? data
            : { ...prev[section], ...data };
          return {
            ...prev,
            [section]: updatedSection,
          };
        });
      } else if (message && message.type === "PREVIEW_SNAPSHOT") {
        console.log("Received full PREVIEW_SNAPSHOT:", message.data);
        setPreviewData(message.data || {});
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <PreviewContext.Provider value={{ previewData, isPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreviewData(sectionName, defaultData) {
  const context = useContext(PreviewContext);
  if (!context) {
    return defaultData;
  }

  const { previewData, isPreviewMode } = context;
  if (!isPreviewMode) {
    return defaultData;
  }

  const sectionPreview = previewData[sectionName];
  if (!sectionPreview) {
    return defaultData;
  }

  // If default data is an array (e.g. navigation links), return the preview array directly
  if (Array.isArray(defaultData)) {
    return sectionPreview;
  }

  // Spread merge (flat or shallow nested is enough for current section shapes)
  // To handle sub-objects (like form, cta, search), do a slightly deeper merge if keys exist
  
  const merged = { ...defaultData };
  Object.keys(sectionPreview).forEach((key) => {
    const val = sectionPreview[key];
    if (val && typeof val === "object" && !Array.isArray(val) && merged[key] && typeof merged[key] === "object") {
      merged[key] = {
        ...merged[key],
        ...val,
      };
    } else {
      merged[key] = val;
    }
  });

  return merged;
}
