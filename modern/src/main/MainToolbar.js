import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar, IconButton, OutlinedInput, InputAdornment, Popover, FormControl, FormGroup, FormControlLabel, Checkbox, Badge, ListItemButton, ListItemText, Tooltip,
} from '@mui/material';
import Select from 'react-select';
import { makeStyles, useTheme } from '@mui/styles';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useDeviceReadonly } from '../common/util/permissions';
import DeviceRow from './DeviceRow';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
  },
}));

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
  filteredGroup,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  const deviceStatusCount = (status) => Object.values(filteredGroup).filter((d) => d.status === status).length;
  const options = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)).map((group) => ({
    value: group.id,
    label: group.name,
  }));
  const optionsStatuses = [
    { value: 'online', label: `${t('deviceStatusOnline')} (${deviceStatusCount('online')})` },
    { value: 'offline', label: `${t('deviceStatusOffline')} (${deviceStatusCount('offline')})` },
    { value: 'unknown', label: `${t('deviceStatusUnknown')} (${deviceStatusCount('unknown')})` },
  ];
  const optionsSort = [
    { value: '', label: `${'\u00a0'}` },
    { value: 'name', label: `${t('sharedName')}` },
    { value: 'lastUpdate', label: `${t('deviceLastUpdate')}` },
  ];
  const handleGroupChange = (selectedOptions) => {
    const selectedGroupIds = selectedOptions.map((option) => option.value);
    setFilter({ ...filter, groups: selectedGroupIds });
  };
  const handleStatusChange = (selectedOptions) => {
    const selectedStatuses = selectedOptions.map((option) => option.value);
    setFilter({ ...filter, statuses: selectedStatuses });
  };
  const handleSortChange = (selectedOptions) => {
    setFilterSort(selectedOptions.value);
  };
  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      <IconButton edge="start" onClick={() => setDevicesOpen(!devicesOpen)}>
        {devicesOpen ? <MapIcon /> : <ViewListIcon />}
      </IconButton>
      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setDevicesAnchorEl(null)}
        endAdornment={(
          <InputAdornment position="end">
            <IconButton size="small" edge="end" onClick={() => setFilterAnchorEl(inputRef.current)}>
              <Badge color="info" variant="dot" invisible={!filter.statuses.length && !filter.groups.length}>
                <TuneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </InputAdornment>
        )}
        size="small"
        fullWidth
      />
      <Popover
        open={!!devicesAnchorEl && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: Number(theme.spacing(2).slice(0, -2)),
        }}
        marginThreshold={0}
        PaperProps={{
          style: { width: `calc(${toolbarRef.current?.clientWidth}px - ${theme.spacing(4)})` },
        }}
        elevation={1}
        disableAutoFocus
        disableEnforceFocus
      >
        {filteredDevices.slice(0, 3).map((_, index) => (
          <DeviceRow key={filteredDevices[index].id} data={filteredDevices} index={index} />
        ))}
        {filteredDevices.length > 3 && (
          <ListItemButton alignItems="center" onClick={() => setDevicesOpen(true)}>
            <ListItemText
              primary={t('notificationAlways')}
              style={{ textAlign: 'center' }}
            />
          </ListItemButton>
        )}
      </Popover>
      <Popover
        open={!!filterAnchorEl}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className={classes.filterPanel}>
          <FormControl>
            <Select
              options={options}
              placeholder={t('settingsGroups')}
              value={filter.groups.map((groupId) => ({
                value: groupId,
                label: options.find((option) => option.value === groupId)?.label || '',
              }))}
              onChange={handleGroupChange}
              isMulti
              menuPortalTarget={document.body}
              menuPlacement="auto"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, maxHeight: 200, overflowY: 'auto' }),
              }}
            />
          </FormControl>
          <FormControl>
            <Select
              options={optionsStatuses}
              placeholder={t('deviceStatus')}
              value={filter.statuses.map((statusesId) => ({
                value: statusesId,
                label: optionsStatuses.find((option) => option.value === statusesId)?.label || '',
              }))}
              onChange={handleStatusChange}
              menuPortalTarget={document.body}
              menuPlacement="auto"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, maxHeight: 200, overflowY: 'auto' }),
              }}
              isMulti
            />
          </FormControl>
          <FormControl>
            {/* <Select
              label={t('sharedSortBy')}
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">{'\u00a0'}</MenuItem>
              <MenuItem value="name">{t('sharedName')}</MenuItem>
              <MenuItem value="lastUpdate">{t('deviceLastUpdate')}</MenuItem>
            </Select> */}
            <Select
              options={optionsSort}
              placeholder={t('sharedSortBy')}
              value={optionsSort.find((option) => option.value === filterSort)}
              onChange={handleSortChange}
              displayEmpty
              menuPortalTarget={document.body}
              menuPlacement="auto"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, maxHeight: 200, overflowY: 'auto' }),
              }}
            />
          </FormControl>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={filterMap} onChange={(e) => setFilterMap(e.target.checked)} />}
              label={t('sharedFilterMap')}
            />
          </FormGroup>
        </div>
      </Popover>
      <IconButton edge="end" onClick={() => navigate('/settings/device')} disabled={deviceReadonly}>
        <Tooltip open={!deviceReadonly && Object.keys(devices).length === 0} title={t('deviceRegisterFirst')} arrow>
          <AddIcon />
        </Tooltip>
      </IconButton>
    </Toolbar>
  );
};

export default MainToolbar;
