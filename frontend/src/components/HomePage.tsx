import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Flame, Zap, Star } from 'lucide-react';

interface HomePageProps {
  onStartLesson: () => void;
}

export function HomePage({ onStartLesson }: HomePageProps) {
  const categories = [
    {
      id: 1,
      title: 'Forest Mushrooms',
      icon: '🌲',
      progress: 65,
      lessons: 12,
      completed: 8,
      color: 'bg-primary/10 border-primary/30',
    },
    {
      id: 2,
      title: 'Edible vs Poisonous',
      icon: '⚠️',
      progress: 40,
      lessons: 15,
      completed: 6,
      color: 'bg-destructive/10 border-destructive/30',
    },
    {
      id: 3,
      title: 'Mushroom Anatomy',
      icon: '🔬',
      progress: 80,
      lessons: 10,
      completed: 8,
      color: 'bg-accent/20 border-accent/40',
    },
    {
      id: 4,
      title: 'Seasonal Guide',
      icon: '🍂',
      progress: 20,
      lessons: 8,
      completed: 2,
      color: 'bg-secondary border-border',
    },
  ];

  const stats = {
    streak: 7,
    totalXP: 2450,
    todayXP: 150,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-foreground/80">Welcome back!</p>
              <h1 className="text-primary-foreground">Forest Explorer</h1>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/30">
              <span className="text-3xl">🍄</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-3 border-2 border-primary-foreground/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-xs text-primary-foreground/80">Streak</span>
              </div>
              <p className="text-2xl text-primary-foreground">{stats.streak}</p>
              <p className="text-xs text-primary-foreground/70">days</p>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-3 border-2 border-primary-foreground/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-xs text-primary-foreground/80">Total XP</span>
              </div>
              <p className="text-2xl text-primary-foreground">{stats.totalXP}</p>
              <p className="text-xs text-primary-foreground/70">points</p>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-3 border-2 border-primary-foreground/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-xs text-primary-foreground/80">Today</span>
              </div>
              <p className="text-2xl text-primary-foreground">+{stats.todayXP}</p>
              <p className="text-xs text-primary-foreground/70">XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2>Learning Paths</h2>
          <Badge variant="secondary" className="rounded-full">4 Active</Badge>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              onClick={onStartLesson}
              className={`p-5 ${category.color} border-4 rounded-3xl hover:scale-[1.02] transition-transform cursor-pointer shadow-sm`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{category.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.completed} of {category.lessons} lessons
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-2 shrink-0"
                    >
                      {category.progress}%
                    </Badge>
                  </div>
                  <Progress value={category.progress} className="h-3 bg-background/50" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Daily Challenge */}
        <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/10 border-4 border-accent/30 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3>Daily Challenge</h3>
              <p className="text-sm text-muted-foreground">Complete to earn +50 XP</p>
            </div>
          </div>
          <button
            onClick={onStartLesson}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors"
          >
            Start Challenge
          </button>
        </Card>
      </div>
    </div>
  );
}
