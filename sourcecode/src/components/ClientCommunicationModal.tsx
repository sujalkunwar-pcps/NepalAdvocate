import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  X,
  MessageSquare,
  Phone,
  Video,
  Send,
  Paperclip,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Shield,
  FileText,
  RotateCcw,
  CheckCheck,
  Scale,
} from 'lucide-react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import clientService, { ClientRecord, ChatMessage } from '../services/clientService';

export type CommMode = 'chat' | 'audio' | 'video';

interface ClientCommunicationModalProps {
  visible: boolean;
  onClose: () => void;
  client: ClientRecord | null;
  initialMode?: CommMode;
  onClientUpdated?: () => void;
}

export const ClientCommunicationModal: React.FC<ClientCommunicationModalProps> = ({
  visible,
  onClose,
  client,
  initialMode = 'chat',
  onClientUpdated,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<CommMode>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const isViewerClient = user?.role === 'CLIENT';
  const senderRole: 'lawyer' | 'client' = isViewerClient ? 'client' : 'lawyer';
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');
  const scrollViewRef = useRef<ScrollView>(null);

  // Pulse animation for audio call
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      if (client) {
        setMessages(client.messages || []);
      }
      setIsMuted(false);
      setIsVideoDisabled(false);
      setIsSpeakerOn(true);
      setCallDuration(0);
      setCallStatus('connecting');
    }
  }, [visible, client, initialMode, user?.role]);

  // Audio/Video Call duration timer
  useEffect(() => {
    let interval: any;
    if (visible && (mode === 'audio' || mode === 'video')) {
      const connectTimeout = setTimeout(() => {
        setCallStatus('connected');
      }, 1200);

      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(interval);
      };
    }
  }, [visible, mode]);

  // Audio pulse loop
  useEffect(() => {
    if (mode === 'audio' && visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [mode, visible]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || !client) return;

    try {
      const newMsg = await clientService.sendMessage(client.id, content, senderRole);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');

      if (onClientUpdated) {
        onClientUpdated();
      }

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!client) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: mode === 'chat' ? theme.background : '#0B0F19' }]}>
        {/* TOP NAVIGATION / CHANNEL SWITCHER */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: mode === 'chat' ? theme.cardBackground : '#111827',
              borderBottomColor: mode === 'chat' ? theme.cardBorder : '#1F2937',
              paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20) + 6,
            },
          ]}
        >
          <View style={styles.headerClientInfo}>
            <Image source={{ uri: client.avatar }} style={styles.headerAvatar} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.headerName, { color: mode === 'chat' ? theme.textPrimary : '#FFFFFF' }]}
                  numberOfLines={1}
                >
                  {client.name}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Shield size={11} color="#10B981" />
                </View>
              </View>
              <Text
                style={[styles.headerCase, { color: mode === 'chat' ? theme.textSecondary : '#94A3B8' }]}
                numberOfLines={1}
              >
                {client.caseTitle}
              </Text>
            </View>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('chat')}
              style={[
                styles.modeTab,
                mode === 'chat' && {
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <MessageSquare size={16} color={mode === 'chat' ? '#FFFFFF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('audio')}
              style={[
                styles.modeTab,
                mode === 'audio' && {
                  backgroundColor: '#10B981',
                },
              ]}
            >
              <Phone size={16} color={mode === 'audio' ? '#FFFFFF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('video')}
              style={[
                styles.modeTab,
                mode === 'video' && {
                  backgroundColor: '#2563EB',
                },
              ]}
            >
              <Video size={16} color={mode === 'video' ? '#FFFFFF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={mode === 'chat' ? theme.textSecondary : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. CHAT CHANNEL */}
        {mode === 'chat' && (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            {/* Consultation Banner */}
            <View style={[styles.consultationBanner, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
              <View style={styles.bannerDot} />
              <Text style={[styles.bannerText, { color: theme.textSecondary }]}>
                Encrypted Client-Advocate Privilege Room • {client.appointmentDate} ({client.appointmentTime})
              </Text>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatScrollContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            >
              {messages.map((msg) => {
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <View key={msg.id} style={styles.systemMsgWrapper}>
                      <View style={[styles.systemMsgBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                        <Shield size={12} color="#10B981" style={{ marginRight: 6 }} />
                        <Text style={[styles.systemMsgText, { color: theme.textSecondary }]}>{msg.text}</Text>
                      </View>
                    </View>
                  );
                }

                // Determine message perspective
                const isMyMessage = isViewerClient ? msg.sender === 'client' : msg.sender === 'lawyer';
                const isLawyerSender = msg.sender === 'lawyer';

                return (
                  <View
                    key={msg.id}
                    style={[styles.msgRow, isMyMessage ? styles.msgRowRight : styles.msgRowLeft]}
                  >
                    {!isMyMessage && (
                      isLawyerSender ? (
                        <View style={[styles.advocateMsgAvatar, { backgroundColor: theme.mode === 'dark' ? '#2563EB25' : '#DBEAFE', borderColor: '#2563EB40' }]}>
                          <Scale size={13} color="#2563EB" />
                        </View>
                      ) : (
                        <Image source={{ uri: client.avatar }} style={styles.msgAvatar} />
                      )
                    )}

                    <View
                      style={[
                        styles.msgBubble,
                        isMyMessage
                          ? [styles.msgBubbleRight, { backgroundColor: '#2563EB' }]
                          : [styles.msgBubbleLeft, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }],
                      ]}
                    >
                      {!isMyMessage && (
                        <Text
                          style={[
                            styles.msgSenderTag,
                            { color: isLawyerSender ? (theme.mode === 'dark' ? '#60A5FA' : '#1D4ED8') : '#10B981' },
                          ]}
                        >
                          {isLawyerSender ? 'Advocate' : client.name}
                        </Text>
                      )}

                      <Text
                        style={[
                          styles.msgText,
                          { color: isMyMessage ? '#FFFFFF' : theme.textPrimary },
                        ]}
                      >
                        {msg.text}
                      </Text>

                      {msg.attachment && (
                        <View
                          style={[
                            styles.attachmentBox,
                            { backgroundColor: isMyMessage ? '#1D4ED8' : theme.background },
                          ]}
                        >
                          <FileText size={18} color={isMyMessage ? '#93C5FD' : '#2563EB'} />
                          <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text
                              style={[
                                styles.attachmentTitle,
                                { color: isMyMessage ? '#FFFFFF' : theme.textPrimary },
                              ]}
                              numberOfLines={1}
                            >
                              {msg.attachment.title}
                            </Text>
                            <Text
                              style={[
                                styles.attachmentSub,
                                { color: isMyMessage ? '#BFDBFE' : theme.textSecondary },
                              ]}
                            >
                              {msg.attachment.size} • Legal Document
                            </Text>
                          </View>
                        </View>
                      )}

                      <View style={styles.msgMetaRow}>
                        <Text
                          style={[
                            styles.msgTime,
                            { color: isMyMessage ? '#DBEAFE' : theme.textSecondary },
                          ]}
                        >
                          {msg.timestamp}
                        </Text>
                        {isMyMessage && (
                          <CheckCheck size={13} color="#93C5FD" style={{ marginLeft: 4 }} />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Quick Consultation Prompts */}
            <View style={styles.quickPrompts}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
                {(!isViewerClient
                  ? [
                      'Namaste, I reviewed your petition.',
                      'Please send the Lalpurja land deed.',
                      'Drafting your legal agreement now.',
                    ]
                  : [
                      'Namaste Advocate, I uploaded the documents.',
                      'When is our hearing / consultation scheduled?',
                      'Thank you for your guidance Advocate.',
                    ]
                ).map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.7}
                    onPress={() => handleSendMessage(prompt)}
                    style={[styles.quickPromptBtn, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
                  >
                    <Text style={[styles.quickPromptText, { color: theme.textSecondary }]}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Chat Input Bar */}
            <View
              style={[
                styles.inputBar,
                {
                  backgroundColor: theme.cardBackground,
                  borderTopColor: theme.cardBorder,
                  paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 12,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  handleSendMessage('Attached: Nepal Advocate Power of Attorney Form 2081')
                }
                style={[styles.attachBtn, { backgroundColor: theme.toggleBg }]}
              >
                <Paperclip size={18} color={theme.textPrimary} />
              </TouchableOpacity>

              <TextInput
                style={[styles.textInput, { color: theme.textPrimary, backgroundColor: theme.background }]}
                placeholder={
                  !isViewerClient
                    ? `Type message to ${client.name.split(' ')[0]}...`
                    : 'Type message to Advocate...'
                }
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSendMessage()}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: inputText.trim() ? '#2563EB' : theme.toggleBg,
                  },
                ]}
              >
                <Send
                  size={16}
                  color={inputText.trim() ? '#FFFFFF' : theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* 2. AUDIO CALL CHANNEL */}
        {mode === 'audio' && (
          <View style={styles.callContainer}>
            <View style={styles.callHeader}>
              <Shield size={16} color="#10B981" />
              <Text style={styles.callHeaderBadge}>256-Bit Encrypted NST Audio Call</Text>
            </View>

            <View style={styles.callCenter}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Image source={{ uri: client.avatar }} style={styles.callAvatarLarge} />
              </Animated.View>

              <Text style={styles.callName}>{client.name}</Text>
              <Text style={styles.callCaseText}>{client.caseTitle}</Text>
              <Text style={styles.callStatusText}>
                {callStatus === 'connecting'
                  ? 'Connecting encrypted voice line...'
                  : `Active Call • ${formatTimer(callDuration)}`}
              </Text>
            </View>

            {/* Audio Call Controls */}
            <View style={styles.callControlsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsMuted(!isMuted)}
                style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
              >
                {isMuted ? <MicOff size={22} color="#FFFFFF" /> : <Mic size={22} color="#FFFFFF" />}
                <Text style={styles.controlBtnLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
              >
                {isSpeakerOn ? <Volume2 size={22} color="#FFFFFF" /> : <VolumeX size={22} color="#FFFFFF" />}
                <Text style={styles.controlBtnLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode('video')}
                style={styles.controlBtn}
              >
                <Video size={22} color="#FFFFFF" />
                <Text style={styles.controlBtnLabel}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={[styles.controlBtn, styles.endCallBtn]}
              >
                <PhoneOff size={24} color="#FFFFFF" />
                <Text style={[styles.controlBtnLabel, { color: '#F87171' }]}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. VIDEO CALL CHANNEL */}
        {mode === 'video' && (
          <View style={styles.videoContainer}>
            {/* Remote Feed (Client Video) */}
            <View style={styles.remoteVideoWrapper}>
              <Image
                source={{ uri: client.avatar }}
                style={styles.remoteVideoImage}
                blurRadius={Platform.OS === 'ios' ? 1 : 0}
              />
              <View style={styles.videoOverlayGradient}>
                <View style={styles.videoTopBar}>
                  <View style={styles.videoTimerBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.videoTimerText}>
                      {callStatus === 'connecting' ? 'Connecting...' : formatTimer(callDuration)}
                    </Text>
                  </View>

                  <View style={styles.clientTag}>
                    <Text style={styles.clientTagText}>{client.name}</Text>
                  </View>
                </View>

                {/* Picture-in-Picture Advocate Feed */}
                <View style={styles.pipView}>
                  {!isVideoDisabled ? (
                    <Image
                      source={{
                        uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
                      }}
                      style={styles.pipImage}
                    />
                  ) : (
                    <View style={styles.pipDisabled}>
                      <VideoOff size={18} color="#94A3B8" />
                      <Text style={styles.pipDisabledText}>Cam Off</Text>
                    </View>
                  )}
                  <View style={styles.pipLabel}>
                    <Text style={styles.pipLabelText}>You (Advocate)</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Video Call Controls Bar */}
            <View style={styles.videoControlsBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsMuted(!isMuted)}
                style={[styles.videoControlBtn, isMuted && styles.controlBtnActive]}
              >
                {isMuted ? <MicOff size={20} color="#FFFFFF" /> : <Mic size={20} color="#FFFFFF" />}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsVideoDisabled(!isVideoDisabled)}
                style={[styles.videoControlBtn, isVideoDisabled && styles.controlBtnActive]}
              >
                {isVideoDisabled ? <VideoOff size={20} color="#FFFFFF" /> : <Video size={20} color="#FFFFFF" />}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode('chat')}
                style={styles.videoControlBtn}
              >
                <MessageSquare size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {}}
                style={styles.videoControlBtn}
              >
                <RotateCcw size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={[styles.videoControlBtn, styles.endCallBtn]}
              >
                <PhoneOff size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  headerCase: {
    fontSize: 12,
    marginTop: 1,
  },
  modeTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeTab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  consultationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  systemMsgWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMsgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  systemMsgText: {
    fontSize: 11,
    fontWeight: '600',
  },
  msgRow: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '82%',
  },
  msgRowLeft: {
    alignSelf: 'flex-start',
  },
  msgRowRight: {
    alignSelf: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  advocateMsgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  msgSenderTag: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  msgBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleLeft: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  msgBubbleRight: {
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  attachmentTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  attachmentSub: {
    fontSize: 10,
    marginTop: 2,
  },
  msgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
    fontWeight: '500',
  },

  quickPrompts: {
    paddingVertical: 6,
  },
  quickPromptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    borderRadius: 19,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Audio Calling styles
  callContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  callHeaderBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  callCenter: {
    alignItems: 'center',
  },
  pulseRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1E293B88',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  callAvatarLarge: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  callName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  callCaseText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  callStatusText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  callControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1F2937',
  },
  controlBtnActive: {
    backgroundColor: '#EF4444',
  },
  controlBtnLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  endCallBtn: {
    backgroundColor: '#DC2626',
  },
  // Video Calling styles
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  remoteVideoWrapper: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 16,
  },
  videoTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  videoTimerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clientTag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clientTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pipView: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#1F2937',
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  pipDisabled: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  pipDisabledText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  pipLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  pipLabelText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  videoControlsBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  videoControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ClientCommunicationModal;
