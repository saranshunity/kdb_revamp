import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_STORAGE_KEY = 'tirth_mitra_otp';
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

interface OTPData {
  otp: string;
  phoneNumber: string;
  timestamp: number;
}

class OTPService {
  /**
   * Generate a random 4-digit OTP
   */
  generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Send OTP via SMS API
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      // Remove country code and non-digits from phone number
      const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        throw new Error('Invalid phone number format');
      }

      // Format current date
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // Format message
      const message = encodeURIComponent(
        `Your OTP is :${otp} Sent on your Mobile ${cleanPhone} on Dated :${formattedDate} Regards GOVKKR`
      );

      // Build API URL
      const apiUrl = `https://sms.iteshub.com/app/smsapi/index.php?key=35DD528DF74506&campaign=8720&routeid=30&type=text&contacts=${cleanPhone}&senderid=GOVKKR&msg=${message}&template_id=1007166721938491905&pe_id=1001368910000019134`;

      console.log('Sending OTP via SMS API:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`SMS API returned status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('SMS API Response:', responseText);

      // Check if response contains success indicator
      // The API seems to return a response like "SMS-SHOOT-ID/kdbkkr691b797e30f7f"
      if (responseText && responseText.length > 0) {
        // Store OTP for verification
        await this.storeOTP(phoneNumber, otp);
        return true;
      }

      throw new Error('Failed to send OTP');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Store OTP temporarily in AsyncStorage
   */
  private async storeOTP(phoneNumber: string, otp: string): Promise<void> {
    const otpData: OTPData = {
      otp,
      phoneNumber,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(OTP_STORAGE_KEY);
      
      if (!storedData) {
        return false;
      }

      const otpData: OTPData = JSON.parse(storedData);

      // Check if OTP has expired (10 minutes)
      const now = Date.now();
      if (now - otpData.timestamp > OTP_EXPIRY_TIME) {
        await AsyncStorage.removeItem(OTP_STORAGE_KEY);
        return false;
      }

      // Check if phone number matches
      const cleanStoredPhone = otpData.phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      const cleanEnteredPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
      if (cleanStoredPhone !== cleanEnteredPhone) {
        return false;
      }

      // Check if OTP matches
      if (otpData.otp !== enteredOTP) {
        return false;
      }

      // OTP verified successfully, remove it
      await AsyncStorage.removeItem(OTP_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  /**
   * Clear stored OTP
   */
  async clearOTP(): Promise<void> {
    await AsyncStorage.removeItem(OTP_STORAGE_KEY);
  }
}

export default new OTPService();

