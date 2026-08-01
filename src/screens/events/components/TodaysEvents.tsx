import HorizontalListViews from "../../../components/lists/HorizontalListViews";

const TodaysEvents = ({listData, type, showAll}: {listData: any[], type?: 'mahotsav' | 'events' | 'tirths', showAll?: boolean}) => {
    return (
        <HorizontalListViews title="Today's Events" listData={listData} type={type} showAll={showAll} />
    )
}

export default TodaysEvents;