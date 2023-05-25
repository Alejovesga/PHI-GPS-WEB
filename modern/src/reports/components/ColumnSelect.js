import React from 'react';
import {
  FormControl,
} from '@mui/material';
import Select from 'react-select';
import { useTranslation } from '../../common/components/LocalizationProvider';
import useReportStyles from '../common/useReportStyles';

const ColumnSelect = ({
  columns, setColumns, columnsArray, columnsObject,
}) => {
  const classes = useReportStyles();
  const t = useTranslation();
  const options = columnsArray
    ? columnsArray.map(([key, string]) => ({
      value: key,
      label: t(string),
    }))
    : Object.keys(columnsObject).map((key) => ({
      value: key,
      label: columnsObject[key].name,
    }));
  const handleChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setColumns(selectedValues);
  };
  return (
    <div className={classes.filterItem}>
      <FormControl fullWidth>
        {/* <Select
          label={t('sharedColumns')}
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          multiple
        >
          {columnsArray
            ? columnsArray.map(([key, string]) => (
              <MenuItem key={key} value={key}>{t(string)}</MenuItem>
            ))
            : Object.keys(columnsObject).map((key) => (
              <MenuItem key={key} value={key}>{columnsObject[key].name}</MenuItem>
            ))}
        </Select> */}
        <Select
          placeholder={t('sharedColumns')}
          value={options.filter((option) => columns.includes(option.value))}
          onChange={handleChange}
          isMulti
          options={options}
          menuPortalTarget={document.body}
        />
      </FormControl>
    </div>
  );
};

export default ColumnSelect;
