import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Trophy, Users, BookOpen, Flame, Settings } from 'lucide-react';

export function ProfilePage() {
  const profile = {
    username: 'Forest Explorer',
    avatar: '🍄',
    level: 8,
    totalXP: 2450,
    nextLevelXP: 3000,
    streak: 7,
    joinDate: 'September 2024',
  };

  const achievements = [
    { id: 1, title: 'First Steps', icon: '🌱', unlocked: true, description: 'Complete your first lesson' },
    { id: 2, title: 'Week Warrior', icon: '🔥', unlocked: true, description: '7-day streak' },
    { id: 3, title: 'Mushroom Expert', icon: '🎓', unlocked: true, description: 'Complete 10 lessons' },
    { id: 4, title: 'Perfect Score', icon: '⭐', unlocked: false, description: 'Get 100% on a unit test' },
    { id: 5, title: 'Social Butterfly', icon: '👥', unlocked: false, description: 'Add 5 friends' },
    { id: 6, title: 'Knowledge Seeker', icon: '📚', unlocked: false, description: 'Complete 50 lessons' },
  ];

  const friends = [
    { id: 1, name: 'NatureNerd', avatar: '🌿', xp: 3200, level: 10 },
    { id: 2, name: 'MushroomMike', avatar: '🍄', xp: 2100, level: 7 },
    { id: 3, name: 'ForestFan', avatar: '🌲', xp: 1800, level: 6 },
  ];

  const recentActivity = [
    { id: 1, type: 'lesson', title: 'Completed "Gill Patterns"', xp: 50, time: '2 hours ago' },
    { id: 2, type: 'achievement', title: 'Unlocked "Week Warrior"', time: 'Today' },
    { id: 3, type: 'lesson', title: 'Completed "Cap Shapes & Sizes"', xp: 50, time: 'Yesterday' },
  ];

  const levelProgress = ((profile.totalXP % 1000) / 1000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/30">
                <span className="text-4xl">{profile.avatar}</span>
              </div>
              <div>
                <h1 className="text-primary-foreground mb-1">{profile.username}</h1>
                <p className="text-sm text-primary-foreground/80">Level {profile.level}</p>
                <p className="text-xs text-primary-foreground/70">Joined {profile.joinDate}</p>
              </div>
            </div>
            <button className="text-primary-foreground/80 hover:text-primary-foreground">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Level Progress */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-primary-foreground/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-primary-foreground/90">Level Progress</span>
              <span className="text-sm text-primary-foreground">
                {profile.totalXP} / {profile.nextLevelXP} XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-3 bg-primary-foreground/20" />
            <p className="text-xs text-primary-foreground/70 mt-2">
              {profile.nextLevelXP - profile.totalXP} XP to Level {profile.level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-md mx-auto px-6 -mt-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center border-4 border-primary/20 rounded-2xl bg-card shadow-sm">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl mb-1">{profile.streak}</div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-4 text-center border-4 border-accent/30 rounded-2xl bg-card shadow-sm">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl mb-1">15</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </Card>
          <Card className="p-4 text-center border-4 border-secondary/50 rounded-2xl bg-card shadow-sm">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl mb-1">3</div>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto px-6">
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-2xl h-auto">
            <TabsTrigger
              value="achievements"
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm py-2"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm py-2"
            >
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm py-2"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-3 mt-6">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-4 rounded-2xl border-4 ${
                  achievement.unlocked
                    ? 'bg-card border-primary/20 shadow-sm'
                    : 'bg-muted/30 border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                      achievement.unlocked
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4>{achievement.title}</h4>
                      {achievement.unlocked && (
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="friends" className="space-y-3 mt-6">
            {friends.map((friend) => (
              <Card
                key={friend.id}
                className="p-4 rounded-2xl border-4 border-primary/20 shadow-sm bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <span className="text-2xl">{friend.avatar}</span>
                    </div>
                    <div>
                      <h4 className="mb-1">{friend.name}</h4>
                      <p className="text-sm text-muted-foreground">Level {friend.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm">{friend.xp} XP</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <button className="w-full py-4 border-4 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
              + Add Friends
            </button>
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 mt-6">
            {recentActivity.map((activity) => (
              <Card
                key={activity.id}
                className="p-4 rounded-2xl border-4 border-primary/20 shadow-sm bg-card"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      activity.type === 'achievement'
                        ? 'bg-accent/20 border-accent/40'
                        : 'bg-primary/10 border-primary/20'
                    }`}
                  >
                    <span className="text-xl">
                      {activity.type === 'achievement' ? '🏆' : '📖'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1">{activity.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{activity.time}</span>
                      {activity.xp && (
                        <>
                          <span>•</span>
                          <span className="text-primary">+{activity.xp} XP</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
