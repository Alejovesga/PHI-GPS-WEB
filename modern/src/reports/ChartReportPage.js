import React, { useState } from 'react';
import {
  FormControl,
} from '@mui/material';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import Select from 'react-select';
import ReportFilter from './components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import {
  altitudeFromMeters, distanceFromMeters, speedFromKnots, volumeFromLiters,
} from '../common/util/converter';
import useReportStyles from './common/useReportStyles';

const ChartReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const hours12 = usePreference('twelveHourFormat');

  const [items, setItems] = useState([]);
  const [type, setType] = useState('speed');

  const values = items.map((it) => it[type]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const positions = await response.json();
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = formatTime(position.fixTime, 'time', hours12);
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (typeof value === 'number') {
            const definition = positionAttributes[key] || {};
            switch (definition.dataType) {
              case 'speed':
                formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                break;
              case 'altitude':
                formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                break;
              case 'distance':
                formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                break;
              case 'volume':
                formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                break;
              case 'hours':
                formatted[key] = (value / 1000).toFixed(2);
                break;
              default:
                formatted[key] = value;
                break;
            }
          }
        });
        return formatted;
      });
      setItems(formattedPositions);
    } else {
      throw Error(await response.text());
    }
  });
  const options = Object.keys(positionAttributes)
    .filter((key) => positionAttributes[key].type === 'number')
    .map((key) => ({
      value: key,
      label: positionAttributes[key].name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : '';
    setType(value);
  };
  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <ReportFilter handleSubmit={handleSubmit} showOnly>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            {/* <Select label={t('reportChartType')} value={type} onChange={(e) => setType(e.target.value)}>
              {Object.keys(positionAttributes).filter((key) => positionAttributes[key].type === 'number').map((key) => (
                <MenuItem key={key} value={key}>{positionAttributes[key].name}</MenuItem>
              ))}
            </Select> */}
            <Select
              instanceId="typeSelect"
              options={options}
              value={options.find((option) => option.value === type)}
              onChange={handleChange}
              placeholder={t('reportChartType')}
            />
          </FormControl>
        </div>
      </ReportFilter>
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
            <LineChart
              data={items}
              margin={{
                top: 10, right: 40, left: 0, bottom: 10,
              }}
            >
              <XAxis dataKey="fixTime" />
              <YAxis type="number" tickFormatter={(value) => value.toFixed(2)} domain={[minValue - valueRange / 5, maxValue + valueRange / 5]} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value, key) => [value, positionAttributes[key].name]} />
              <Line type="monotone" dataKey={type} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageLayout>
  );
};

export default ChartReportPage;
