import React, { useEffect, useRef, useState } from 'react';

export const VoiceVisualizer: React.FC = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    // Init Audio Context
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyzerNode = ctx.createAnalyser();
        analyzerNode.fftSize = 64; // Low resolution for chunkier bars
        
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyzerNode);
        
        sourceRef.current = source;
        setAudioContext(ctx);
        setAnalyser(analyzerNode);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initAudio();

    return () => {
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContext) audioContext.close();
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Config
    const barWidth = 4;
    const gap = 2;
    // We only want ~5-8 bars for the "pill" look
    const barsToRender = 6;
    const startIndex = 2; // Skip very low freqs

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const totalWidth = barsToRender * (barWidth + gap);
      let x = centerX - (totalWidth / 2);

      // Draw mirrored bars from center? Or just simple bars
      for (let i = 0; i < barsToRender; i++) {
        // Map index to frequency data
        const val = dataArray[startIndex + i * 2] || 0; 
        
        // Normalize height constraints
        const height = Math.max(4, (val / 255) * canvas.height * 0.8);
        
        // Style
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (val / 255) * 0.6})`;
        
        // Draw rounded rect (simplified as rect)
        const y = (canvas.height - height) / 2;
        
        // Rounded caps hack: draw line with thick stroke
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = barWidth;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + (val/255)*0.5})`;
        ctx.moveTo(x + barWidth/2, clamp(canvas.height/2 - height/2, 2, canvas.height-2));
        ctx.lineTo(x + barWidth/2, clamp(canvas.height/2 + height/2, 2, canvas.height-2));
        ctx.stroke();

        x += barWidth + gap;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [analyser]);

  return (
    <div className="voice-visualizer">
       <canvas ref={canvasRef} width={60} height={30} />
    </div>
  );
};

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
