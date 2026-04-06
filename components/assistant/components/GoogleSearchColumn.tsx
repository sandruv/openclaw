import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ExternalLink, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useGoogleStore } from '@/stores/useGoogleStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import styles from '@/styles/GoogleSearchColumn.module.css';

export function GoogleSearchColumn() {
  const { search_results, isLoading, query, generateSearch, setQuery } = useGoogleStore();
  const [inputValue, setInputValue] = useState(query);
  const [currentPage, setCurrentPage] = useState(0);
  const resultsPerPage = 5;

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    // Reset to first page when new search results come in
    setCurrentPage(0);
  }, [search_results]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    await generateSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(Math.ceil(search_results.length / resultsPerPage) - 1, prev + 1));
  };

  const getCurrentPageResults = () => {
    const startIndex = currentPage * resultsPerPage;
    return search_results.slice(startIndex, startIndex + resultsPerPage);
  };

  const canGoPrevious = currentPage > 0;
  const canGoNext = (currentPage + 1) * resultsPerPage < search_results.length;

  return (
    <Card className="border-1 rounded-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-2 border-b">
        <Image
          src="/google-logo.png"
          width={24}
          height={24}
          alt="Google Search"
          className="rounded-sm mt-1"
        />
        <CardTitle className="text-xl mt-0">Google Search</CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <div className="p-4 flex items-center gap-2 border-b">
          <Search className="w-4 h-4 text-gray-400" />
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyUp={handleKeyPress}
              className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <div className="flex items-center gap-1">
              {canGoPrevious && (
                <Button
                  variant="ghost"
                  onClick={handlePrevPage}
                  className="h-8"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              {canGoNext && (
                <Button
                  variant="ghost"
                  onClick={handleNextPage}
                  className="h-8"
                >
                  Next
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className={cn("h-[calc(100vh-200px)]", styles.scrollarea)}>
          <div className="p-4 space-y-4 min-w-0">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="w-3/4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="mt-2 h-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && search_results.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Enter a search query to get started</p>
              </div>
            )}

            {getCurrentPageResults().map((result: any, index) => (
              <a
                key={index}
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="border border-gray-200 rounded-lg hover:border-blue-500 transition-colors w-full cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-blue-600 hover:underline line-clamp-2">
                        {result.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                    {result.thumbnail && (
                      <Image 
                        src={result.thumbnail} 
                        alt={result.title}
                        width={200}
                        height={150}
                        className="mt-2 rounded-md object-contain"
                      />
                    )}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{result.snippet}</p>
                    <p className="text-xs text-gray-400 mt-2 truncate">{result.link}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
