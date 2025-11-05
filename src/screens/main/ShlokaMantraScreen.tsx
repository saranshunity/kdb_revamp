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
import { H2, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import storage from '@react-native-firebase/storage';

type ShlokaMantraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShlokaMantra'>;

interface Shloka {
  id: string;
  title: string;
  number: number;
  description?: string;
  text: string; // Sanskrit text
  audioUrl: string; // Firebase storage path
}

// 18 Shlokas from Bhagavad Gita
const SHLOKAS: Shloka[] = [
  {
    id: 'shloka-1',
    title: 'Shloka 1',
    number: 1,
    description: 'Bhagavad Gita Shloka 1',
    text: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-2',
    title: 'Shloka 2',
    number: 2,
    description: 'Bhagavad Gita Shloka 2',
    text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-3',
    title: 'Shloka 3',
    number: 3,
    description: 'Bhagavad Gita Shloka 3',
    text: 'कर्मणैव हि संसिद्धिमास्थिता जनकादय: |\nलोकसंग्रहमेवापि सम्पश्यन्कर्तुमर्हसि ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-4',
    title: 'Shloka 4',
    number: 4,
    description: 'Bhagavad Gita Shloka 4',
    text: 'एवं ज्ञात्वा कृतं कर्म पूर्वैरपि मुमुक्षुभि: |\nकुरु कर्मैव तस्मात्त्वं पूर्वै: पूर्वतरं कृतम् ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-5',
    title: 'Shloka 5',
    number: 5,
    description: 'Bhagavad Gita Shloka 5',
    text: 'ब्रह्मण्याधाय कर्माणि सङ्गं त्यक्त्वा करोति य:|\nलिप्यते न स पापेन पद्मपत्रमिवाम्भसा ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-6',
    title: 'Shloka 6',
    number: 6,
    description: 'Bhagavad Gita Shloka 6',
    text: 'आत्मौपम्येन सर्वत्र समं पश्यति योऽर्जुन |\nसुखं वा यदि वा दु:खं स योगी परमो मत: ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-7',
    title: 'Shloka 7',
    number: 7,
    description: 'Bhagavad Gita Shloka 7',
    text: 'मत्त: परतरं नान्यत्किञ्चिदस्ति धनञ्जय |\nमयि सर्वमिदं प्रोतं सूत्रे मणिगणा इव ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-8',
    title: 'Shloka 8',
    number: 8,
    description: 'Bhagavad Gita Shloka 8',
    text: 'तस्मात्सर्वेषु कालेषु मामनुस्मर युध्य च |\nमय्यर्पितमनोबुद्धिर्मामेवैष्यस्यसंशयम् ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-9',
    title: 'Shloka 9',
    number: 9,
    description: 'Bhagavad Gita Shloka 9',
    text: 'मयाध्यक्षेण प्रकृति: सूयते सचराचरम् |\nहेतुनानेन कौन्तेय जगद्विपरिवर्तते ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-10',
    title: 'Shloka 10',
    number: 10,
    description: 'Bhagavad Gita Shloka 10',
    text: 'महर्षय: सप्त पूर्वे चत्वारो मनवस्तथा |\nमद्भावा मानसा जाता येषां लोक इमा: प्रजा: ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-11',
    title: 'Shloka 11',
    number: 11,
    description: 'Bhagavad Gita Shloka 11',
    text: 'दिवि सूर्यसहस्रस्य भवेद्युगपदुत्थिता |\nयदि भा: सदृशी सा स्याद्भासस्तस्य महात्मन: ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-12',
    title: 'Shloka 12',
    number: 12,
    description: 'Bhagavad Gita Shloka 12',
    text: 'सन्नियम्येन्द्रियग्रामं सर्वत्र समबुद्धय: |\nते प्राप्नुवन्ति मामेव सर्वभूतहिते रता: ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-13',
    title: 'Shloka 13',
    number: 13,
    description: 'Bhagavad Gita Shloka 13',
    text: 'बहिरन्तश्च भूतानामचरं चरमेव च |\nसूक्ष्मत्वात्तदविज्ञेयं दूरस्थं चान्तिके च तत् ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-14',
    title: 'Shloka 14',
    number: 14,
    description: 'Bhagavad Gita Shloka 14',
    text: 'कर्मण: सुकृतस्याहु: सात्विकं निर्मलं फलम् |\nरजसस्तु फलं दु:खमज्ञानं तमस: फलम् ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-15',
    title: 'Shloka 15',
    number: 15,
    description: 'Bhagavad Gita Shloka 15',
    text: 'शरीरं यदवाप्नोति यच्चाप्युत्क्रामतीश्वर: |\nगृहीत्वैतानि संयाति वायुर्गन्धानिवाशयात् ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-16',
    title: 'Shloka 16',
    number: 16,
    description: 'Bhagavad Gita Shloka 16',
    text: 'दैवी सम्पद्विमोक्षाय निबन्धायासुरी मता |\nमा शुच: सम्पदं दैवीमभिजातोऽसि पाण्डव ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-17',
    title: 'Shloka 17',
    number: 17,
    description: 'Bhagavad Gita Shloka 17',
    text: 'सद्भावे साधुभावे च सदित्येतत्प्रयुज्यते |\nप्रशस्ते कर्मणि तथा सच्छब्द: पार्थ युज्यते ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
  {
    id: 'shloka-18',
    title: 'Shloka 18',
    number: 18,
    description: 'Bhagavad Gita Shloka 18',
    text: 'यत्र योगेश्वर: कृष्णो यत्र पार्थो धनुर्धर: |\nतत्र श्रीर्विजयो भूतिध्रुवा नीतिर्मतिर्मम ||',
    audioUrl: 'श्रमदभगवदगत अष्टदश शलक  Bhagavad Gita 18 Shlokas.mp3',
  },
];

// Enable playback in silence mode
Sound.setCategory('Playback');

const ShlokaMantraScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ShlokaMantraScreenNavigationProp>();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [duration, setDuration] = useState<{ [key: string]: number }>({});

  const soundRef = useRef<Sound | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animatedHeights = useRef<{ [key: string]: Animated.Value }>({});

  // Initialize animated values for each shloka
  useEffect(() => {
    SHLOKAS.forEach(shloka => {
      if (!animatedHeights.current[shloka.id]) {
        animatedHeights.current[shloka.id] = new Animated.Value(0);
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const toggleExpand = (id: string) => {
    const isExpanding = expandedId !== id;

    // Stop audio if collapsing
    if (!isExpanding && playingId === id) {
      stopAudio();
    }
    setExpandedId(isExpanding ? id : null);

    // Animate height
    Animated.timing(animatedHeights.current[id], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const loadAudio = async (shloka: Shloka): Promise<Sound | null> => {
    try {
      setLoadingAudio(shloka.id);

      // Get download URL from Firebase Storage
      const url = await storage().ref(shloka.audioUrl).getDownloadURL();

      return new Promise((resolve, reject) => {
        const sound = new Sound(url, '', (error) => {
          setLoadingAudio(null);

          if (error) {
            console.error('Failed to load audio:', error);
            reject(error);
            return;
          }

          // Set duration
          setDuration(prev => ({ ...prev, [shloka.id]: sound.getDuration() }));
          resolve(sound);
        });
      });
    } catch (error) {
      console.error('Error loading audio from Firebase:', error);
      setLoadingAudio(null);
      return null;
    }
  };

  const startProgressTracking = (shlokaId: string) => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(() => {
      if (soundRef.current) {
        soundRef.current.getCurrentTime((seconds) => {
          setProgress(prev => ({ ...prev, [shlokaId]: seconds }));
        });
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const playAudio = async (shloka: Shloka) => {
    // If same audio is playing, pause it
    if (playingId === shloka.id && soundRef.current) {
      soundRef.current.pause();
      setPlayingId(null);
      stopProgressTracking();
      return;
    }

    // Stop current audio if playing different one
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      stopProgressTracking();
    }

    // Load and play new audio
    const sound = await loadAudio(shloka);
    if (!sound) return;

    soundRef.current = sound;
    setPlayingId(shloka.id);
    startProgressTracking(shloka.id);

    sound.play((success) => {
      if (success) {
        console.log('Audio finished playing');
      } else {
        console.log('Audio playback failed');
      }
      setPlayingId(null);
      setProgress(prev => ({ ...prev, [shloka.id]: 0 }));
      stopProgressTracking();
    });
  };

  const stopAudio = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }
    setPlayingId(null);
    stopProgressTracking();
  };

  const seekAudio = (shlokaId: string, value: number) => {
    if (soundRef.current && playingId === shlokaId) {
      soundRef.current.setCurrentTime(value);
      setProgress(prev => ({ ...prev, [shlokaId]: value }));
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAudioPlayer = (shloka: Shloka) => {
    const isPlaying = playingId === shloka.id;
    const isLoading = loadingAudio === shloka.id;
    const currentProgress = progress[shloka.id] || 0;
    const totalDuration = duration[shloka.id] || 0;
    const progressPercentage = totalDuration > 0 ? (currentProgress / totalDuration) * 100 : 0;

    return (
      <View style={styles.audioPlayer}>
        {/* Shloka Text */}
        <View style={styles.shlokaTextContainer}>
          <BodyText
            color={COLORS.text.primary}
            size="md"
            style={styles.shlokaText}
          >
            {shloka.text}
          </BodyText>
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => playAudio(shloka)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>

            {/* Time Labels */}
            <View style={styles.timeLabels}>
              <BodyText color={COLORS.text.secondary} size="xs">
                {formatTime(currentProgress)}
              </BodyText>
              <BodyText color={COLORS.text.secondary} size="xs">
                {formatTime(totalDuration)}
              </BodyText>
            </View>
          </View>

          {/* Stop Button */}
          {isPlaying && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopAudio}
            >
              <Ionicons name="stop" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
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

        {/* Expandable Audio Player */}
        {isExpanded && (
          <Animated.View
            style={[
              styles.expandableContent,
              {
                opacity: animatedHeight,
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500],
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 color={COLORS.text.primary} weight="bold" size="xl">
          18 Shlokas
        </H2>
        <View style={styles.headerRight} />
      </View>

      {/* Shlokas List */}
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
  },
  shlokaTextContainer: {
    backgroundColor: COLORS.background.tertiary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  shlokaText: {
    lineHeight: 24,
    textAlign: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShlokaMantraScreen;
