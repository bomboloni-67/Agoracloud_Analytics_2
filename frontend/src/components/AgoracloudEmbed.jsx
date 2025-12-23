import React, { useEffect, useRef, memo } from 'react';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';

const AgoracloudEmbed = memo(({ embedUrl, activeTab }) => {
  const containerRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const embed = async () => {
      try {
        // Initialize context once
        if (!contextRef.current) {
          contextRef.current = await createEmbeddingContext();
        }
        
        if (!isMounted || !containerRef.current) return;

        // Clear previous iframe before re-embedding
        containerRef.current.innerHTML = ''; 

        const frameOptions = {
          url: embedUrl,
          container: containerRef.current,
          width: "100%",
          height: "100%",
        };

        const themeArn = 'arn:aws:quicksight:ap-southeast-1:074877414729:theme/agora-dark-theme';

        // --- BRANCH LOGIC: DASHBOARD vs Q ---
        if (activeTab === 'Dashboards') {
          // Dashboard Specific Options
          const dashboardOptions = {
            toolbarOptions: {
              export: true,
              undoRedo: false,
              reset: false,
            },
            sheetOptions: {
              initialSheetId: undefined, // Let QuickSight load the default sheet
              singleSheet: false,        // Set true if you only want one page
              emitSizeChangedEvent: true,
            },
            themeOptions: { themeArn }
          };

          await contextRef.current.embedDashboard(frameOptions, dashboardOptions);
          
        } else {
          // Generative Q&A Specific Options
          const qnaOptions = {
            showTopicName: false,
            showPinboard: false,
            allowFullscreen: false,
            allowTopicSelection: false,
            panelOptions: {
              panelType: 'FULL',
              showQIcon: false,
            },
            themeOptions: { themeArn }
          };

          await contextRef.current.embedGenerativeQnA(frameOptions, qnaOptions);
        }
      } catch (error) {
        console.error("Embedding failed:", error);
      }
    };

    if (embedUrl) embed();
    
    return () => { isMounted = false; };
  }, [embedUrl, activeTab]); // Re-run when URL or Tab changes

  // Determine if we need the height hack (+35px) for Q mode
  const isQMode = activeTab === 'Ask Data';

  return (
    <div className="w-full h-full rounded-2xl border border-slate-800 bg-[#020617] overflow-hidden relative">
      <div 
        ref={containerRef} 
        style={{ 
          // Only apply the +35px hack if in Q mode to hide the footer else use +10px for same hack in Dashboards
          height: isQMode ? 'calc(100% + 35px)' : 'calc(100% + 10px)', 
          width: '100%'
        }} 
        className="relative"
      />

     <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-[#020617] to-transparent z-10 pointer-events-none" />
    </div>
  );
});

export default AgoracloudEmbed;