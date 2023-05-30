import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import makeStyles from '@mui/styles/makeStyles';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import { usePreference } from '../common/util/preferences';
import Pagination from '../reports/components/Pagination';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  containerMain: {
    overflow: 'auto',
  },
  columnAction: {
    width: '10%',
    paddingRight: theme.spacing(1),
  },
  buttonsPagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const UsersPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const hours12 = usePreference('twelveHourFormat');

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace('/');
    } else {
      throw Error(await response.text());
    }
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);
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

  const filteredItems = items.filter(filterByKeyword(searchKeyword));
  const indexOfLast = currentPage * 20;
  const indexOfFirst = indexOfLast - 20;
  const totalPages = Math.ceil(filteredItems.length / 20);
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
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <div className={classes.container}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
        <div className={classes.containerMain}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('sharedName')}</TableCell>
                <TableCell>{t('userEmail')}</TableCell>
                <TableCell>{t('userAdmin')}</TableCell>
                <TableCell>{t('sharedDisabled')}</TableCell>
                <TableCell>{t('userExpirationTime')}</TableCell>
                <TableCell className={classes.columnAction} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (() => {
                const NewItems = filteredItems.length >= (indexOfLast - indexOfFirst) ? filteredItems.slice(indexOfFirst, indexOfLast) : filteredItems;
                return NewItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{formatBoolean(item.administrator, t)}</TableCell>
                    <TableCell>{formatBoolean(item.disabled, t)}</TableCell>
                    <TableCell>{formatTime(item.expirationTime, 'date', hours12)}</TableCell>
                    <TableCell className={classes.columnAction} padding="none">
                      <CollectionActions
                        itemId={item.id}
                        editPath="/settings/user"
                        endpoint="users"
                        setTimestamp={setTimestamp}
                        customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
                      />
                    </TableCell>
                  </TableRow>
                ));
              })() : (
                <TableShimmer columns={6} endAction />
              )}
            </TableBody>
          </Table>
        </div>
        <div className={classes.buttonsPagination}>
          {items.filter(filterByKeyword(searchKeyword)).length >= (indexOfLast - indexOfFirst) && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pagesSection={pagesSection}
            onPageChange={onPageChange}
            onPageSectionChange={onPageSectionChange}
            currentPageSection={currentPageSection}
            onPageSectionChangeBefore={onPageSectionChangeBefore}
          />
          )}
        </div>
        <CollectionFab editPath="/settings/user" />
      </div>
    </PageLayout>
  );
};

export default UsersPage;
