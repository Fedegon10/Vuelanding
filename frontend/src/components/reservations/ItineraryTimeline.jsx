import React, { useMemo } from 'react';
import './ItineraryTimeline.css';

const PASTEL_COLORS = ['#B39DDB', '#81C784', '#FFAB91', '#80DEEA', '#F48FB1', '#FFE082', '#A5D6A7', '#90CAF9'];
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const ItineraryTimeline = ({ destinations }) => {
  const { days, months, destinationsWithData } = useMemo(() => {
    if (!destinations || destinations.length === 0) {
      return { days: [], months: [], destinationsWithData: [] };
    }
    
    const tripStartDate = new Date(destinations[0].startDate + 'T00:00:00');
    const tripEndDate = new Date(destinations[destinations.length - 1].endDate + 'T00:00:00');

    const dayList = [];
    let currentDate = new Date(tripStartDate);
    while (currentDate <= tripEndDate) {
      dayList.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const monthList = dayList.reduce((acc, date) => {
      const monthYear = `${MONTH_NAMES[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
      if (!acc[monthYear]) acc[monthYear] = 0;
      acc[monthYear]++;
      return acc;
    }, {});

    const destinationsData = destinations.map((dest, index) => ({
      ...dest,
      color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    }));

    return { days: dayList, months: Object.entries(monthList), destinationsWithData: destinationsData };
  }, [destinations]);

  return (
    <div className="timeline-container card">
      <table className="timeline-table">
        <thead>
          <tr>
            <th className="destination-header-cell">Destino</th>
            {months.map(([month, dayCount]) => (
              <th key={month} colSpan={dayCount} className="month-cell">
                {month}
              </th>
            ))}
          </tr>
          <tr>
            <th className="destination-header-cell"></th>
            {days.map(day => (
              <th key={day.toISOString()} className="day-cell">
                {day.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {destinationsWithData.map((dest, index) => {
            const nextDest = destinationsWithData[index + 1];
            return (
              <tr key={dest.id}>
                <td className="destination-label-cell">
                  <img className="country-flag" src={`https://flagcdn.com/w20/${dest.countryCode.toLowerCase()}.png`} alt="" />
                  {dest.city}
                </td>
                {days.map((day) => {
                  const dayString = day.toISOString().split('T')[0];
                  let cellStyle = {};
                  let isStayDay = dayString >= dest.startDate && dayString <= dest.endDate;

                  if (isStayDay) {
                    const isTravelDay = nextDest && nextDest.startDate === dest.endDate && dayString === dest.endDate;
                    if (isTravelDay) {
                      cellStyle.background = `linear-gradient(to right, ${dest.color} 50%, ${nextDest.color} 50%)`;
                    } else {
                      cellStyle.backgroundColor = dest.color;
                    }
                  }
                  
                  return <td key={dayString} style={cellStyle}><div className="day-marker-content" /></td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ItineraryTimeline;