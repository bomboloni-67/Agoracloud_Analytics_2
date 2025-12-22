import React, { useEffect, useRef, memo } from 'react';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';

const AgoracloudEmbed = memo(({ embedUrl }) => {
  const containerRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const embed = async () => {
      try {
        if (!contextRef.current) {
          contextRef.current = await createEmbeddingContext();
        }
        if (!isMounted || !containerRef.current) return;

        containerRef.current.innerHTML = ''; 

        const frameOptions = {
          url: embedUrl,
          container: containerRef.current,
          width: "100%",
          height: "100%", // The SDK fills the containerRef height
        };

        const contentOptions = {
          showPinboard: false,
          showTopicName: false,
          allowFullscreen: false,
          panelOptions: {
            panelType: 'FULL',
            showQIcon: false,
          },
          allowTopicSelection: false,
          themeOptions: {
            themeArn: 'arn:aws:quicksight:ap-southeast-1:074877414729:theme/agora-dark-theme'
          }
        };

        await contextRef.current.embedGenerativeQnA(frameOptions, contentOptions);
      } catch (error) {
        console.error("Embedding failed:", error);
      }
    };

    if (embedUrl) embed();
    return () => { isMounted = false; };
  }, [embedUrl]);

  return (
    /* OUTER WRAPPER: Limits what is visible */
    <div className="w-full h-full rounded-2xl border border-slate-800 bg-[#020617] overflow-hidden relative">
      <div 
        ref={containerRef} 
        style={{ 
          height: 'calc(100% + 35px)', 
          width: '100%'
        }} 
        className="relative"
      />

      {/* OPTIONAL: A subtle gradient at the bottom to make the "cut" look intentional */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-[#020617] to-transparent z-10 pointer-events-none" />
    </div>
  );
});

export default AgoracloudEmbed;