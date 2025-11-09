import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

export function LeaderboardPage() {
  const currentUser = {
    rank: 15,
    username: 'Forest Explorer',
    avatar: '🍄',
    xp: 2450,
    weeklyXP: 340,
  };

  const leaderboard = [
    { rank: 1, username: 'MushroomMaster', avatar: '👑', xp: 8750, weeklyXP: 890, trend: 'up' },
    { rank: 2, username: 'FungiExpert', avatar: '🧙', xp: 7420, weeklyXP: 765, trend: 'same' },
    { rank: 3, username: 'NatureNerd', avatar: '🌿', xp: 6890, weeklyXP: 654, trend: 'up' },
    { rank: 4, username: 'ForestWalker', avatar: '🌲', xp: 5320, weeklyXP: 543, trend: 'down' },
    { rank: 5, username: 'SporeSeeker', avatar: '🔬', xp: 4890, weeklyXP: 489, trend: 'up' },
    { rank: 6, username: 'WildWanderer', avatar: '🏕️', xp: 4560, weeklyXP: 412, trend: 'up' },
    { rank: 7, username: 'CapCollector', avatar: '🎓', xp: 4120, weeklyXP: 398, trend: 'same' },
    { rank: 8, username: 'GillGuru', avatar: '🌟', xp: 3950, weeklyXP: 367, trend: 'down' },
    { rank: 9, username: 'MycoMaven', avatar: '✨', xp: 3780, weeklyXP: 356, trend: 'up' },
    { rank: 10, username: 'MushroomMike', avatar: '🍄', xp: 3420, weeklyXP: 334, trend: 'same' },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-primary" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-primary-foreground mb-2">Leaderboard</h1>
          <p className="text-sm text-primary-foreground/80">
            Weekly rankings · Resets every Monday
          </p>
        </div>
      </div>

      {/* Your Rank */}
      <div className="max-w-md mx-auto px-6 -mt-4 mb-6">
        <Card className="p-5 bg-gradient-to-br from-accent/20 to-primary/10 border-4 border-accent/40 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3>Your Ranking</h3>
            <Badge className="bg-accent text-accent-foreground rounded-full">
              This Week
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30">
              <span className="text-3xl">{currentUser.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">#{currentUser.rank}</span>
                <h4>{currentUser.username}</h4>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-primary" />
                  <span>{currentUser.xp} XP</span>
                </div>
                <span>•</span>
                <span className="text-primary">+{currentUser.weeklyXP} this week</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Players */}
      <div className="max-w-md mx-auto px-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2>Top Players</h2>
          <Badge variant="outline" className="rounded-full border-2">
            Global
          </Badge>
        </div>

        <div className="space-y-2">
          {leaderboard.map((player, index) => {
            const isTopThree = player.rank <= 3;
            return (
              <Card
                key={player.rank}
                className={`p-4 rounded-2xl border-4 transition-all ${
                  isTopThree
                    ? 'bg-gradient-to-r from-primary/5 to-accent/10 border-primary/30 shadow-md'
                    : 'bg-card border-border/50 hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-10 text-center">
                    <span className={isTopThree ? 'text-2xl' : 'text-xl'}>
                      {getRankBadge(player.rank)}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isTopThree
                        ? 'bg-primary/20 border-primary/40'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <span className="text-2xl">{player.avatar}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="truncate">{player.username}</h4>
                      {getTrendIcon(player.trend)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{player.xp.toLocaleString()} XP</span>
                      <span>•</span>
                      <span className="text-primary">+{player.weeklyXP} weekly</span>
                    </div>
                  </div>

                  {/* Trophy for top 3 */}
                  {isTopThree && (
                    <Trophy
                      className={`w-6 h-6 ${
                        player.rank === 1
                          ? 'text-yellow-500'
                          : player.rank === 2
                          ? 'text-gray-400'
                          : 'text-amber-700'
                      }`}
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* See More */}
        <button className="w-full py-4 border-4 border-dashed border-border rounded-2xl text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
          View Full Rankings
        </button>

        {/* Info Card */}
        <Card className="p-5 bg-secondary/30 border-4 border-secondary rounded-3xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="mb-2">Earn More XP</h4>
              <p className="text-sm text-muted-foreground">
                Complete daily challenges, maintain your streak, and finish lessons to climb the
                leaderboard!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
