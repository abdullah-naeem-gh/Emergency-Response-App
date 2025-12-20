import { EmergencyKitItem, EmergencyPlan, PreparednessQuiz, preparednessService } from '@/services/PreparednessService';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, ClipboardList, FileText, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'kit' | 'plan' | 'quiz' | 'score';

const CATEGORY_COLORS: Record<EmergencyKitItem['category'], string> = {
  food: '#F59E0B',
  water: '#3B82F6',
  medical: '#EF4444',
  tools: '#8B5CF6',
  documents: '#10B981',
  other: '#6B7280',
};

const CATEGORY_LABELS: Record<EmergencyKitItem['category'], string> = {
  food: 'Food',
  water: 'Water',
  medical: 'Medical',
  tools: 'Tools',
  documents: 'Documents',
  other: 'Other',
};

export default function PreparednessScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('kit');
  const [kitItems, setKitItems] = useState<EmergencyKitItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EmergencyKitItem['category'] | 'all'>('all');
  const [emergencyPlan, setEmergencyPlan] = useState<EmergencyPlan | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [preparednessScore, setPreparednessScore] = useState(0);

  const loadData = useCallback(() => {
    const items = preparednessService.getKitItems();
    const plan = preparednessService.getEmergencyPlan();
    setKitItems(items);
    setEmergencyPlan(plan);
    const score = preparednessService.getPreparednessScore();
    setPreparednessScore(score);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleItem = (itemId: string) => {
    Haptics.selectionAsync();
    preparednessService.toggleKitItem(itemId);
    loadData();
  };

  const handleCategoryChange = (category: EmergencyKitItem['category'] | 'all') => {
    Haptics.selectionAsync();
    setSelectedCategory(category);
  };

  const filteredItems = selectedCategory === 'all'
    ? kitItems
    : kitItems.filter((item) => item.category === selectedCategory);

  const categories: (EmergencyKitItem['category'] | 'all')[] = ['all', 'food', 'water', 'medical', 'tools', 'documents', 'other'];

  const kitCompletion = preparednessService.getKitCompletion();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="mr-3"
            style={{
              minHeight: 44,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-4xl font-bold text-gray-900 mb-1">
              Preparedness
            </Text>
            <Text className="text-gray-600 text-sm">
              {preparednessScore}% Ready
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mt-2">
          {[
            { id: 'kit' as TabType, label: 'Kit', icon: ClipboardList },
            { id: 'plan' as TabType, label: 'Plan', icon: Users },
            { id: 'quiz' as TabType, label: 'Quiz', icon: FileText },
            { id: 'score' as TabType, label: 'Score', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab(tab.id);
                }}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  isActive ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                style={{ minHeight: 36 }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : '#6B7280'} />
                <Text
                  className={`text-sm font-semibold ml-2 ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'kit' && (
          <View className="px-6">
            {/* Kit Completion */}
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">Emergency Kit</Text>
                <Text className="text-2xl font-bold text-blue-600">{kitCompletion}%</Text>
              </View>
              <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <View
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${kitCompletion}%` }}
                />
              </View>
              <Text className="text-gray-600 text-sm mt-2">
                {kitItems.filter((i) => i.checked && i.priority === 'essential').length} of{' '}
                {kitItems.filter((i) => i.priority === 'essential').length} essential items
              </Text>
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ gap: 8, paddingRight: 24 }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category ? 'bg-blue-500' : 'bg-white'
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor: selectedCategory === category ? '#3B82F6' : '#E5E7EB',
                    minHeight: 36,
                  }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === category ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {category === 'all' ? 'All' : CATEGORY_LABELS[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Kit Items List */}
            {filteredItems.map((item) => {
              const categoryColor = CATEGORY_COLORS[item.category];
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleToggleItem(item.id)}
                  className="bg-white rounded-xl p-4 mb-3 flex-row items-center border border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View
                    className="w-6 h-6 rounded-full border-2 items-center justify-center mr-3"
                    style={{
                      borderColor: item.checked ? categoryColor : '#D1D5DB',
                      backgroundColor: item.checked ? categoryColor : 'transparent',
                    }}
                  >
                    {item.checked && <CheckCircle size={16} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold ${
                        item.checked ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-500 text-sm">Qty: {item.quantity}</Text>
                      <View
                        className="ml-3 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.priority === 'essential'
                              ? '#FEE2E2'
                              : item.priority === 'recommended'
                              ? '#FEF3C7'
                              : '#F3F4F6',
                        }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{
                            color:
                              item.priority === 'essential'
                                ? '#DC2626'
                                : item.priority === 'recommended'
                                ? '#D97706'
                                : '#6B7280',
                          }}
                        >
                          {item.priority}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {activeTab === 'plan' && (
          <View className="px-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Emergency Plan</Text>
            {emergencyPlan ? (
              <View className="bg-white rounded-2xl p-6 border border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Family Members</Text>
                {emergencyPlan.familyMembers.map((member) => (
                  <View key={member.id} className="mb-3 pb-3 border-b border-gray-200">
                    <Text className="text-base font-semibold text-gray-900">{member.name}</Text>
                    <Text className="text-gray-600 text-sm">{member.relationship}</Text>
                    <Text className="text-gray-600 text-sm">{member.phone}</Text>
                  </View>
                ))}
                {emergencyPlan.meetingPoint && (
                  <View className="mt-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">Meeting Point</Text>
                    <Text className="text-gray-700">{emergencyPlan.meetingPoint}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-6 border border-gray-200 items-center">
                <Users size={48} color="#9CA3AF" />
                <Text className="text-gray-600 text-center mt-4">
                  No emergency plan created yet
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // Navigate to plan creation
                  }}
                  className="bg-blue-500 rounded-xl px-6 py-3 mt-4"
                  style={{ minHeight: 50 }}
                >
                  <Text className="text-white font-bold">Create Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'quiz' && (
          <View className="px-6">
            {!showQuizResult && currentQuizIndex < preparednessService.getQuiz().length ? (
              <QuizView
                quiz={preparednessService.getQuiz()[currentQuizIndex]}
                selectedAnswer={quizAnswers[preparednessService.getQuiz()[currentQuizIndex].id]}
                onAnswerSelect={(answerIndex) => {
                  Haptics.selectionAsync();
                  const questionId = preparednessService.getQuiz()[currentQuizIndex].id;
                  setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
                }}
                onNext={() => {
                  if (currentQuizIndex < preparednessService.getQuiz().length - 1) {
                    setCurrentQuizIndex(currentQuizIndex + 1);
                  } else {
                    const score = preparednessService.calculateQuizScore(quizAnswers);
                    setQuizScore(score);
                    setShowQuizResult(true);
                  }
                }}
                isLast={currentQuizIndex === preparednessService.getQuiz().length - 1}
              />
            ) : showQuizResult && quizScore ? (
              <QuizResultView score={quizScore} onRestart={() => {
                setCurrentQuizIndex(0);
                setQuizAnswers({});
                setShowQuizResult(false);
                setQuizScore(null);
              }} />
            ) : null}
          </View>
        )}

        {activeTab === 'score' && (
          <View className="px-6">
            <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-2">Preparedness Score</Text>
              <View className="items-center my-6">
                <View className="w-32 h-32 rounded-full bg-blue-100 items-center justify-center">
                  <Text className="text-5xl font-bold text-blue-600">{preparednessScore}%</Text>
                </View>
              </View>
              <Text className="text-gray-600 text-center">
                {preparednessScore >= 80
                  ? 'Excellent! You are well prepared for emergencies.'
                  : preparednessScore >= 60
                  ? 'Good progress! Keep building your emergency kit.'
                  : 'Start building your emergency kit to improve your score.'}
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-6 border border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Recommendations</Text>
              <Text className="text-gray-700 mb-2">• Complete your emergency kit</Text>
              <Text className="text-gray-700 mb-2">• Create a family emergency plan</Text>
              <Text className="text-gray-700 mb-2">• Practice evacuation routes</Text>
              <Text className="text-gray-700">• Review and update your plan regularly</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface QuizViewProps {
  quiz: PreparednessQuiz;
  selectedAnswer: number | undefined;
  onAnswerSelect: (index: number) => void;
  onNext: () => void;
  isLast: boolean;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, selectedAnswer, onAnswerSelect, onNext, isLast }) => {
  return (
    <View className="bg-white rounded-2xl p-6 border border-gray-200">
      <Text className="text-xl font-bold text-gray-900 mb-6">{quiz.question}</Text>
      {quiz.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onAnswerSelect(index)}
          className={`rounded-xl p-4 mb-3 border-2 ${
            selectedAnswer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
          style={{ minHeight: 60 }}
        >
          <Text
            className={`text-base font-medium ${
              selectedAnswer === index ? 'text-blue-700' : 'text-gray-900'
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={onNext}
        disabled={selectedAnswer === undefined}
        className={`rounded-xl py-4 items-center mt-4 ${
          selectedAnswer === undefined ? 'bg-gray-300' : 'bg-blue-500'
        }`}
        style={{ minHeight: 60 }}
      >
        <Text className="text-white font-bold text-lg">
          {isLast ? 'Finish Quiz' : 'Next Question'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface QuizResultViewProps {
  score: { score: number; total: number; percentage: number };
  onRestart: () => void;
}

const QuizResultView: React.FC<QuizResultViewProps> = ({ score, onRestart }) => {
  return (
    <View className="bg-white rounded-2xl p-6 border border-gray-200">
      <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">Quiz Results</Text>
      <View className="items-center my-6">
        <View className="w-32 h-32 rounded-full bg-blue-100 items-center justify-center">
          <Text className="text-5xl font-bold text-blue-600">{score.percentage}%</Text>
        </View>
        <Text className="text-gray-600 text-center mt-4">
          You got {score.score} out of {score.total} questions correct!
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRestart}
        className="bg-blue-500 rounded-xl py-4 items-center mt-4"
        style={{ minHeight: 60 }}
      >
        <Text className="text-white font-bold text-lg">Retake Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

