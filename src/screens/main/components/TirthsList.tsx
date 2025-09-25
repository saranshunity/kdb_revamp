import HorizontalListViews from "../../../components/lists/HorizontalListViews";

const TirthsList = ({listData}: {listData: any[]}) => {
  return (
    <HorizontalListViews title="Mahotsav Around the World" listData={listData} />
  );
};

export default TirthsList;