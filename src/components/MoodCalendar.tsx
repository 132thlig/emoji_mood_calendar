'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/fp';

interface MoodRecord {
  mood?: string;
  tags?: string[];
  note?: string;
}

interface MoodData {
  [key: string]: MoodRecord;
}

const MoodCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [moodData, setMoodData] = useState<MoodData>({});
  const [viewMode, setViewMode] = useState<'calendar' | 'summary'>('calendar'); // View mode 추가

  const emojis = ['😄', '🙂', '😐', '😣', '😢'];
  const tags = [
    '신나는', '편안한', '화나는', '슬픔', '불안한', '추움', '더움', '운동', '독서', '게임', '식사', '여행', '학교', '청소', '휴식',
  ];

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });

  const firstDayOfWeek = startOfMonth(selectedMonth).getDay();
  const blankDays = Array.from({ length: firstDayOfWeek });

  const handleMoodSelect = (mood: string) => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setMoodData((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], mood },
    }));
  };

  const handleTagToggle = (tag: string) => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const currentTags = moodData[dateKey]?.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setMoodData((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], tags: updatedTags },
    }));
  };

  const handleNoteChange = (note: string) => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setMoodData((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], note },
    }));
  };

  if (viewMode === 'summary') {
    // Navigate to MonthlySummary component
    return (
      <MonthlySummary
        moodData={moodData}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onBack={() => setViewMode('calendar')} // Go back to calendar view
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {!selectedDate && (
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() =>
              setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
            }
            className="p-2 hover:bg-gray-100 rounded"
          >
            {"<"}
          </button>
          <h2 className="text-xl font-bold">{format(selectedMonth, 'yyyy년 MM월')}</h2>
          <button
            onClick={() =>
              setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
            }
            className="p-2 hover:bg-gray-100 rounded"
          >
            {">"}
          </button>
        </div>
      )}

      {!selectedDate ? (
        <>
          <div className="grid grid-cols-7 gap-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-500">
                {day}
              </div>
            ))}
            {blankDays.map((_, index) => (
              <div key={`blank-${index}`} className="h-10"></div>
            ))}
            {daysInMonth.map((date) => (
              <div
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className="relative border rounded p-2 h-10 flex flex-col items-center justify-between cursor-pointer"
              >
                <span className="text-sm">{format(date, 'd')}</span>
                {moodData[format(date, 'yyyy-MM-dd')] && (
                  <span className="absolute top-1 right-1 text-2xl">
                    {moodData[format(date, 'yyyy-MM-dd')].mood}
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setViewMode('summary')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            월별 요약 보기
          </button>
        </>
      ) : (
        <div>
          {/* Selected date detail page */}
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">{format(selectedDate, 'yyyy년 MM월 dd일')}</h3>
            <div className="flex space-x-2 mb-4">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(emoji)}
                  className={`text-2xl p-2 rounded hover:bg-gray-100 ${
                    moodData[format(selectedDate, 'yyyy-MM-dd')]?.mood === emoji
                      ? 'bg-gray-200'
                      : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-bold mb-2">태그</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 border rounded-full text-sm ${
                    moodData[format(selectedDate, 'yyyy-MM-dd')]?.tags?.includes(tag)
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-bold mb-2">오늘의 한마디</h4>
            <textarea
              value={moodData[format(selectedDate, 'yyyy-MM-dd')]?.note || ''}
              onChange={(e) => handleNoteChange(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="오늘의 기분이나 생각을 적어보세요..."
            />
          </div>
          <button
            onClick={() => setSelectedDate(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            저장 및 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

const MonthlySummary: React.FC<{
  moodData: MoodData | null;
  selectedMonth: Date;
  setSelectedMonth: React.Dispatch<React.SetStateAction<Date>>;
  onBack: () => void;
}> = ({ moodData, selectedMonth, setSelectedMonth, onBack }) => {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });

  // Filter recorded dates and sort by most recent
  const sortedRecords = daysInMonth
    .filter((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return moodData?.[dateKey];
    })
    .sort((a, b) => b.getTime() - a.getTime()); // Sort by latest date

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() =>
            setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
          }
          className="p-2 hover:bg-gray-100 rounded"
        >
          {"<"}
        </button>
        <h2 className="text-xl font-bold">{format(selectedMonth, 'yyyy년 MM월')}</h2>
        <button
          onClick={() =>
            setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
          }
          className="p-2 hover:bg-gray-100 rounded"
        >
          {">"}
        </button>
      </div>

      {/* Record List */}
      <div className="space-y-4">
        {sortedRecords.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const record = moodData?.[dateKey];

          return (
            <div
              key={dateKey}
              className="border rounded-lg p-4 shadow-sm bg-gray-50 flex items-center justify-between"
            >
              {/* Left section: Date and Emoji */}
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold text-gray-800">{format(date, 'd일')}</span>
                {/* Emoji below the date */}
                <span className="text-2xl mt-2">{record?.mood}</span>
              </div>

              {/* Vertical divider between left and right sections */}
              <div className="border-l border-gray-300 mx-4"></div>

              {/* Right section: Tags and Notes */}
              <div className="flex flex-col items-end">
                <div className="flex flex-wrap gap-2 mb-2">
                  {record?.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Note */}
                <p className="text-gray-700 mt-2 text-sm">{record?.note}</p>
              </div>
            </div>
          );
        })}

        {/* No Records */}
        {sortedRecords.length === 0 && (
          <p className="text-center text-gray-500">이번 달에 기록된 데이터가 없습니다.</p>
        )}
      </div>

      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        돌아가기
      </button>
    </div>
  );
};

export default MoodCalendar;
