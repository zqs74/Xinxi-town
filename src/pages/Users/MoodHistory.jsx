import MoodTimeline from '../../components/MoodTimeline';

const MoodHistory = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-handwriting text-morandi-purple">心情记录</h1>
          <p className="text-gray-600 mt-2">追踪你的情绪变化</p>
        </div>
        
        <div className="town-card p-6">
          <MoodTimeline />
        </div>
      </div>
    </div>
  );
};

export default MoodHistory;