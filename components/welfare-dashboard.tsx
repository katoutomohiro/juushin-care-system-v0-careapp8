"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface WelfareDashboardProps {
  selectedUser: string
}

export function WelfareDashboard({ selectedUser: _selectedUser }: WelfareDashboardProps) {
  const welfareMetrics = {
    totalServiceHours: 156,
    supportPlanAchievement: 87,
    familySatisfaction: 94,
    healthStability: 91,
    socialParticipation: 78,
    independenceLevel: 65,
  }

  const recentActivities = [
    { time: "09:00", activity: "朝の健康チェック", status: "完了", type: "health" },
    { time: "10:30", activity: "創作活動（絵画）", status: "実施中", type: "activity" },
    { time: "12:00", activity: "昼食介助", status: "予定", type: "care" },
    { time: "14:00", activity: "理学療法", status: "予定", type: "therapy" },
  ]

  const supportTeam = [
    { role: "生活支援員", name: "田中さん", status: "勤務中" },
    { role: "看護師", name: "佐藤さん", status: "勤務中" },
    { role: "理学療法士", name: "山田さん", status: "午後勤務" },
    { role: "相談支援専門員", name: "鈴木さん", status: "オンコール" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">今月のサービス時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{welfareMetrics.totalServiceHours}時間</div>
            <p className="text-sm text-muted-foreground">計画対比: 98%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">支援計画達成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{welfareMetrics.supportPlanAchievement}%</div>
            <Progress value={welfareMetrics.supportPlanAchievement} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">家族満足度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{welfareMetrics.familySatisfaction}%</div>
            <Progress value={welfareMetrics.familySatisfaction} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>本日の活動予定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono">{activity.time}</div>
                    <div className="text-sm font-medium">{activity.activity}</div>
                  </div>
                  <Badge
                    variant={
                      activity.status === "完了" ? "default" : activity.status === "実施中" ? "secondary" : "outline"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>支援チーム</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportTeam.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                  <Badge variant={member.status === "勤務中" ? "default" : "outline"}>{member.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>支援の質指標</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>健康状態安定性</span>
                <span>{welfareMetrics.healthStability}%</span>
              </div>
              <Progress value={welfareMetrics.healthStability} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>社会参加度</span>
                <span>{welfareMetrics.socialParticipation}%</span>
              </div>
              <Progress value={welfareMetrics.socialParticipation} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>自立度向上</span>
                <span>{welfareMetrics.independenceLevel}%</span>
              </div>
              <Progress value={welfareMetrics.independenceLevel} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
