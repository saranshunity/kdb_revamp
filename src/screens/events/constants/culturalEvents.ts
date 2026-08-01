export type CulturalEvent = {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  description: string;
};

export const CULTURAL_EVENTS: CulturalEvent[] = [
  {
    id: 'suresh-wadkar',
    title: 'Bhakti Sandhya with Suresh Wadkar',
    artist: 'Padma Shri Suresh Wadkar',
    date: '30 Nov 2025',
    time: '7:00 PM – 9:00 PM',
    venue: 'Brahma Sarovar Main Stage',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2FSureshWadkar.jpg?alt=media&token=5012cd84-42f0-4d96-9c10-305de0404fd4',
    description:
      'Experience a soulful evening of bhajans and timeless devotional classics performed live by the legendary Suresh Wadkar.',
  },
  {
    id: 'amyaana',
    title: 'Amyaana Live in Concert',
    artist: 'Amyaana Collective',
    date: '1 Dec 2025',
    time: '6:30 PM – 8:30 PM',
    venue: 'Kurukshetra Amphitheatre',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2Famyaana.jpg?alt=media&token=b10a6328-511b-4ccd-9b8b-a5e951e2b905',
    description:
      'A contemporary take on Indian folk inspired by the teachings of the Gita, blending classical instruments with modern arrangements.',
  },
  {
    id: 'anup-jalota',
    title: 'Anup Jalota Live',
    artist: 'Bhajan Samrat Anup Jalota',
    date: '2 Dec 2025',
    time: '7:00 PM – 9:00 PM',
    venue: 'Kurukshetra Panorama Grounds',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2Fanup.jpg?alt=media&token=136b642f-4866-46c9-9b76-cbf547bf0c20',
    description:
      'Immerse yourself in meditative bhajans and ghazals as Anup Jalota brings his signature charm to the Mahotsav stage.',
  },
  {
    id: 'hariom-sharan',
    title: 'Hari Om Sharan Tribute',
    artist: 'Hari Om Sharan Ensemble',
    date: '3 Dec 2025',
    time: '6:00 PM – 8:00 PM',
    venue: 'Jyotisar Cultural Arena',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2Fhariom.jpg?alt=media&token=bca25970-1b91-42a8-8427-1f8c6c1a9c84',
    description:
      'A heartfelt tribute reimagining the bhajans popularised by Hari Om Sharan with choir harmonies and live percussion.',
  },
  {
    id: 'kanwar-grewal',
    title: 'Sufi Night with Kanwar Grewal',
    artist: 'Kanwar Grewal',
    date: '4 Dec 2025',
    time: '8:00 PM – 10:00 PM',
    venue: 'Brahma Sarovar Riverfront',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2Fkanwar.jpg?alt=media&token=b132656e-af12-485f-b091-1d67fcb61cae',
    description:
      'Lose yourself in mystical Sufi kalams and high-energy folk rhythms as Kanwar Grewal lights up the night.',
  },
  {
    id: 'puneet-supari',
    title: 'Folk Beats by Puneet Superi',
    artist: 'Puneet Superi & Troupe',
    date: '5 Dec 2025',
    time: '7:30 PM – 9:00 PM',
    venue: 'Narkatari Cultural Pavilion',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2Fpuneet.jpg?alt=media&token=345aff32-413c-426e-89ca-00e6f21a8f0c',
    description:
      'A high-octane set featuring Punjabi folk, dhol grooves, and crowd interactions for the whole family.',
  },
  {
    id: 'sadhvi-devi',
    title: 'Devotional Chorus with Sadhvi Devi',
    artist: 'Param Sadhvi Devi Ji',
    date: '6 Dec 2025',
    time: '5:30 PM – 7:00 PM',
    venue: 'Kurukshetra University Grounds',
    image: 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/mahotsavStaticData%2FculturalImages%2Fsadhvi.jpg?alt=media&token=afd9f3c4-9551-4979-bb55-ae7897ee631b',
    description:
      'A serene choral presentation featuring Sanskrit chants, guided meditation, and audience participation.',
  },
];

