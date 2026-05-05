import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Filler,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
  BarController,
  BarElement,
} from 'chart.js'

export default defineNuxtPlugin(() => {
  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    TimeScale,
    Filler,
    Tooltip,
    Legend,
    DoughnutController,
    ArcElement,
    BarController,
    BarElement,
  )
})
