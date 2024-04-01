import React, {useState, useEffect} from 'react';
import {
  Typography, useTheme,
} from '@mui/material';

import {DateTime} from 'luxon';

import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as Tooltip2, Legend} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip2, Legend);
import {Line, Bar} from 'react-chartjs-2';

import MetricsService from '../../services/MetricsService';

export default function Graph() {
  const theme = useTheme();
  const [numStudentsPerDayLastWeek, setNumStudentsPerDayLastWeek] = useState([]);
  const [numStudentsPerDay, setNumStudentsPerDay] = useState([]);
  const [numStudentsOverall, setNumStudentsOverall] = useState([]);

  useEffect(() => {
    MetricsService.getNumStudentsPerDayLastWeek().then((res) => {
      setNumStudentsPerDayLastWeek(res.data.numStudentsPerDayLastWeek);
    });

    MetricsService.getNumStudentsPerDay().then((res) => {
      const dataBack = res.data.numStudentsPerDay;
      // sort by day of week
      dataBack.sort((a, b) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(a.day) - days.indexOf(b.day);
      });

      setNumStudentsPerDay(dataBack);
    });

    MetricsService.getNumStudentsOverall().then((res) => {
      setNumStudentsOverall(res.data.numStudentsOverall);
    });
  }, []);

  const dateFormatter = (day) => {
    return DateTime.fromISO(day).toLocaleString({month: 'long', day: 'numeric'});
  };

  return (
    <div>
      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Number of Questions per Day (in the last week)
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Line
          datasetIdKey='numStudentsPerDayLastWeek'
          options={{
            layout: {
              padding: {
                top: 40,
                right: 100,
                bottom: 40,
                left: 50,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    size: 16,
                  },
                },
                grid: {
                  color: theme.palette.divider,
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Students',
                  font: {
                    size: 16,
                  },
                },
                ticks: {
                  autoSkip: true,
                },
                grid: {
                  color: theme.palette.divider,
                },
              },
            },
          }}

          data={{
            labels: numStudentsPerDayLastWeek.map((day) => dateFormatter(day.day)),
            datasets: [
              {
                label: 'Number of Students',
                data: numStudentsPerDayLastWeek.map((day) => day.students),
                fill: false,
                backgroundColor: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                borderWidth: 3,
                tension: 0.3,
              },
            ],
          }}
        />
      </div>

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Number of Questions per Day (semester)
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Line
          datasetIdKey='numStudentsPerDayOverall'
          options={{
            layout: {
              padding: {
                top: 40,
                right: 100,
                bottom: 40,
                left: 50,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    size: 16,
                  },
                },
                grid: {
                  color: theme.palette.divider,
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Students',
                  font: {
                    size: 16,
                  },
                },
                ticks: {
                  autoSkip: true,
                },
                grid: {
                  color: theme.palette.divider,
                },
              },
            },
          }}

          data={{
            labels: numStudentsOverall.map((day) => dateFormatter(day.day)),
            datasets: [
              {
                label: 'Number of Students',
                data: numStudentsOverall.map((day) => day.students),
                fill: false,
                backgroundColor: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                borderWidth: 3,
                tension: 0.3,
              },
            ],
          }}
        />
      </div>

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
      Number of Questions per Day of the Week
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Bar
          datasetIdKey='numStudentsPerDayOfWeek'
          options={{
            layout: {
              padding: {
                top: 40,
                right: 100,
                bottom: 40,
                left: 50,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  font: {
                    size: 16,
                  },
                },
                grid: {
                  color: theme.palette.divider,
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Students',
                  font: {
                    size: 16,
                  },
                },
                ticks: {
                  autoSkip: true,
                },
                grid: {
                  color: theme.palette.divider,
                },
              },
            },
          }}
          data={{
            labels: numStudentsPerDay.map((day) => day.day),
            datasets: [
              {
                label: 'Number of Students',
                data: numStudentsPerDay.map((day) => day.students),
                backgroundColor: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                borderWidth: 3,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
