import HorizontalListViews from "../../../components/lists/HorizontalListViews";

const MahotsavHulchal = ({listData, type}: {listData: any[], type?: 'mahotsav' | 'events' | 'tirths'}) => {
  return (
    <HorizontalListViews title="LIVE Updates" listData={listData} type={type} />
  );
};

export default MahotsavHulchal;