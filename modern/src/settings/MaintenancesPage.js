import React, { useState, useEffect } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { formatDistance, formatSpeed } from '../common/util/formatter';
import { useAttributePreference } from '../common/util/preferences';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import Pagination from '../reports/components/Pagination';

const useStyles = makeStyles((theme) => ({
  containerMain: {
    overflow: 'auto',
  },
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
  buttonsPagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const MaintenacesPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const speedUnit = useAttributePreference('speedUnit');
  const distanceUnit = useAttributePreference('distanceUnit');

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const convertAttribute = (key, value) => {
    const attribute = positionAttributes[key];
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case 'speed':
          return formatSpeed(value, speedUnit, t);
        case 'distance':
          return formatDistance(value, distanceUnit, t);
        default:
          return value;
      }
    }

    return value;
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSection, setCurrentPageSection] = useState(1);
  useEffect(() => {
    function handlepage() {
      setCurrentPage(1);
    }
    handlepage();
    function handleRangePage() {
      setCurrentPageSection(1);
    }
    handleRangePage();
  }, [items]);
  // Calcula el índice del primer y último registro en cada página
  const indexOfLast = currentPage * 50;
  const indexOfFirst = indexOfLast - 50;
  // Calcula el número total de páginas
  const totalPages = Math.ceil(items.length / 50);
  // Cambia a la página seleccionada
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // cantidad de pagina en seccion
  let pagesSection = [...Array(totalPages).keys()].map((num) => num + 1);
  const indexLastSection = currentPageSection * 10;
  const indexFirstSection = indexLastSection - 10;
  pagesSection = pagesSection.slice(indexFirstSection, indexLastSection);

  const onPageSectionChange = (pageNumber) => {
    setCurrentPageSection(pageNumber);
  };
  const onPageSectionChangeBefore = (pageNumber) => {
    setCurrentPageSection(pageNumber);
  };
  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedMaintenance']}>
      <div className={classes.containerMain}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedName')}</TableCell>
              <TableCell>{t('sharedType')}</TableCell>
              <TableCell>{t('maintenanceStart')}</TableCell>
              <TableCell>{t('maintenancePeriod')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? items.slice(indexOfFirst, indexOfLast).filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{convertAttribute(item.type, item.start)}</TableCell>
                <TableCell>{convertAttribute(item.type, item.period)}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions itemId={item.id} editPath="/settings/maintenance" endpoint="maintenance" setTimestamp={setTimestamp} />
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={5} endAction />)}
          </TableBody>
        </Table>
        <CollectionFab editPath="/settings/maintenance" />
      </div>
      <div className={classes.buttonsPagination}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pagesSection={pagesSection}
          onPageChange={onPageChange}
          onPageSectionChange={onPageSectionChange}
          currentPageSection={currentPageSection}
          onPageSectionChangeBefore={onPageSectionChangeBefore}
        />
      </div>
    </PageLayout>
  );
};

export default MaintenacesPage;
