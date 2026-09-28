import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, Bot, User, Sparkles, Shield, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'Namaste! I am your AI Legal Assistant powered by Nepal Law Corpus. How can I assist you with Constitution, Civil Code, or Property laws today?',
    time: 'Just now',
  },
];

const SUGGESTED_QUESTIONS = [
  'What are the requirements for property registration in Nepal?',
  'Explain tenant rights under the Muluki Ain Civil Code.',
  'How do I register a Private Limited company in Kathmandu?',
  'What is the legal process for divorce in Nepal?',
];

export const AiChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      let responseText =
        'Under the Muluki Civil Code 2074 of Nepal, all official contracts involving transfer of property valued over Rs. 100,000 must be registered at the District Land Revenue Office (Malpot Karyalaya). Ensure you have citizenship documents and land ownership certificates (Lalpurja).';

      if (query.toLowerCase().includes('company') || query.toLowerCase().includes('register')) {
        responseText =
          'To register a Private Limited company in Nepal: 1) Reserve company name via OCR (Office of Company Registrar) portal. 2) Submit MOA & AOA drafted by a legal advocate. 3) Obtain PAN from Inland Revenue Dept.';
      } else if (query.toLowerCase().includes('divorce') || query.toLowerCase().includes('family')) {
        responseText =
          'Divorce proceedings in Nepal can be initiated by either spouse at the respective District Court. Under Article 93-104 of Muluki Civil Code, mutual consent divorce takes 2-3 working days, whereas contested divorce requires judicial mediation for up to 1 year.';
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.botIconWrapper, { backgroundColor: theme.toggleBg }]}>
            <Bot size={22} color={theme.textPrimary} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>AI Advocate Assistant</Text>
              <View style={[styles.betaBadge, { backgroundColor: theme.toggleBg }]}>
                <Sparkles size={11} color={theme.primary} />
                <Text style={[styles.betaText, { color: theme.textPrimary }]}>AI 2.0</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Instant answers grounded in Nepal Law & Acts
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        contentContainerStyle={styles.chatScroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAi,
              ]}
            >
              {!isUser && (
                <View style={[styles.avatarBox, { backgroundColor: theme.toggleBg }]}>
                  <Bot size={16} color={theme.textPrimary} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isUser
                    ? [styles.bubbleUser, { backgroundColor: theme.primary }]
                    : [
                        styles.bubbleAi,
                        {
                          backgroundColor: theme.cardBackground,
                          borderColor: theme.cardBorder,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? theme.textInverse : theme.textPrimary },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    { color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted },
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
              {isUser && (
                <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
                  <User size={16} color={theme.textInverse} />
                </View>
              )}
            </View>
          );
        })}

        {isTyping && (
          <View style={styles.typingRow}>
            <View style={[styles.avatarBox, { backgroundColor: theme.toggleBg }]}>
              <Bot size={16} color={theme.textPrimary} />
            </View>
            <View
              style={[
                styles.bubble,
                styles.bubbleAi,
                { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
              ]}
            >
              <Text style={[styles.typingText, { color: theme.textMuted }]}>
                Analyzing Nepal Legal Codes...
              </Text>
            </View>
          </View>
        )}

        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestHeader, { color: theme.textSecondary }]}>
              Suggested Queries:
            </Text>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => handleSend(q)}
                style={[
                  styles.suggestPill,
                  { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder },
                ]}
              >
                <Sparkles size={13} color={theme.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.suggestText, { color: theme.textPrimary }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.cardBackground, borderTopColor: theme.cardBorder },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            { color: theme.textPrimary, backgroundColor: theme.inputBg },
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
          ]}
          placeholder="Ask any legal question in English or Nepali..."
          placeholderTextColor={theme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSend()}
          style={[styles.sendBtn, { backgroundColor: theme.primary }]}
        >
          <Send size={18} color={theme.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  betaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: typography.fontFamily,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  suggestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  suggestText: {
    fontSize: 13,
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
