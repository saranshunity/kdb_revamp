import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { H2, H3, BodyText } from '../../components/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Platform, PermissionsAndroid } from 'react-native';

type TirthMitraCardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TirthMitraCard'
>;
type TirthMitraCardScreenRouteProp = RouteProp<RootStackParamList, 'TirthMitraCard'>;

const TirthMitraCardScreen = () => {
  const cardRef = useRef<ViewShot>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthMitraCardScreenNavigationProp>();
  const route = useRoute<TirthMitraCardScreenRouteProp>();

  const { cardData } = route.params;

  // Generate unique card number
  const cardNumber = `TM${Date.now().toString().slice(-8)}`;
  const issueDate = new Date().toLocaleDateString('en-IN');
  const expiryDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ).toLocaleDateString('en-IN');

  const handleDownloadPDF = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .card { border: 2px solid #333; border-radius: 16px; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { background-color: ${COLORS.background.appColor}; color: white; padding: 16px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
            .title { font-size: 20px; font-weight: bold; margin: 0; }
            .subtitle { font-size: 12px; margin: 5px 0 0 0; }
            .content { padding: 10px 0; }
            .row { margin: 10px 0; }
            .label { font-size: 10px; color: #666; }
            .value { font-size: 14px; font-weight: bold; color: #333; margin-top: 2px; }
            .footer { border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <p class="title">TIRTH MITRA CARD</p>
              <p class="subtitle">48 Kos Parikrama, Kurukshetra</p>
            </div>
            <div class="content">
              <div class="row">
                <div class="label">Name</div>
                <div class="value">${cardData.fullName}</div>
              </div>
              ${cardData.fatherName ? `
              <div class="row">
                <div class="label">Father's/Husband's Name</div>
                <div class="value">${cardData.fatherName}</div>
              </div>` : ''}
              <div class="row">
                <div class="label">Card Number</div>
                <div class="value">${cardNumber}</div>
              </div>
              ${cardData.selectedDistrict ? `
              <div class="row">
                <div class="label">District</div>
                <div class="value">${cardData.selectedDistrict}</div>
              </div>` : ''}
              ${cardData.selectedTirthName ? `
              <div class="row">
                <div class="label">Visiting Tirth</div>
                <div class="value">${cardData.selectedTirthName}</div>
              </div>` : ''}
              <div class="row">
                <div class="label">Contact</div>
                <div class="value">${cardData.phone}</div>
              </div>
              <div class="row">
                <div class="label">Email</div>
                <div class="value">${cardData.email}</div>
              </div>
              <div class="row">
                <div class="label">Issue Date</div>
                <div class="value">${issueDate}</div>
              </div>
              <div class="row">
                <div class="label">Valid Until</div>
                <div class="value">${expiryDate}</div>
              </div>
            </div>
            <div class="footer">
              Issued by Kurukshetra Development Board, Government of Haryana
            </div>
          </div>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `TirthMitra_${cardNumber}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert(
        'Success',
        'PDF downloaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => console.log('PDF saved at:', file.filePath),
          },
        ]
      );
    } catch (error) {
      console.error('PDF Error:', error);
      Alert.alert('Error', 'Failed to download PDF');
    }
  };

  const handleShare = async () => {
    try {
      if (cardRef.current && cardRef.current.capture) {
        const uri = await cardRef.current.capture();
        
        const shareOptions = {
          title: 'Tirth Mitra Card',
          message: `My Tirth Mitra Card - ${cardData.fullName}\nCard Number: ${cardNumber}`,
          url: Platform.OS === 'android' ? `file://${uri}` : uri,
          type: 'image/png',
        };

        await Share.open(shareOptions);
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Share Error:', error);
        Alert.alert('Error', 'Failed to share card');
      }
    }
  };

  const handleSaveToGallery = async () => {
    try {
      // Request permission for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to save the card',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot save without storage permission');
          return;
        }
      }

      if (cardRef.current && cardRef.current.capture) {
        const uri = await cardRef.current.capture();
        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('Success', 'Card saved to gallery successfully!');
      }
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'Failed to save card to gallery');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <H2 style={styles.headerTitle} color={COLORS.text.primary} weight="bold" size="lg">
            Your Tirth Mitra Card
          </H2>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Success Message */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
          </View>
          <H3 style={styles.successTitle} color={COLORS.text.primary} weight="bold" size="lg">
            Card Generated Successfully!
          </H3>
          <BodyText style={styles.successText} color={COLORS.text.secondary} size="sm">
            Your Tirth Mitra Card is ready. You can download, save, or share it.
          </BodyText>
        </View>

        {/* Card Preview */}
        <View style={styles.cardContainer}>
          <ViewShot ref={cardRef} options={{ format: 'png', quality: 1.0 }}>
            {/* Front Side */}
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="card" size={40} color={COLORS.white} />
                </View>
                <View style={styles.cardHeaderText}>
                  <BodyText style={styles.cardTitle} color={COLORS.white} size="md" weight="bold">
                    TIRTH MITRA CARD
                  </BodyText>
                  <BodyText style={styles.cardSubtitle} color={COLORS.white} size="xs">
                    48 Kos Parikrama, Kurukshetra
                  </BodyText>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View style={styles.cardContent}>
                  <View style={styles.photoSection}>
                    {cardData.photoUri ? (
                      <Image source={{ uri: cardData.photoUri }} style={styles.cardPhoto} />
                    ) : (
                      <View style={styles.cardPhotoPlaceholder}>
                        <Ionicons name="person" size={40} color={COLORS.text.tertiary} />
                      </View>
                    )}
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <BodyText style={styles.infoLabel} color={COLORS.text.secondary} size="xs">
                        Name
                      </BodyText>
                      <BodyText style={styles.infoValue} color={COLORS.text.primary} size="sm" weight="bold">
                        {cardData.fullName}
                      </BodyText>
                    </View>

                    {cardData.fatherName && (
                      <View style={styles.infoRow}>
                        <BodyText style={styles.infoLabel} color={COLORS.text.secondary} size="xs">
                          Father's/Husband's Name
                        </BodyText>
                        <BodyText style={styles.infoValue} color={COLORS.text.primary} size="xs">
                          {cardData.fatherName}
                        </BodyText>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <BodyText style={styles.infoLabel} color={COLORS.text.secondary} size="xs">
                        Card Number
                      </BodyText>
                      <BodyText style={styles.infoValue} color={COLORS.text.primary} size="sm" weight="bold">
                        {cardNumber}
                      </BodyText>
                    </View>

                    {cardData.selectedDistrict && (
                      <View style={styles.infoRow}>
                        <BodyText style={styles.infoLabel} color={COLORS.text.secondary} size="xs">
                          District
                        </BodyText>
                        <BodyText style={styles.infoValue} color={COLORS.text.primary} size="xs">
                          {cardData.selectedDistrict}
                        </BodyText>
                      </View>
                    )}

                    {cardData.selectedTirthName && (
                      <View style={styles.infoRow}>
                        <BodyText style={styles.infoLabel} color={COLORS.text.secondary} size="xs">
                          Visiting Tirth
                        </BodyText>
                        <BodyText style={styles.infoValue} color={COLORS.text.primary} size="xs" numberOfLines={2}>
                          {cardData.selectedTirthName}
                        </BodyText>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <BodyText style={styles.infoLabel} color={COLORS.text.secondary} size="xs">
                        Contact
                      </BodyText>
                      <BodyText style={styles.infoValue} color={COLORS.text.primary} size="xs">
                        {cardData.phone}
                      </BodyText>
                    </View>

                    <View style={styles.dateRow}>
                      <View style={styles.dateItem}>
                        <BodyText style={styles.dateLabel} color={COLORS.text.secondary} size="xs">
                          Issue Date
                        </BodyText>
                        <BodyText style={styles.dateValue} color={COLORS.text.primary} size="xs" weight="bold">
                          {issueDate}
                        </BodyText>
                      </View>
                      <View style={styles.dateItem}>
                        <BodyText style={styles.dateLabel} color={COLORS.text.secondary} size="xs">
                          Valid Until
                        </BodyText>
                        <BodyText style={styles.dateValue} color={COLORS.text.primary} size="xs" weight="bold">
                          {expiryDate}
                        </BodyText>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <BodyText style={styles.footerText} color={COLORS.text.tertiary} size="xs">
                    Issued by Kurukshetra Development Board
                  </BodyText>
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code" size={40} color={COLORS.text.tertiary} />
                  </View>
                </View>
              </View>
            </View>
          </ViewShot>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownloadPDF}>
            <Ionicons name="download-outline" size={24} color={COLORS.white} />
            <BodyText style={styles.actionButtonText} color={COLORS.white} size="sm" weight="bold">
              Download PDF
            </BodyText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleSaveToGallery}
          >
            <Ionicons name="image-outline" size={24} color={COLORS.background.appColor} />
            <BodyText
              style={styles.actionButtonText}
              color={COLORS.background.appColor}
              size="sm"
              weight="bold"
            >
              Save Image
            </BodyText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={24} color={COLORS.background.appColor} />
            <BodyText
              style={styles.actionButtonText}
              color={COLORS.background.appColor}
              size="sm"
              weight="bold"
            >
              Share Card
            </BodyText>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <H3 style={styles.instructionsTitle} color={COLORS.text.primary} weight="bold" size="md">
            Next Steps
          </H3>
          <BodyText style={styles.instructionsText} color={COLORS.text.secondary} size="sm">
            1. Download or save your card for offline access{'\n'}
            2. Keep both digital and printed copy during pilgrimage{'\n'}
            3. Present this card at temple authorities when requested{'\n'}
            4. Report any issues to helpline: 1800-XXX-XXXX
          </BodyText>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  scrollView: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background.secondary,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  cardContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.appColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  cardSubtitle: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  cardBody: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  photoSection: {
    width: 100,
  },
  cardPhoto: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
  },
  cardPhotoPlaceholder: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
  dateValue: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  footerText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    flex: 1,
  },
  qrPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.background.appColor,
  },
  actionButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.sm,
  },
  instructionsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
    marginBottom: 12,
  },
  instructionsText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default TirthMitraCardScreen;

