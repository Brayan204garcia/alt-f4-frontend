import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  {
    name: 'Lun',
    cruces: 4,
    alertas: 2,
  },
  {
    name: 'Mar',
    cruces: 6,
    alertas: 3,
  },
  {
    name: 'Mie',
    cruces: 5,
    alertas: 2,
  },
  {
    name: 'Jue',
    cruces: 8,
    alertas: 4,
  },
  {
    name: 'Vie',
    cruces: 7,
    alertas: 3,
  },
  {
    name: 'Sab',
    cruces: 3,
    alertas: 1,
  },
  {
    name: 'Dom',
    cruces: 2,
    alertas: 1,
  },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Area
          type='monotone'
          dataKey='cruces'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.15}
        />
        <Area
          type='monotone'
          dataKey='alertas'
          stroke='currentColor'
          className='text-muted-foreground'
          fill='currentColor'
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
