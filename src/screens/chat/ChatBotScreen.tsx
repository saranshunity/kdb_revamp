import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS } from "../../constants/colors";
import { FONTS, FONT_SIZES } from "../../constants/fonts";
import FirebaseService, { EventItem } from "../../services/FirebaseService";

type ChatBotNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ChatBot"
>;

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  actions?: Array<{
    label: string;
    type:
      | "navigate-events"
      | "navigate-facilities"
      | "navigate-iconic"
      | "navigate-museum"
      | "navigate-tirths"
      | "navigate-tirth-mitra"
      | "navigate-shloka-mantra"
      | "navigate-family-locator";
  }>;
};

type KnowledgeEntry = {
  keywords: string[];
  answer: string;
  actions?: Message["actions"];
};

const knowledgeBase: KnowledgeEntry[] = [
  {
    keywords: ["event", "events", "schedule", "program"],
    answer:
      "Tell me the date you're interested in (e.g., ‘events on 16’) and I'll list the programs scheduled. You can also tap the Events button below to browse the full calendar.",
    actions: [{ label: "Open Events", type: "navigate-events" }],
  },
  {
    keywords: ["facility", "facilities", "toilet", "restroom", "parking", "wheelchair", "medical", "water"],
    answer:
      "Open **Facilities & Services** to explore:\n• Medical & wheelchair support near the main gate\n• 40+ public toilets with a live map\n• Drinking water kiosks and six themed food courts\nEach card includes a “View Map” button where available.",
    actions: [{ label: "View Facilities", type: "navigate-facilities" }],
  },
  {
    keywords: ["48", "kos", "tirth", "pilgrimage", "tirths"],
    answer:
      "The **48 Kos Tirths** section lets you explore sacred sites across the Kurukshetra region. Browse stories, images, and routes for each pilgrimage destination.",
    actions: [{ label: "Explore 48 Kos Tirths", type: "navigate-tirths" }],
  },
  {
    keywords: ["museum", "light", "show", "panorama", "jyotisar"],
    answer:
      "Head to **Museums & Shows** for timings and ticket details:\n• Panorama Museum (10 AM – 6 PM)\n• Shri Krishna Museum (10 AM – 5 PM, closed Monday)\n• Jyotisar Light & Sound Show at sunset\nLinks inside the cards let you read more or buy tickets online.",
    actions: [{ label: "Museums & Shows", type: "navigate-museum" }],
  },
  {
    keywords: ["tirth", "mitra", "volunteer", "card"],
    answer:
      "Become a **Tirth Mitra** to guide pilgrims and support festival operations. You can read the intro, generate your card, or submit the full application within the Tirth Mitra flow.",
    actions: [{ label: "Tirth Mitra", type: "navigate-tirth-mitra" }],
  },
  {
    keywords: ["iconic", "place", "brahma", "sarovar", "sermon"],
    answer:
      "The **Iconic Places** guide covers Brahma Sarovar, the Jyotisar Sermon site, and Shri Krishna Museum. Expand each card to see stories, photos, and highlights.",
    actions: [{ label: "Iconic Places", type: "navigate-iconic" }],
  },
  {
    keywords: ["help", "support", "contact"],
    answer:
      "Need extra help? Visit the Lost & Found desk at Brahma Sarovar’s main gate or call the helpline listed in Facilities. You can also explore the Menu for hierarchy, permissions, and reminders.",
  },
  {
    keywords: ["shloka", "mantra", "chant", "vaishvik", "path"],
    answer:
      "Open **Shloka Mantra Prep** to read the brief, learn the chant cues, and get hyped for the Vaishvik Path with 18,000 students on 1 December.",
    actions: [{ label: "Shloka Mantra", type: "navigate-shloka-mantra" }],
  },
  {
    keywords: ["locate", "family", "members", "tracker", "location"],
    answer:
      "Use **Locate Your Family Members** to set up your family group, share live pins, and jump into the dashboard map. You can invite relatives and see everyone on the Mahotsav grounds in seconds.",
    actions: [{ label: "Locate Family", type: "navigate-family-locator" }],
  },
];

const fallbackMessage =
  "I can help with Mahotsav events, facilities, iconic places, museums, Shloka Mantra prep, and locating your family. Try asking “Where are the toilets?” or “How do I join the Vaishvik Path?”";

const ChatBotScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ChatBotNavigationProp>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsByDay, setEventsByDay] = useState<Record<string, EventItem[]>>({});
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "bot-0",
      sender: "bot",
      text: "Namaste! Ask me about events, facilities, iconic places, or museums during the Mahotsav.",
    },
  ]);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToEvents((items) => {
      setEvents(items);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const map = events.reduce<Record<string, EventItem[]>>((acc, event) => {
      const normalized = event.date.replace(/\//g, "-");
      const day = normalized.split("-")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {});
    Object.values(map).forEach((list) => {
      list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    });
    setEventsByDay(map);
  }, [events]);

  const handleBotReply = useCallback((userInput: string): string => {
    const normalized = userInput.toLowerCase();
    const match = knowledgeBase.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword))
    );
    return match ? match.answer : fallbackMessage;
  }, []);

  const buildReply = useCallback(
    (userInput: string): { text: string; actions?: Message["actions"] } => {
      const normalized = userInput.toLowerCase();
      const numberMatch = normalized.match(/\b(\d{1,2})\b/);

      if (normalized.includes("event")) {
        if (numberMatch) {
          const day = numberMatch[1].padStart(2, "0");
          const list = eventsByDay[day];
          if (list && list.length) {
            const formatted = list
              .map((event) => {
                const time = event.time ? `${event.time} – ` : "";
                const location = event.location ? ` @ ${event.location}` : "";
                return `• ${time}${event.title}${location}`;
              })
              .join("\n");
            return {
              text: `Here’s what’s scheduled on ${day} Nov:\n${formatted}`,
              actions: [{ label: "Open Events", type: "navigate-events" }],
            };
          }
          return {
            text:
              "I couldn’t find events for that date. Try checking the Events calendar for the latest schedule.",
            actions: [{ label: "Open Events", type: "navigate-events" }],
          };
        }

        return {
          text: handleBotReply(userInput),
          actions: [{ label: "Open Events", type: "navigate-events" }],
        };
      }

      const kbMatch = knowledgeBase.find((entry) =>
        entry.keywords.some((keyword) => normalized.includes(keyword))
      );

      if (kbMatch) {
        return { text: kbMatch.answer, actions: kbMatch.actions };
      }

      return { text: fallbackMessage };
    },
    [eventsByDay, handleBotReply]
  );

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => {
      const userMessage: Message = {
        id: `user-${prev.length}`,
        sender: "user",
        text: trimmed,
      };
      const { text: replyText, actions } = buildReply(trimmed);
      const replyMessage: Message = {
        id: `bot-${prev.length + 1}`,
        sender: "bot",
        text: replyText,
        actions,
      };
      return [...prev, userMessage, replyMessage];
    });

    setInput("");
  }, [buildReply, input]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText,
          ]}
        >
          {item.text}
        </Text>
        {!isUser && item.actions && (
          <View style={styles.actionRow}>
            {item.actions.map((action, idx) => (
              <TouchableOpacity
                key={`${item.id}-action-${idx}`}
                style={styles.actionButton}
                onPress={() => {
                  if (action.type === "navigate-events") {
                    navigation.navigate("Events");
                  } else if (action.type === "navigate-facilities") {
                    navigation.navigate("Facilities");
                  } else if (action.type === "navigate-iconic") {
                    navigation.navigate("IconicPlaces");
                  } else if (action.type === "navigate-museum") {
                    navigation.navigate("MuseumShows");
                  } else if (action.type === "navigate-tirths") {
                    navigation.navigate("Tirths");
                  } else if (action.type === "navigate-tirth-mitra") {
                    const parent = navigation.getParent();
                    if (parent) {
                      parent.navigate("Profile" as never);
                    } else {
                      navigation.navigate("TirthMitraIntro");
                    }
                  } else if (action.type === "navigate-shloka-mantra") {
                    navigation.navigate("ShlokaMantra");
                  } else if (action.type === "navigate-family-locator") {
                    navigation.navigate("FamilyLaunch");
                  }
                }}
              >
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }, [navigation]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background.primary}
      />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mahotsav Assistant</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about events, facilities, museums..."
              placeholderTextColor={COLORS.text.secondary}
              style={styles.input}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && { backgroundColor: COLORS.border.light },
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() ? COLORS.white : COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 32,
  },
  flexOne: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.background.appColor,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background.primary,
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
  },
  userText: {
    color: COLORS.white,
  },
  botText: {
    color: COLORS.text.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
});

export default ChatBotScreen;

