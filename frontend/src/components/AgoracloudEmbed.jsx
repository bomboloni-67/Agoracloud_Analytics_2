import React, { useEffect, useRef } from 'react';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';

export default function QuicksightEmbed({ embedUrl, initialQuestion }) {
  const containerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    let embeddedFrame;
    
    const embed = async () => {
      const embeddingContext = await createEmbeddingContext();
      
      embeddedFrame = await embeddingContext.embedGenerativeQnA({
        url: embedUrl,
        container: containerRef.current,
        width: "100%",
        height: "100%",
        // This passes your App.jsx input directly into the AWS Engine
        initialQuestion: initialQuestion, 
        theme: "dark", 
      });
      
      frameRef.current = embeddedFrame;
    };

    if (embedUrl && containerRef.current) {
      embed();
    }

    return () => {
      if (embeddedFrame) embeddedFrame.close();
    };
  }, [embedUrl]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a]/20 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}