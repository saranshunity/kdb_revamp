declare module 'react-native' {
  interface NativeModulesStatic {
    DocumentPicker: {
      pick(): Promise<{
        uri: string;
        name: string;
        size: number;
        type: string;
      } | null>;
    };
  }
}
