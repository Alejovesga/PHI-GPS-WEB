import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import makeStyles from '@mui/styles/makeStyles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import { formatTime } from '../common/util/formatter';
import { useDeviceReadonly } from '../common/util/permissions';
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

const DevicesPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const hours12 = usePreference('twelveHourFormat');

  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
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
  const indexOfLast = currentPage * 100;
  const indexOfFirst = indexOfLast - 100;
  // Calcula el número total de páginas
  const totalPages = Math.ceil(items.length / 100);
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <div className={classes.containerMain}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedName')}</TableCell>
              <TableCell>{t('deviceIdentifier')}</TableCell>
              <TableCell>{t('groupParent')}</TableCell>
              <TableCell>{t('sharedPhone')}</TableCell>
              <TableCell>{t('deviceModel')}</TableCell>
              <TableCell>{t('deviceContact')}</TableCell>
              <TableCell>{t('userExpirationTime')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? items.slice(indexOfFirst, indexOfLast).filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.uniqueId}</TableCell>
                <TableCell>{item.groupId ? groups[item.groupId].name : null}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.contact}</TableCell>
                <TableCell>{formatTime(item.expirationTime, 'date', hours12)}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/device"
                    endpoint="devices"
                    setTimestamp={setTimestamp}
                    customActions={[actionConnections]}
                    readonly={deviceReadonly}
                  />
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={7} endAction />)}
          </TableBody>
        </Table>
        <CollectionFab editPath="/settings/device" />
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

export default DevicesPage;
