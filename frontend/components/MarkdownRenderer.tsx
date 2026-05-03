'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Enhanced markdown renderer for AI responses
 * Supports: headings, bold, italic, code, lists, blockquotes, and more
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let numberedListItems: string[] = [];
    let codeBlock: string[] = [];
    let inCodeBlock = false;
    let inList = false;
    let listKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="space-y-3 my-5 ml-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start group animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 text-base font-bold mr-3 mt-0.5 flex-shrink-0 group-hover:from-primary-200 group-hover:to-primary-300 transition-all shadow-sm">
                  •
                </span>
                <span className="text-gray-800 leading-relaxed flex-1 pt-0.5">
                  {renderInlineFormatting(item)}
                </span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      if (numberedListItems.length > 0) {
        elements.push(
          <ol key={`numlist-${listKey++}`} className="space-y-3 my-5 ml-1">
            {numberedListItems.map((item, idx) => (
              <li key={idx} className="flex items-start group animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white text-sm font-bold mr-3 mt-0.5 flex-shrink-0 group-hover:from-primary-600 group-hover:to-primary-700 transition-all shadow-md">
                  {idx + 1}
                </span>
                <span className="text-gray-800 leading-relaxed flex-1 pt-0.5">
                  {renderInlineFormatting(item)}
                </span>
              </li>
            ))}
          </ol>
        );
        numberedListItems = [];
        inList = false;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlock.length > 0) {
        elements.push(
          <pre key={`code-${listKey++}`} className="bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto">
            <code className="text-sm font-mono">{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Code block toggle
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      // Inside code block
      if (inCodeBlock) {
        codeBlock.push(line);
        return;
      }

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        // Only flush list if we're not in the middle of one
        if (!inList) {
          flushList();
        }
        // Don't add extra spacing between list items
        if (!inList) {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
        return;
      }

      // Blockquote (> )
      if (trimmedLine.startsWith('> ')) {
        flushList();
        const text = trimmedLine.substring(2);
        elements.push(
          <blockquote key={index} className="border-l-4 border-primary-500 bg-primary-50 pl-4 py-3 my-4 italic text-gray-700 rounded-r-lg">
            {renderInlineFormatting(text)}
          </blockquote>
        );
        return;
      }

      // Heading 1 (# )
      if (trimmedLine.startsWith('# ')) {
        flushList();
        const text = trimmedLine.substring(2);
        elements.push(
          <h1 key={index} className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mt-8 mb-4 pb-3 border-b-2 border-primary-200">
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
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-4 flex items-center">
            <span className="w-1.5 h-7 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3 shadow-sm"></span>
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
          <h3 key={index} className="text-xl font-semibold text-gray-800 mt-5 mb-3">
            {renderInlineFormatting(text)}
          </h3>
        );
        return;
      }

      // Horizontal rule (---)
      if (trimmedLine === '---' || trimmedLine === '***') {
        flushList();
        elements.push(
          <hr key={index} className="my-6 border-t-2 border-gray-200" />
        );
        return;
      }

      // List items (- or * at start)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const text = trimmedLine.substring(2);
        listItems.push(text);
        inList = true;
        return;
      }

      // Numbered list (1. 2. etc) - Don't flush, just add to array
      if (/^\d+\.\s/.test(trimmedLine)) {
        const text = trimmedLine.replace(/^\d+\.\s/, '');
        numberedListItems.push(text);
        inList = true;
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-gray-800 leading-relaxed my-4 text-base">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });

    // Flush any remaining items
    flushList();
    flushCodeBlock();

    return elements;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    let currentText = text;
    let key = 0;

    // Process inline code first (`code`)
    const codeRegex = /`([^`]+)`/g;
    const codeParts = currentText.split(codeRegex);
    
    codeParts.forEach((part, index) => {
      if (index % 2 === 1) {
        // This is code
        elements.push(
          <code key={`code-${key++}`} className="bg-gray-100 text-primary-600 px-2 py-0.5 rounded text-sm font-mono">
            {part}
          </code>
        );
      } else {
        // Process bold and italic
        const formatted = processBoldAndItalic(part, key);
        elements.push(...formatted);
        key += formatted.length;
      }
    });

    return elements;
  };

  const processBoldAndItalic = (text: string, startKey: number): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let key = startKey;

    // Handle bold (**text**) and italic (*text* or _text_)
    const regex = /(\*\*.*?\*\*|\*.*?\*|_.*?_)/g;
    const parts = text.split(regex);

    parts.forEach((part, index) => {
      if (!part) return;

      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.substring(2, part.length - 2);
        elements.push(
          <strong key={`bold-${key++}`} className="font-bold text-gray-900">
            {boldText}
          </strong>
        );
      }
      // Italic
      else if ((part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) ||
               (part.startsWith('_') && part.endsWith('_'))) {
        const italicText = part.substring(1, part.length - 1);
        elements.push(
          <em key={`italic-${key++}`} className="italic text-gray-700">
            {italicText}
          </em>
        );
      }
      // Regular text
      else {
        elements.push(<span key={`text-${key++}`}>{part}</span>);
      }
    });

    return elements;
  };

  return (
    <div className={`markdown-content prose prose-primary max-w-none ${className}`}>
      {renderContent()}
    </div>
  );
}

// Made with Bob