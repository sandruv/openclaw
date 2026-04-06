import { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface GoogleAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onManualInput?: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

// Add styles for the Google Places Autocomplete dropdown
const pacContainerStyles = `
  .pac-container {
    z-index: 9999 !important;
    position: fixed !important;
    background-color: white;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 0.12), 0 2px 4px -1px rgba(255, 255, 255, 0.06);
    margin-top: 4px;
    font-family: inherit;
  }
  .pac-item {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .pac-item:hover {
    background-color: #f7fafc;
  }
`;

export function GoogleAutocomplete({
  onPlaceSelect,
  onManualInput,
  placeholder = "Enter a location",
  className = "",
  defaultValue = "",
  disabled = false,
}: GoogleAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [lastSelectedPlace, setLastSelectedPlace] = useState<string>("");

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let autocompleteInstance: google.maps.places.Autocomplete | null = null;

    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = initializeAutocomplete;
    };

    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { 
          types: ['address'],
          componentRestrictions: { country: 'us' }
        }
      );

      // Add styles to ensure dropdown appears above dialog
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(pacContainerStyles));
      document.head.appendChild(style);

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance?.getPlace();
        if (place && place.formatted_address) {
          setInputValue(place.formatted_address);
          setLastSelectedPlace(place.formatted_address);
          onPlaceSelect(place);
        }
      });

      // Add a MutationObserver to handle dynamically added .pac-container
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.classList.contains('pac-container')) {
              node.style.zIndex = '9999';
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setAutocomplete(autocompleteInstance);
    };

    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeAutocomplete();
    }

    return () => {
      // Clean up
      if (observer) {
        observer.disconnect();
      }
      if (autocompleteInstance) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [onPlaceSelect]);

  // Handle manual input changes with debouncing
  useEffect(() => {
    if (onManualInput && inputValue && inputValue !== lastSelectedPlace) {
      const timeoutId = setTimeout(() => {
        // Only call onManualInput if the value is still different from lastSelectedPlace
        // This prevents calling it when a place is selected from dropdown
        if (inputValue !== lastSelectedPlace) {
          onManualInput(inputValue);
        }
      }, 500); // 500ms delay to allow place selection to complete
      
      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, lastSelectedPlace, onManualInput]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
