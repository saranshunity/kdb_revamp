import HorizontalListViews from "../../../components/lists/HorizontalListViews";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MahotsavHulchal = ({listData, type}: {listData: any[], type?: 'mahotsav' | 'events' | 'tirths'}) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <HorizontalListViews
      title="LIVE Updates"
      listData={listData}
      type={type}
      showAll
      onItemPress={(item) => {
        navigation.navigate('UpdateDetail', { item });
      }}
      onViewAllPress={() => {
        navigation.navigate('UpdatesList');
      }}
    />
  );
};

export default MahotsavHulchal;