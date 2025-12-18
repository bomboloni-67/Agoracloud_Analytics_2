import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const VisualizationPlaceholder = ({ data }) => {
  if (!data || !data.labels || !data.data) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4 text-center text-slate-400">
        <p>No visualization data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Metric Value',
        data: data.data,
        backgroundColor: 'rgba(79, 70, 229, 0.6)', // Indigo-600
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 6, // Rounded bars look more aesthetic
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true, // Set to true to control height via aspect ratio
    aspectRatio: 2.5,          // Higher number = shorter, wider chart (perfect for 100% zoom)
    plugins: {
      legend: {
        display: false,        // Hiding legend for single datasets saves vertical space
      },
      title: {
        display: true,
        text: 'Data Analysis Result',
        font: { size: 14, weight: '600' },
        color: '#64748b'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      {/* Wrapper controls the maximum width and height. 
          mx-auto centers it, and max-w-2xl keeps it from getting too huge.
      */}
      <div className="max-w-2xl mx-auto" style={{ position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default VisualizationPlaceholder;