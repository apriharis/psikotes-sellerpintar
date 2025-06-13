"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"

interface TaskAnalyticsProps {
  tasks: Array<{
    status: string
  }>
}

export function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  // Count tasks by status
  const statusCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {})

  // Prepare data for chart
  const data = [
    { name: "To Do", value: statusCounts.TODO || 0, color: "#f1f5f9" },
    { name: "In Progress", value: statusCounts.IN_PROGRESS || 0, color: "#bfdbfe" },
    { name: "Done", value: statusCounts.DONE || 0, color: "#bbf7d0" },
  ]

  // Filter out statuses with zero tasks
  const chartData = data.filter((item) => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No tasks available for analytics
          </div>
        )}
      </CardContent>
    </Card>
  )
}
