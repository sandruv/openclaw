'use client';

import { useGoogleStore } from '@/stores/useGoogleStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

export function GoogleSearch() {
  const { search_results, isLoading } = useGoogleStore();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[450px]" />
            <Skeleton className="h-3 w-[400px]" />
          </div>
        ))}
      </div>
    );
  }

  if (!search_results || search_results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No search results found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <div className="text-sm text-muted-foreground">
          About {search_results.length} results
        </div>

        {search_results?.map((result, index) => (
          <div key={index} className="max-w-3xl">
            <div className="flex items-start gap-4">
              {result.thumbnail && (
                <div className="flex-shrink-0">
                  <Image
                    src={result.thumbnail}
                    alt={result.title}
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground truncate">
                      {result.link.replace(/^https?:\/\/(www\.)?/, '')}
                      <ExternalLink className="inline-block ml-1 h-3 w-3" />
                    </div>
                    <a 
                      href={result.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block text-lg font-medium text-blue-600 hover:underline mt-0.5 line-clamp-2"
                    >
                      {result.title}
                    </a>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                  {result.snippet}
                </p>
                {result.image && (
                  <div className="mt-2">
                    <Image
                      src={result.image}
                      alt={result.title}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
