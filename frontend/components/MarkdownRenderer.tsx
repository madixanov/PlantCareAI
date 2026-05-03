'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown renderer for AI responses
 * Supports: headings (#, ##, ###), bold (**text**), lists (-, *), and line breaks
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 my-3 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-800">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        flushList();
        elements.push(<div key={`space-${index}`} className="h-2" />);
        return;
      }

      // Heading 1 (# )
      if (trimmedLine.startsWith('# ')) {
        flushList();
        const text = trimmedLine.substring(2);
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {renderInlineFormatting(text)}
          </h1>
        );
        return;
      }

      // Heading 2 (## )
      if (trimmedLine.startsWith('## ')) {
        flushList();
        const text = trimmedLine.substring(3);
        elements.push(
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-3 mb-2">
            {renderInlineFormatting(text)}
          </h2>
        );
        return;
      }

      // Heading 3 (### )
      if (trimmedLine.startsWith('### ')) {
        flushList();
        const text = trimmedLine.substring(4);
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-2 mb-1">
            {renderInlineFormatting(text)}
          </h3>
        );
        return;
      }

      // List items (- or * at start)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const text = trimmedLine.substring(2);
        listItems.push(text);
        return;
      }

      // Numbered list (1. 2. etc)
      if (/^\d+\.\s/.test(trimmedLine)) {
        flushList();
        const text = trimmedLine.replace(/^\d+\.\s/, '');
        listItems.push(text);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-gray-800 leading-relaxed my-2">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });

    // Flush any remaining list items
    flushList();

    return elements;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Handle bold text (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.substring(2, part.length - 2);
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`markdown-content ${className}`}>
      {renderContent()}
    </div>
  );
}

// Made with Bob