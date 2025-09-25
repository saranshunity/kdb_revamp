import HorizontalListViews from "../../../components/lists/HorizontalListViews";

const TodaysEvents = ({listData}: {listData: any[]}) => {
    return (
        <HorizontalListViews title="Today's Events" listData={listData} />
    )
}

export default TodaysEvents;