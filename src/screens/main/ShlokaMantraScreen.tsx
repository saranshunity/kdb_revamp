import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, BodyText, H3 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import storage from '@react-native-firebase/storage';
import { WebView } from 'react-native-webview';

type ShlokaMantraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShlokaMantra'>;

interface Shloka {
  id: string;
  title: string;
  number: number;
  description?: string;
  text: string;
  audioUrl: string;
}

// 18 Shlokas from Bhagavad Gita
const SHLOKAS: Shloka[] = [
  {
    id: 'shloka-1',
    title: 'Shloka 1',
    number: 1,
    description: 'Bhagavad Gita Shloka 1',
    text: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||',
    audioUrl: 'shlokaAudio/firstShlokaAudio.mp3',
  },
  {
    id: 'shloka-2',
    title: 'Shloka 2',
    number: 2,
    description: 'Bhagavad Gita Shloka 2',
    text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||',
    audioUrl: 'shlokaAudio/secondShloka.mp3',
  },
  {
    id: 'shloka-3',
    title: 'Shloka 3',
    number: 3,
    description: 'Bhagavad Gita Shloka 3',
    text: 'कर्मणैव हि संसिद्धिमास्थिता जनकादय: |\nलोकसंग्रहमेवापि सम्पश्यन्कर्तुमर्हसि ||',
    audioUrl: 'shlokaAudio/thirdShloka.mp3',
  },
  {
    id: 'shloka-4',
    title: 'Shloka 4',
    number: 4,
    description: 'Bhagavad Gita Shloka 4',
    text: 'एवं ज्ञात्वा कृतं कर्म पूर्वैरपि मुमुक्षुभि: |\nकुरु कर्मैव तस्मात्त्वं पूर्वै: पूर्वतरं कृतम् ||',
    audioUrl: 'shlokaAudio/fourthShloka.mp3',
  },
  {
    id: 'shloka-5',
    title: 'Shloka 5',
    number: 5,
    description: 'Bhagavad Gita Shloka 5',
    text: 'ब्रह्मण्याधाय कर्माणि सङ्गं त्यक्त्वा करोति य:|\nलिप्यते न स पापेन पद्मपत्रमिवाम्भसा ||',
    audioUrl: 'shlokaAudio/fifthShloka.mp3',
  },
  {
    id: 'shloka-6',
    title: 'Shloka 6',
    number: 6,
    description: 'Bhagavad Gita Shloka 6',
    text: 'आत्मौपम्येन सर्वत्र समं पश्यति योऽर्जुन |\nसुखं वा यदि वा दु:खं स योगी परमो मत: ||',
    audioUrl: 'shlokaAudio/sixthShloka.mp3',
  },
  {
    id: 'shloka-7',
    title: 'Shloka 7',
    number: 7,
    description: 'Bhagavad Gita Shloka 7',
    text: 'मत्त: परतरं नान्यत्किञ्चिदस्ति धनञ्जय |\nमयि सर्वमिदं प्रोतं सूत्रे मणिगणा इव ||',
    audioUrl: 'shlokaAudio/seventhShloka.mp3',
  },
  {
    id: 'shloka-8',
    title: 'Shloka 8',
    number: 8,
    description: 'Bhagavad Gita Shloka 8',
    text: 'तस्मात्सर्वेषु कालेषु मामनुस्मर युध्य च |\nमय्यर्पितमनोबुद्धिर्मामेवैष्यस्यसंशयम् ||',
    audioUrl: 'shlokaAudio/eighthShloka.mp3',
  },
  {
    id: 'shloka-9',
    title: 'Shloka 9',
    number: 9,
    description: 'Bhagavad Gita Shloka 9',
    text: 'मयाध्यक्षेण प्रकृति: सूयते सचराचरम् |\nहेतुनानेन कौन्तेय जगद्विपरिवर्तते ||',
    audioUrl: 'shlokaAudio/ninthShloka.mp3',
  },
  {
    id: 'shloka-10',
    title: 'Shloka 10',
    number: 10,
    description: 'Bhagavad Gita Shloka 10',
    text: 'महर्षय: सप्त पूर्वे चत्वारो मनवस्तथा |\nमद्भावा मानसा जाता येषां लोक इमा: प्रजा: ||',
    audioUrl: 'shlokaAudio/tenthShloka.mp3',
  },
  {
    id: 'shloka-11',
    title: 'Shloka 11',
    number: 11,
    description: 'Bhagavad Gita Shloka 11',
    text: 'दिवि सूर्यसहस्रस्य भवेद्युगपदुत्थिता |\nयदि भा: सदृशी सा स्याद्भासस्तस्य महात्मन: ||',
    audioUrl: 'shlokaAudio/eleventhShloka.mp3',
  },
  {
    id: 'shloka-12',
    title: 'Shloka 12',
    number: 12,
    description: 'Bhagavad Gita Shloka 12',
    text: 'सन्नियम्येन्द्रियग्रामं सर्वत्र समबुद्धय: |\nते प्राप्नुवन्ति मामेव सर्वभूतहिते रता: ||',
    audioUrl: 'shlokaAudio/twelveShloka.mp3',
  },
  {
    id: 'shloka-13',
    title: 'Shloka 13',
    number: 13,
    description: 'Bhagavad Gita Shloka 13',
    text: 'बहिरन्तश्च भूतानामचरं चरमेव च |\nसूक्ष्मत्वात्तदविज्ञेयं दूरस्थं चान्तिके च तत् ||',
    audioUrl: 'shlokaAudio/thirteenthShloka.mp3',
  },
  {
    id: 'shloka-14',
    title: 'Shloka 14',
    number: 14,
    description: 'Bhagavad Gita Shloka 14',
    text: 'कर्मण: सुकृतस्याहु: सात्विकं निर्मलं फलम् |\nरजसस्तु फलं दु:खमज्ञानं तमस: फलम् ||',
    audioUrl: 'shlokaAudio/fourteenShloka.mp3',
  },
  {
    id: 'shloka-15',
    title: 'Shloka 15',
    number: 15,
    description: 'Bhagavad Gita Shloka 15',
    text: 'शरीरं यदवाप्नोति यच्चाप्युत्क्रामतीश्वर: |\nगृहीत्वैतानि संयाति वायुर्गन्धानिवाशयात् ||',
    audioUrl: 'shlokaAudio/fiteenthShloka.mp3',
  },
  {
    id: 'shloka-16',
    title: 'Shloka 16',
    number: 16,
    description: 'Bhagavad Gita Shloka 16',
    text: 'दैवी सम्पद्विमोक्षाय निबन्धायासुरी मता |\nमा शुच: सम्पदं दैवीमभिजातोऽसि पाण्डव ||',
    audioUrl: 'shlokaAudio/sixteenthShloka.mp3',
  },
  {
    id: 'shloka-17',
    title: 'Shloka 17',
    number: 17,
    description: 'Bhagavad Gita Shloka 17',
    text: 'सद्भावे साधुभावे च सदित्येतत्प्रयुज्यते |\nप्रशस्ते कर्मणि तथा सच्छब्द: पार्थ युज्यते ||',
    audioUrl: 'shlokaAudio/seventeenthShloka.mp3',
  },
  {
    id: 'shloka-18',
    title: 'Shloka 18',
    number: 18,
    description: 'Bhagavad Gita Shloka 18',
    text: 'यत्र योगेश्वर: कृष्णो यत्र पार्थो धनुर्धर: |\nतत्र श्रीर्विजयो भूतिध्रुवा नीतिर्मतिर्मम ||',
    audioUrl: 'shlokaAudio/eighteenthShloka.mp3',
  },
];

const ShlokaMantraScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ShlokaMantraScreenNavigationProp>();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<{ [key: string]: string }>({});

  const animatedHeights = useRef<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    SHLOKAS.forEach(shloka => {
      if (!animatedHeights.current[shloka.id]) {
        animatedHeights.current[shloka.id] = new Animated.Value(0);
      }
    });
  }, []);


  const toggleExpand = async (id: string) => {
    const isExpanding = expandedId !== id;
    setExpandedId(isExpanding ? id : null);

    // Fetch audio URL from Firebase when expanding
    if (isExpanding) {
      const shloka = SHLOKAS.find(s => s.id === id);
      if (shloka && !audioUrls[id]) {
        try {
          setError(null);
          console.log('Fetching audio URL for:', shloka.audioUrl);
          const url = await storage().ref(shloka.audioUrl).getDownloadURL();
          setAudioUrls(prev => ({ ...prev, [id]: url }));
          console.log('Audio URL fetched:', url);
        } catch (error: any) {
          console.error('Error fetching audio URL:', error);
          setError(`Failed to load audio: ${error.message || 'Unknown error'}`);
        }
      }
    }

    Animated.timing(animatedHeights.current[id], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Generate HTML for audio player
  const generateAudioPlayerHTML = (audioUrl: string, shlokaText: string) => {
    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
      const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const escapedText = escapeHtml(shlokaText).replace(/\n/g, '<br>');
    const escapedUrl = escapeHtml(audioUrl);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f9fafb;
              padding: 16px;
              color: #000000;
            }
            .shloka-text {
              background-color: #f3f4f6;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 16px;
              text-align: center;
              font-size: 16px;
              line-height: 24px;
              white-space: pre-line;
            }
            .audio-container {
              background-color: #ffffff;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            audio {
              width: 100%;
              outline: none;
            }
            .loading {
              text-align: center;
              padding: 20px;
              color: #666666;
            }
          </style>
        </head>
        <body>
          <div class="shloka-text">${escapedText}</div>
          <div class="audio-container">
            <audio controls autoplay>
              <source src="${escapedUrl}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        </body>
      </html>
    `;
  };

  const renderAudioPlayer = (shloka: Shloka) => {
    const audioUrl = audioUrls[shloka.id];

    return (
      <View style={styles.audioPlayer}>
        {error && (
          <View style={styles.errorContainer}>
            <BodyText color={COLORS.error} size="sm" style={styles.errorText}>
              {error}
            </BodyText>
          </View>
        )}

        {!audioUrl ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <BodyText color={COLORS.text.secondary} size="sm" style={styles.loadingText}>
              Loading audio...
            </BodyText>
          </View>
        ) : (
          <WebView
            source={{ html: generateAudioPlayerHTML(audioUrl, shloka.text) }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
              setError('Failed to load audio player');
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView HTTP error: ', nativeEvent);
              setError(`HTTP error: ${nativeEvent.statusCode}`);
            }}
          />
        )}
      </View>
    );
  };

  const renderShlokaItem = ({ item }: { item: Shloka }) => {
    const isExpanded = expandedId === item.id;
    const animatedHeight = animatedHeights.current[item.id];

    return (
      <View style={styles.shlokaItemContainer}>
        <TouchableOpacity
          style={styles.shlokaItem}
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.shlokaNumberContainer}>
            <BodyText
              color={COLORS.primary}
              size="sm"
              weight="bold"
            >
              {item.number}
            </BodyText>
          </View>
          <View style={styles.shlokaContent}>
            <BodyText
              color={COLORS.text.primary}
              size="md"
              weight="semiBold"
            >
              {item.title}
            </BodyText>
            {item.description && (
              <BodyText
                color={COLORS.text.secondary}
                size="sm"
              >
                {item.description}
              </BodyText>
            )}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            style={[
              styles.expandableContent,
              {
                opacity: animatedHeight,
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 600],
                }),
              },
            ]}
          >
            {renderAudioPlayer(item)}
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H3 color={COLORS.text.primary} weight="semiBold" size="xl">
          18 Shlokas
        </H3>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={SHLOKAS}
        keyExtractor={(item) => item.id}
        renderItem={renderShlokaItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  shlokaItemContainer: {
    marginBottom: 12,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: 'hidden',
  },
  shlokaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  shlokaNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shlokaContent: {
    flex: 1,
  },
  expandableContent: {
    overflow: 'hidden',
  },
  audioPlayer: {
    padding: 16,
    paddingTop: 0,
    height: 230,
  },
  webView: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  errorText: {
    textAlign: 'center',
  },
});

export default ShlokaMantraScreen;
