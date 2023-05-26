import React, { useState } from 'react';
import {
  FormControl, Button, TextField, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Select from 'react-select';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';
import { devicesActions, reportsActions } from '../../store';
import SplitButton from '../../common/components/SplitButton';
import SelectField from '../../common/components/SelectField';
import { useRestriction } from '../../common/util/permissions';

const ReportFilter = ({ children, handleSubmit, handleSchedule, showOnly, ignoreDevice, multiDevice, includeGroups, menuPortalTarget }) => {
  const classes = useReportStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const readonly = useRestriction('readonly');

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const deviceId = useSelector((state) => state.devices.selectedId);
  const deviceIds = useSelector((state) => state.devices.selectedIds);
  const groupIds = useSelector((state) => state.reports.groupIds);
  const period = useSelector((state) => state.reports.period);
  const from = useSelector((state) => state.reports.from);
  const to = useSelector((state) => state.reports.to);
  const [button, setButton] = useState('json');

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();

  const scheduleDisabled = button === 'schedule' && (!description || !calendarId);
  const disabled = (!ignoreDevice && !deviceId && !deviceIds.length && !groupIds.length) || scheduleDisabled;

  const handleClick = (type) => {
    if (type === 'schedule') {
      handleSchedule(deviceIds, groupIds, {
        description,
        calendarId,
        attributes: {},
      });
    } else {
      let selectedFrom;
      let selectedTo;
      switch (period) {
        case 'today':
          selectedFrom = moment().startOf('day');
          selectedTo = moment().endOf('day');
          break;
        case 'yesterday':
          selectedFrom = moment().subtract(1, 'day').startOf('day');
          selectedTo = moment().subtract(1, 'day').endOf('day');
          break;
        case 'thisWeek':
          selectedFrom = moment().startOf('week');
          selectedTo = moment().endOf('week');
          break;
        case 'previousWeek':
          selectedFrom = moment().subtract(1, 'week').startOf('week');
          selectedTo = moment().subtract(1, 'week').endOf('week');
          break;
        case 'thisMonth':
          selectedFrom = moment().startOf('month');
          selectedTo = moment().endOf('month');
          break;
        case 'previousMonth':
          selectedFrom = moment().subtract(1, 'month').startOf('month');
          selectedTo = moment().subtract(1, 'month').endOf('month');
          break;
        default:
          selectedFrom = moment(from, moment.HTML5_FMT.DATETIME_LOCAL);
          selectedTo = moment(to, moment.HTML5_FMT.DATETIME_LOCAL);
          break;
      }

      handleSubmit({
        deviceId,
        deviceIds,
        groupIds,
        from: selectedFrom.toISOString(),
        to: selectedTo.toISOString(),
        calendarId,
        type,
      });
    }
  };
  const options = Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)).map((device) => ({
    value: device.id,
    label: device.name,
  }));
  const handleChange = (selectedOption) => {
    if (multiDevice) {
      const selectedIds = selectedOption.map((option) => option.value);
      dispatch(devicesActions.selectIds(selectedIds));
    } else {
      const selectedId = selectedOption.value;
      dispatch(devicesActions.selectId(selectedId));
    }
  };
  const optionsGroups = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => ({
    value: group.id,
    label: group.name,
  }));
  const handleChangeGroups = (selectedGroupOption) => {
    const selectedGroupIds = selectedGroupOption.map((optionGroup) => optionGroup.value);
    dispatch(reportsActions.updateGroupIds(selectedGroupIds));
  };
  const handleChangePeriod = (selectedPeriodOption) => {
    const selectedPeriod = selectedPeriodOption.value;
    dispatch(reportsActions.updatePeriod(selectedPeriod));
  };
  const optionsPeriod = [
    { value: 'today', label: t('reportToday') },
    { value: 'yesterday', label: t('reportYesterday') },
    { value: 'thisWeek', label: t('reportThisWeek') },
    { value: 'previousWeek', label: t('reportPreviousWeek') },
    { value: 'thisMonth', label: t('reportThisMonth') },
    { value: 'previousMonth', label: t('reportPreviousMonth') },
    { value: 'custom', label: t('reportCustom') },
  ];
  return (
    <div className={classes.filter}>
      {!ignoreDevice && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <Select
              className={classes.selectItem}
              options={options}
              placeholder={t(multiDevice ? 'deviceTitle' : 'reportDevice')}
              value={multiDevice ? options.filter((option) => deviceIds.includes(option.value)) : options.find((option) => option.value === deviceId)}
              onChange={handleChange}
              isMulti={multiDevice}
              menuPortalTarget={menuPortalTarget === 1 ? false : document.body}
            />
          </FormControl>
        </div>
      )}
      {includeGroups && (
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <Select
              options={optionsGroups}
              placeholder={t('settingsGroups')}
              value={optionsGroups.filter((optionGroup) => groupIds.includes(optionGroup.value))}
              onChange={handleChangeGroups}
              isMulti
              menuPortalTarget={menuPortalTarget === 1 ? false : document.body}
            />
          </FormControl>
        </div>
      )}
      {button !== 'schedule' ? (
        <>
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <Select
                options={optionsPeriod}
                placeholder={t('reportPeriod')}
                value={optionsPeriod.find((option) => option.value === period)}
                onChange={handleChangePeriod}
                menuPortalTarget={menuPortalTarget === 1 ? false : document.body}
              />
            </FormControl>
          </div>
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportFrom')}
                type="datetime-local"
                value={from}
                onChange={(e) => dispatch(reportsActions.updateFrom(e.target.value))}
                fullWidth
              />
            </div>
          )}
          {period === 'custom' && (
            <div className={classes.filterItem}>
              <TextField
                label={t('reportTo')}
                type="datetime-local"
                value={to}
                onChange={(e) => dispatch(reportsActions.updateTo(e.target.value))}
                fullWidth
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className={classes.filterItem}>
            <TextField
              value={description || ''}
              onChange={(event) => setDescription(event.target.value)}
              label={t('sharedDescription')}
              fullWidth
            />
          </div>
          <div className={classes.filterItem}>
            <SelectField
              value={calendarId || 0}
              onChange={(event) => setCalendarId(Number(event.target.value))}
              endpoint="/api/calendars"
              label={t('sharedCalendar')}
              fullWidth
            />
          </div>
        </>
      )}
      {children}
      <div className={classes.filterItem}>
        {showOnly ? (
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={() => handleClick('json')}
          >
            <Typography variant="button" noWrap>{t('reportShow')}</Typography>
          </Button>
        ) : (
          <SplitButton
            fullWidth
            variant="outlined"
            color="secondary"
            disabled={disabled}
            onClick={handleClick}
            selected={button}
            setSelected={(value) => setButton(value)}
            options={readonly ? {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
            } : {
              json: t('reportShow'),
              export: t('reportExport'),
              mail: t('reportEmail'),
              schedule: t('reportSchedule'),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ReportFilter;
