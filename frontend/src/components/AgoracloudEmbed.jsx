import React, { useEffect, useRef, useState } from 'react';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';

export default function AgoracloudEmbed({ embedUrl, initialQuestion }) {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const [isFrameReady, setIsFrameReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const embed = async () => {
      try {
        const embeddingContext = await createEmbeddingContext();
        if (!isMounted || !containerRef.current) return;

        const frameOptions = {
          url: embedUrl,
          container: containerRef.current,
          width: "100%",
          height: "100%",
        };

        const contentOptions = {
          showPinboard: false,
          allowFullscreen: false,
          panelOptions: {
            panelType: 'SEARCH_BAR',
            showQIcon: false,
          },
          themeOptions: {
            themeArn: 'arn:aws:quicksight:ap-southeast-1:074877414729:theme/agora-dark-theme'
          },
          // KEY FIX: Listen for when the frame is actually ready
          onMessage: async (messageEvent) => {
            if (messageEvent.eventName === 'CONTENT_LOADED') {
              console.log("🎯 QuickSight is ready for questions");
              setIsFrameReady(true);
            }
          }
        };

        frameRef.current = await embeddingContext.embedGenerativeQnA(frameOptions, contentOptions);
      } catch (error) {
        console.error("Embedding failed:", error);
      }
    };

    if (embedUrl) embed();
    return () => { isMounted = false; };
  }, [embedUrl]);

  // EFFECT 2: The "Guaranteed" Remote Control
  useEffect(() => {
    // Only send the question if the frame exists AND it has finished loading
    if (frameRef.current && isFrameReady && initialQuestion) {
      console.log("🚀 Injecting:", initialQuestion);
      frameRef.current.setQuestion(initialQuestion);
    }
  }, [initialQuestion, isFrameReady]); // Watch both the question and the ready state

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#020617] shadow-2xl relative">
      {/* THE MASKING TRICK:
          We pull the iframe UP by 85px to hide the QuickSight Search Bar + Ask Button.
          We increase the height to compensate so the bottom isn't cut off.
      */}
      <div 
        ref={containerRef} 
        style={{ 
          height: 'calc(100% + 150px)', 
          marginTop: '-85px' 
        }} 
        className="w-full relative"
      />
      
      {/* Top Overlay: Ensures the hidden bar can't be "scrolled" into view */}
      <div className="absolute top-0 left-0 w-full h-[5px] bg-[#020617] z-20" />
      
      {/* Bottom Mask: Covers the footer */}
      <div className="absolute bottom-0 left-0 w-full h-[20px] bg-[#020617] z-10" />
    </div>
  );
}