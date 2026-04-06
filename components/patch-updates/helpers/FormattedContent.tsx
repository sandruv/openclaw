'use client';

import Image from 'next/image';
import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import '@/styles/thread-content.css';

interface FormattedContentProps {
  content: string;
  onImageClick?: (src: string, alt: string) => void;
  compact?: boolean;
  maxLength?: number;
}

export function FormattedContent({ 
  content, 
  onImageClick, 
  compact = false, 
  maxLength 
}: FormattedContentProps) {
  // Helper function to determine if we should use Next.js Image or regular img
  const shouldUseNextImage = (src: string) => {
    if (!src) return false;
    // Use regular img for CID references (email attachments)
    if (src.startsWith('cid:')) return false;
    // Use regular img for data URLs (base64 images)
    if (src.startsWith('data:')) return false;
    // Use Next.js Image for HTTP/HTTPS URLs
    return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/');
  };

  // If compact mode and no onImageClick, use simple text rendering
  if (compact && !onImageClick) {
    const textContent = content.replace(/<[^>]*>/g, '');
    if (maxLength && textContent.length > maxLength) {
      return <span>{textContent.substring(0, maxLength) + '...'}</span>;
    }
    return <span>{textContent}</span>;
  }

  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Handle images - make them clickable if onImageClick is provided
        if (domNode.name === 'img') {
          const src = domNode.attribs.src;
          const alt = domNode.attribs.alt || "Image";
          const width = domNode.attribs.width ? parseInt(domNode.attribs.width) : 400;
          const height = domNode.attribs.height ? parseInt(domNode.attribs.height) : 200;

          // Always make images clickable if they have a valid src and onImageClick is provided
          if (src && onImageClick) {
            return shouldUseNextImage(src) ? (
              <Image 
                src={src} 
                alt={alt} 
                width={Math.min(width, 600)}
                height={height}
                className="cursor-pointer hover:opacity-90 transition-opacity max-w-full rounded-md border border-gray-200 dark:border-gray-700 block my-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onImageClick(src, alt);
                }}
                style={{ 
                  maxHeight: compact ? '150px' : '300px', 
                  width: 'auto',
                  display: 'block'
                }}
                unoptimized
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={src} 
                  alt={alt} 
                  width={Math.min(width, 600)}
                  height="auto"
                  className="cursor-pointer hover:opacity-90 transition-opacity max-w-full rounded-md border border-gray-200 dark:border-gray-700 block my-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onImageClick(src, alt);
                  }}
                  style={{ 
                    maxHeight: compact ? '150px' : '300px', 
                    width: 'auto',
                    display: 'block'
                  }}
                />
              </>
            );
          }

          // If no onImageClick, render image without click handler
          if (src) {
            return shouldUseNextImage(src) ? (
              <Image 
                src={src} 
                alt={alt} 
                width={Math.min(width, 600)}
                height={height}
                className="max-w-full rounded-md border border-gray-200 dark:border-gray-700 block my-2"
                style={{ 
                  maxHeight: compact ? '150px' : '300px', 
                  width: 'auto',
                  display: 'block'
                }}
                unoptimized
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={src} 
                  alt={alt} 
                  width={Math.min(width, 600)}
                  height="auto"
                  className="max-w-full rounded-md border border-gray-200 dark:border-gray-700 block my-2"
                  style={{ 
                    maxHeight: compact ? '150px' : '300px', 
                    width: 'auto',
                    display: 'block'
                  }}
                />
              </>
            );
          }
          
          // Fallback for images without valid src
          return (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 text-center text-gray-500 dark:text-gray-400 my-2">
              <p>Image not available</p>
              {alt && <p className="text-xs mt-1">{alt}</p>}
            </div>
          );
        }
        
        // Handle paragraphs - remove default margins and process children
        if (domNode.name === 'p') {
          return (
            <p className="m-0 mb-1">
              {domToReact(domNode.children as any, parserOptions)}
            </p>
          );
        }
        
        // Handle headings - remove default margins
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(domNode.name)) {
          const HeadingTag = domNode.name as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag className="m-0 mb-1 font-semibold">
              {domToReact(domNode.children as any, parserOptions)}
            </HeadingTag>
          );
        }
        
        // Handle lists - minimize spacing
        if (domNode.name === 'ul') {
          return (
            <ul className="m-0 mb-1 pl-4">
              {domToReact(domNode.children as any, parserOptions)}
            </ul>
          );
        }
        
        if (domNode.name === 'ol') {
          return (
            <ol className="m-0 mb-1 pl-4">
              {domToReact(domNode.children as any, parserOptions)}
            </ol>
          );
        }
        
        if (domNode.name === 'li') {
          return (
            <li className="m-0">
              {domToReact(domNode.children as any, parserOptions)}
            </li>
          );
        }
        
        // Handle blockquotes
        if (domNode.name === 'blockquote') {
          return (
            <blockquote className="m-0 mb-1 pl-4 border-l-4 border-gray-300 dark:border-gray-600 italic">
              {domToReact(domNode.children as any, parserOptions)}
            </blockquote>
          );
        }
        
        // Handle pre and code blocks
        if (domNode.name === 'pre') {
          return (
            <pre className="m-0 mb-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto">
              {domToReact(domNode.children as any, parserOptions)}
            </pre>
          );
        }
        
        // Handle code inline
        if (domNode.name === 'code') {
          return (
            <code className="m-0 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-sm font-mono text-sm">
              {domToReact(domNode.children as any, parserOptions)}
            </code>
          );
        }
        
        // Handle links
        if (domNode.name === 'a') {
          return (
            <a 
              href={domNode.attribs.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {domToReact(domNode.children as any, parserOptions)}
            </a>
          );
        }
        
        // Handle divs and spans - remove margins and process children
        if (domNode.name === 'div') {
          return (
            <div className="m-0">
              {domToReact(domNode.children as any, parserOptions)}
            </div>
          );
        }
        
        if (domNode.name === 'span') {
          return (
            <span className="m-0">
              {domToReact(domNode.children as any, parserOptions)}
            </span>
          );
        }
      }
    }
  };

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${compact ? 'text-sm' : ''}`}>
      {parse(content || '', parserOptions)}
    </div>
  );
}
