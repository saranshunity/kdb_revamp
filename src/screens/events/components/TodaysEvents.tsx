import HorizontalListViews from "../../../components/lists/HorizontalListViews";

const TodaysEvents = ({listData, type}: {listData: any[], type?: 'mahotsav' | 'events' | 'tirths'}) => {
    return (
        <HorizontalListViews title="Today's Events" listData={listData} type={type} />
    )
}

export default TodaysEvents;