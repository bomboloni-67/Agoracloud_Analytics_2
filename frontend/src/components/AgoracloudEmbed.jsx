import React, { useEffect, useRef } from 'react';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';

export default function AgoracloudEmbed({ embedUrl, initialQuestion }) {
  const containerRef = useRef(null);
  // We use a ref to track the frame so it persists across renders/cleanups
  const frameRef = useRef(null); 

  useEffect(() => {
    let isMounted = true; // prevent setting state/refs on unmounted component

    const embed = async () => {
      try {
        const embeddingContext = await createEmbeddingContext();
        
        // If user left the page while context was creating, stop here
        if (!isMounted || !containerRef.current) return; 

        const embeddedFrame = await embeddingContext.embedGenerativeQnA({
          url: embedUrl,
          container: containerRef.current,
          width: "100%",
          height: "100%",
          initialQuestion: initialQuestion, 
          theme: "dark", 
        });

        // Store in ref for cleanup
        frameRef.current = embeddedFrame;
      } catch (error) {
        console.error("Embedding failed:", error);
      }
    };

    if (embedUrl) {
      embed();
    }

    // CLEANUP FUNCTION
    return () => {
      isMounted = false;
      if (frameRef.current) {
        // Look up the specific close method in the SDK docs, usually .close()
        // wrapping in try-catch is safe for external SDKs
        try {
            frameRef.current.close();
        } catch (e) {
            console.warn("Could not close frame:", e);
        }
        frameRef.current = null;
      }
    };
  }, [embedUrl]); // Re-run if URL changes

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a]/20 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}