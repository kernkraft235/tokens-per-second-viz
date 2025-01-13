import React, { useState, useRef, useEffect } from 'react';

const messageContent = `Let me explain how React's virtual DOM helps optimize performance in web applications. The virtual DOM is a lightweight copy of the actual DOM that React maintains in memory.

When state changes occur in a React application, instead of directly manipulating the real DOM (which is computationally expensive), React first updates its virtual DOM and then compares it with the previous version to determine the minimal set of changes needed.

Here's a simple example of how React components work with state:

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

Some key benefits of using React's virtual DOM include:

- Improved performance through batch updates
- Automatic handling of DOM manipulation
- Cross-platform compatibility
- Simplified debugging process
- Better memory management

The reconciliation process, which is React's algorithm for diffing one tree with another, ensures that component updates are predictable while being fast enough for high-performance applications.`;

let sharedPosition = 0;

const generateNextChunk = () => {
  const chunkSize = Math.floor(Math.random() * 3) + 2;
  const chunk = messageContent.slice(sharedPosition, sharedPosition + chunkSize);
  sharedPosition = (sharedPosition + chunkSize) % messageContent.length;
  if (sharedPosition >= messageContent.length - chunkSize) {
    sharedPosition = 0;
  }
  return chunk;
};

const processMarkdown = (text) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let result = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      result.push(
        <span key={lastIndex} className="text-white">
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    // Add code block
    result.push(
      <div key={match.index} className="my-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
        <pre className="text-white">
          <code>{match[2]}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(
      <span key={lastIndex} className="text-white">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return result;
};

const VisualizerPanel = ({ side, tps, setTps, isGenerating }) => {
  const [output, setOutput] = useState('');
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (isGenerating && tps) {
      setOutput('');
      const delay = 1000 / tps;

      const updateOutput = () => {
        const now = Date.now();
        if (now - lastUpdateRef.current >= delay) {
          setOutput(prev => prev + generateNextChunk());
          lastUpdateRef.current = now;
        }
      };

      intervalRef.current = setInterval(updateOutput, delay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGenerating, tps]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={tps}
          onChange={(e) => setTps(Number(e.target.value))}
          className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white px-4 py-2"
          placeholder="Tokens per second"
        />
      </div>
      
      <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg relative">
        <div className="absolute inset-0 p-4">
          <div 
            className="font-mono text-sm whitespace-pre-wrap absolute inset-4 overflow-y-auto"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {processMarkdown(output)}
          </div>
        </div>
      </div>
    </div>
  );
};

const TokensPerSecondVisualizer = () => {
  const [leftTps] = useState(8);
  const [rightTps] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="fixed inset-0 bg-zinc-900 flex flex-col">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-semibold text-white">Tokens Per Second Comparison</h1>
        <button
          onClick={() => {
            sharedPosition = 0;  // Reset shared position on start/stop
            setIsGenerating(!isGenerating);
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            isGenerating 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isGenerating ? 'Stop' : 'Start'}
        </button>
      </div>
      <div className="flex flex-1 divide-x divide-zinc-700">
        <div className="w-1/2 p-4">
          <VisualizerPanel side="left" tps={leftTps} setTps={setLeftTps} isGenerating={isGenerating} />
        </div>
        <div className="w-1/2 p-4">
          <VisualizerPanel side="right" tps={rightTps} setTps={setRightTps} isGenerating={isGenerating} />
        </div>
      </div>
    </div>
  );
};

export default TokensPerSecondVisualizer;
