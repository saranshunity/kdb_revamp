export type GitaMahotsavColorInfo = {
  id: string;
  label: string;
  color: string;
  image: string;
  description: string;
  events: {
    title: string;
    time: string;
    venue: string;
  }[];
};

const BASE_EVENT_TIMES = [
  "06:00 AM",
  "08:30 AM",
  "11:00 AM",
  "02:00 PM",
  "04:30 PM",
  "07:00 PM",
];

export const GITA_MAHOTSAV_COLORS: GitaMahotsavColorInfo[] =  [
    { id: "adhyaya-1", label: "शिल्प मेला", color: "#F44336",description:'15 नवम्बर - 5 दिसम्बर 2025 , ब्रह्म सरोवर',image:'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FcolorsGita%2F1.jpg?alt=media&token=0a067c5d-1e83-4acd-ae55-095319bf7672' },
    { id: "adhyaya-2", label: "गीता यज्ञ गीता पाठ श्रीम‌द्भागवत कथा", color: "#E91E63",description:'24 नवम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर',image:'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FcolorsGita%2F2.jpg?alt=media&token=d86ffbc4-6280-4e95-838d-0a2093b13851' },
    { id: "adhyaya-3", label: "अन्तर्राष्ट्रीय गीता संगोष्ठी", color: "#9C27B0",description:'24 – 26  नवम्बर 2025, श्रीमद्भगवद्गीता सदन, कुरुक्षेत्र विश्वविद्याल' },
    { id: "adhyaya-4", label: "गीता महाआरती एवं भजन संध्या", color: "#673AB7",description:'15 नवम्बर – 5 दिसम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर ' },
    { id: "adhyaya-5", label: "सर्व धर्म सम्मेलन", color: "#3F51B5",description:'24  नवम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर' },
    { id: "adhyaya-6", label: "भागवत कथा", color: "#2196F3",description:'25 – 30 नवम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर' },
    { id: "adhyaya-7", label: "वैश्विक गीता पाठ", color: "#03A9F4",description:'1 दिसम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर' },
    { id: "adhyaya-8", label: "भागीदार प्रदेश मध्य प्रदेश पैवेलियन", color: "#00BCD4",description:'24 नवम्बर – 1 दिसम्बर 2025, पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर'},
    { id: "adhyaya-9", label: "भागीदार देश पैवेलियन", color: "#009688",description:'24 नवम्बर – 1 दिसम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर'},
    { id: "adhyaya-10", label: "हरियाणा पैवेलियन", color: "#4CAF50",description:'24 नवम्बर – 5 दिसम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर'},
    { id: "adhyaya-11", label: "शैक्षणिक प्रतियोगिताएं", color: "#8BC34A",description:'28 – 30 नवम्बर 2025 , सन्निहित सरोवर'     },
    { id: "adhyaya-12", label: "48 कोस तीर्थो पर सांस्कृतिक कार्यक्रम", color: "#CDDC39",description:'15 नवम्बर – 1 दिसम्बर 2025 , 48 कोस कुरुक्षेत्र भूमि'     },
    { id: "adhyaya-13", label: "48 कोस तीर्थ सम्मेलन", color: "#FFEB3B",description:'1 दिसम्बर 2025 , श्रीमद्भगवद्गीता सदन कुरुक्षेत्र विश्वविद्यालय'},
    { id: "adhyaya-14", label: "भव्य साँस्कृतिक कार्यक्रम", color: "#FFC107",description:'24 नवम्बर – 1 दिसम्बर 2025, पुरुषोत्तमपुरा बाग, ब्रह्म सरोवर'},
    { id: "adhyaya-15", label: "गीता पुस्तक मेला", color: "#FF9800",description:'24 नवम्बर – 1 दिसम्बर 2025 , ब्रह्म सरोवर '     },
    { id: "adhyaya-16", label: "दीपोत्सव", color: "#FF5722",description:'1 दिसम्बर 2025 , ब्रह्म सरोवर, सन्निहित सरोवर, ज्योतिसर तीर्थ'     },
    { id: "adhyaya-17", label: "धर्मक्षेत्र कुरुक्षेत्र एवं सरकार की विकासात्मक परियोजनाओं की प्रदर्शनियां", color: "#795548",description:'24 नवम्बर – 1 दिसम्बर 2025 , पुरुषोत्तमपुरा बाग, ब्रह्मसरोवर'     },
    { id: "adhyaya-18", label: "गीता रन", color: "#607D8B",description:'15 नवम्बर 2025 , ब्रह्म सरोवर'     },
    // { id: "adhyaya-19", label: "बलराम दंगल और हॉकी", color: "#607D8B",description:'कुरुक्षेत्र विश्वविद्याल'     },
  ].map((item, index) => {
  const eventTime = BASE_EVENT_TIMES[index % BASE_EVENT_TIMES.length];
  const chapterNumber = index + 1;

  return {
    ...item,
    image: `https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FcolorsGita%2F${chapterNumber}.jpg?alt=media&token=d86ffbc4-6280-4e95-838d-0a2093b13851`,
    description: `${item.description || ''}`,
    events: [
      {
        title: `${item.label} Cultural Showcase`,
        time: eventTime,
        venue: "Kurukshetra Main Stage",
      },
      {
        title: `${item.label} Discourse`,
        time: "09:00 PM",
        venue: "Gita Mandir Pavilion",
      },
    ],
  } as GitaMahotsavColorInfo;
});

