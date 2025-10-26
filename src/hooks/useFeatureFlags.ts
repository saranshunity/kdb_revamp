import { useState, useEffect } from 'react';
import MetadataService from '../services/MetadataService';
import { FeatureConfig } from '../types/metadata';

interface UseFeatureFlagsReturn {
  features: FeatureConfig | null;
  isFeatureEnabled: (feature: keyof FeatureConfig) => boolean;
  isLoading: boolean;
}

/**
 * Hook to access feature flags from metadata
 * @returns Feature flags object and helper function
 */
export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const [features, setFeatures] = useState<FeatureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        await MetadataService.fetchMetadata();
        const metadata = MetadataService.getMetadata();
        setFeatures(metadata?.features || null);
      } catch (error) {
        console.error('Error loading feature flags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatures();
  }, []);

  const isFeatureEnabled = (feature: keyof FeatureConfig): boolean => {
    return features?.[feature]?.enabled ?? false;
  };

  return {
    features,
    isFeatureEnabled,
    isLoading,
  };
};

export default useFeatureFlags;
