import React, { useEffect, useRef, memo } from 'react';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';

const AgoracloudEmbed = memo(({ embedUrl, activeTab, initialQuestion }) => {
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const embeddedExperienceRef = useRef(null); // To store the Q instance

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
          height: "100%",
        };

        const themeArn = 'arn:aws:quicksight:ap-southeast-1:074877414729:theme/agora-dark-theme';

        if (activeTab === 'Dashboards') {
          const dashboardOptions = {
            toolbarOptions: { export: true, undoRedo: false, reset: false },
            sheetOptions: { initialSheetId: undefined, singleSheet: false, emitSizeChangedEvent: true },
            themeOptions: { themeArn }
          };
          embeddedExperienceRef.current = await contextRef.current.embedDashboard(frameOptions, dashboardOptions);
        } else if (activeTab === 'Stories') {
          const consoleOptions = {
          };
          embeddedExperienceRef.current = await contextRef.current.embedConsole(frameOptions, consoleOptions); 
        }
        else {
          const qnaOptions = {
            showTopicName: false,
            showPinboard: false,
            allowFullscreen: false,
            allowTopicSelection: false,
            initialQuestion: initialQuestion || undefined,
            panelOptions: { panelType: 'FULL', showQIcon: false },
            themeOptions: { themeArn }
          };
          embeddedExperienceRef.current = await contextRef.current.embedGenerativeQnA(frameOptions, qnaOptions);
        }
      } catch (error) {
        console.error("Embedding failed:", error);
      }
    };

    if (embedUrl) embed();
    return () => { isMounted = false; };
  }, [embedUrl, activeTab]); 

  useEffect(() => {
    if (activeTab === 'Ask Data' && embeddedExperienceRef.current && initialQuestion) {
      embeddedExperienceRef.current.setQuestion(initialQuestion);
    }
  }, [initialQuestion, activeTab]);

  const isQMode = activeTab === 'Ask Data';

  return (
    <div className="w-full h-full rounded-2xl border border-slate-800 bg-[#020617] overflow-hidden relative">
      <div 
        ref={containerRef} 
        style={{ 
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